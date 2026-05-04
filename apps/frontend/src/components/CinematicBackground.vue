<template>
  <div ref="container" class="absolute inset-0 h-full w-full overflow-hidden" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";

const emit = defineEmits(["ready"]);

const PALETTES = {
  dark: {
    base: [0.01, 0.03, 0.08],
    depth: [0.02, 0.08, 0.18],
    glow: [0.08, 0.38, 0.72],
    accent: [0.50, 0.85, 1.0],
    haze: [0.18, 0.35, 0.72],
    particle: [0.70, 0.88, 1.0],
    beam: [0.30, 0.66, 1.0],
  },
};

const container = ref(null);

let scene;
let camera;
let renderer;
let animationId;
let time = 0;
let backdropMesh;
let floorMesh;
let tunnelGroup;
let pillarsGroup;
let particles;
let startupTimerId = null;
let hasEmittedReady = false;

const activePalette = () => PALETTES.dark;

const vectorFromColor = (values) => new THREE.Vector3(values[0], values[1], values[2]);
const colorFromArray = (values) => new THREE.Color(values[0], values[1], values[2]);

const initScene = () => {
  if (!container.value) {
    return;
  }

  const width = container.value.clientWidth || window.innerWidth;
  const height = container.value.clientHeight || window.innerHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.value.appendChild(renderer.domElement);

  createBackdrop();
  createFloor();
  createTunnel();
  createPillars();
  createFloatingParticles();
  updateBackdropSize();
  renderer.render(scene, camera);
  if (!hasEmittedReady) {
    hasEmittedReady = true;
    emit("ready");
  }

  window.addEventListener("resize", onResize);
  animate();
};

const createBackdrop = () => {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uBaseColor;
    uniform vec3 uDepthColor;
    uniform vec3 uGlowColor;
    uniform vec3 uAccentColor;
    uniform vec3 uHazeColor;
    varying vec2 vUv;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    float fbm(vec3 x) {
      float value = 0.0;
      float amplitude = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(x);
        x = x * 2.0 + shift;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;
      vec2 centeredUv = uv - 0.5;
      float t = uTime * 0.09;

      float flowA = fbm(vec3(uv * vec2(2.2, 1.6), t));
      float flowB = fbm(vec3((uv + vec2(t * 0.04, -t * 0.02)) * 3.4, t * 1.1));
      float flowC = snoise(vec3(uv * 4.8 + flowA, t * 0.7));

      float hazeA = smoothstep(-0.16, 0.42, flowA * 0.65 + 0.32);
      float hazeB = smoothstep(-0.10, 0.34, flowB * 0.55 + 0.26);
      float lightSweep = smoothstep(0.0, 1.0, sin((uv.x + t * 0.55) * 6.0) * 0.5 + 0.5) * 0.05;
      float centerGlow = 1.0 - smoothstep(0.10, 0.95, length(centeredUv * vec2(1.0, 1.3)));

      vec3 color = mix(uBaseColor, uDepthColor, uv.y * 0.72 + 0.12);
      color = mix(color, uGlowColor, hazeA * 0.30);
      color = mix(color, uHazeColor, hazeB * 0.20);
      color += uAccentColor * (flowC * 0.02 + lightSweep);
      color += uGlowColor * centerGlow * 0.10;

      float grain = snoise(vec3(uv * uResolution * 0.35, uTime * 48.0)) * 0.012;
      color += grain;

      color = max(color, vec3(0.01));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const palette = activePalette();
  const uniforms = {
    uTime: { value: 0.0 },
    uResolution: {
      value: new THREE.Vector2(
        container.value.clientWidth,
        container.value.clientHeight,
      ),
    },
    uBaseColor: { value: vectorFromColor(palette.base) },
    uDepthColor: { value: vectorFromColor(palette.depth) },
    uGlowColor: { value: vectorFromColor(palette.glow) },
    uAccentColor: { value: vectorFromColor(palette.accent) },
    uHazeColor: { value: vectorFromColor(palette.haze) },
  };

  const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });

  backdropMesh = new THREE.Mesh(geometry, material);
  backdropMesh.position.z = -22;
  backdropMesh.userData = { uniforms };
  scene.add(backdropMesh);
};

const createFloor = () => {
  const palette = activePalette();
  const geometry = new THREE.PlaneGeometry(26, 42, 1, 1);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uGridColor: { value: vectorFromColor(palette.beam) },
      uGlowColor: { value: vectorFromColor(palette.glow) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uGridColor;
      uniform vec3 uGlowColor;
      varying vec2 vUv;

      float line(float value, float width) {
        return 1.0 - smoothstep(0.0, width, abs(fract(value) - 0.5));
      }

      void main() {
        vec2 gridUv = vec2(vUv.x * 18.0, vUv.y * 24.0 + uTime * 1.6);
        float vertical = line(gridUv.x, 0.035) * 0.55;
        float horizontal = line(gridUv.y, 0.045);
        float grid = max(vertical, horizontal);
        float depthFade = pow(1.0 - vUv.y, 2.2);
        float sideFade = smoothstep(0.02, 0.22, vUv.x) * smoothstep(0.02, 0.22, 1.0 - vUv.x);
        float alpha = grid * depthFade * sideFade * 0.55;
        vec3 color = mix(uGridColor, uGlowColor, horizontal * 0.55);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  floorMesh = new THREE.Mesh(geometry, material);
  floorMesh.rotation.x = -Math.PI / 2.55;
  floorMesh.position.set(0, -4.6, -5.5);
  scene.add(floorMesh);
};

const createFloatingParticles = () => {
  const palette = activePalette();
  const particleCount = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  const velocities = [];

  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 12;
    positions[index * 3 + 1] = Math.random() * 8 - 2;
    positions[index * 3 + 2] = -Math.random() * 30;

    sizes[index] = 0.018 + Math.random() * 0.045;
    opacities[index] = 0.14 + Math.random() * 0.35;

    velocities.push({
      x: (Math.random() - 0.5) * 0.0008,
      y: (Math.random() - 0.5) * 0.0008,
      z: 0.055 + Math.random() * 0.06,
    });
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

  const vertexShader = `
    attribute float size;
    attribute float opacity;
    varying float vOpacity;
    void main() {
      vOpacity = opacity;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (280.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uParticleColor;
    varying float vOpacity;
    void main() {
      float distanceToCenter = length(gl_PointCoord - vec2(0.5));
      float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
      alpha *= vOpacity;
      gl_FragColor = vec4(uParticleColor, alpha * 0.55);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uParticleColor: { value: vectorFromColor(palette.particle) },
    },
  });

  particles = new THREE.Points(geometry, material);
  particles.userData = { velocities };
  scene.add(particles);
};

const createTunnelFrame = (width, height, depth, color, opacity) => {
  const shape = new THREE.Shape();
  const radius = 0.45;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  shape.moveTo(-halfWidth + radius, -halfHeight);
  shape.lineTo(halfWidth - radius, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
  shape.lineTo(halfWidth, halfHeight - radius);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
  shape.lineTo(-halfWidth + radius, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
  shape.lineTo(-halfWidth, -halfHeight + radius);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);

  const hole = new THREE.Path();
  const innerInset = 0.18;
  const innerRadius = 0.26;
  hole.moveTo(-halfWidth + innerInset + innerRadius, -halfHeight + innerInset);
  hole.lineTo(halfWidth - innerInset - innerRadius, -halfHeight + innerInset);
  hole.quadraticCurveTo(
    halfWidth - innerInset,
    -halfHeight + innerInset,
    halfWidth - innerInset,
    -halfHeight + innerInset + innerRadius,
  );
  hole.lineTo(halfWidth - innerInset, halfHeight - innerInset - innerRadius);
  hole.quadraticCurveTo(
    halfWidth - innerInset,
    halfHeight - innerInset,
    halfWidth - innerInset - innerRadius,
    halfHeight - innerInset,
  );
  hole.lineTo(-halfWidth + innerInset + innerRadius, halfHeight - innerInset);
  hole.quadraticCurveTo(
    -halfWidth + innerInset,
    halfHeight - innerInset,
    -halfWidth + innerInset,
    halfHeight - innerInset - innerRadius,
  );
  hole.lineTo(-halfWidth + innerInset, -halfHeight + innerInset + innerRadius);
  hole.quadraticCurveTo(
    -halfWidth + innerInset,
    -halfHeight + innerInset,
    -halfWidth + innerInset + innerRadius,
    -halfHeight + innerInset,
  );
  shape.holes.push(hole);

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = depth;
  return mesh;
};

const createTunnel = () => {
  const palette = activePalette();
  tunnelGroup = new THREE.Group();
  const frameColor = colorFromArray(palette.accent);

  for (let index = 0; index < 11; index += 1) {
    const mesh = createTunnelFrame(7.5, 10.6, -index * 3.1, frameColor, 0.10 + index * 0.012);
    mesh.scale.setScalar(1 + index * 0.18);
    mesh.userData = {
      baseZ: -index * 3.1,
      speed: 0.05,
      scale: 1 + index * 0.18,
    };
    tunnelGroup.add(mesh);
  }

  scene.add(tunnelGroup);
};

const createPillars = () => {
  const palette = activePalette();
  pillarsGroup = new THREE.Group();

  for (let side = -1; side <= 1; side += 2) {
    for (let index = 0; index < 9; index += 1) {
      const geometry = new THREE.BoxGeometry(0.12, 3.8 + Math.random() * 1.8, 0.12);
      const material = new THREE.MeshPhysicalMaterial({
        color: colorFromArray(palette.haze),
        emissive: colorFromArray(palette.beam),
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.55,
        roughness: 0.22,
        metalness: 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(side * (3.8 + Math.random() * 0.8), -0.8 + Math.random() * 1.6, -index * 3.8 - 1.5);
      mesh.userData = {
        side,
        baseX: mesh.position.x,
        swayOffset: Math.random() * Math.PI * 2,
      };
      pillarsGroup.add(mesh);
    }
  }

  scene.add(pillarsGroup);
};

const updatePalette = () => {
  const palette = activePalette();

  if (renderer) {
    renderer.toneMappingExposure = 1.0;
  }

  scene?.traverse((child) => {
    if (!child.material?.uniforms) {
      return;
    }

    const { uniforms } = child.material;

    if (uniforms.uBaseColor) {
      uniforms.uBaseColor.value.copy(vectorFromColor(palette.base));
    }
    if (uniforms.uDepthColor) {
      uniforms.uDepthColor.value.copy(vectorFromColor(palette.depth));
    }
    if (uniforms.uGlowColor) {
      uniforms.uGlowColor.value.copy(vectorFromColor(palette.glow));
    }
    if (uniforms.uAccentColor) {
      uniforms.uAccentColor.value.copy(vectorFromColor(palette.accent));
    }
    if (uniforms.uHazeColor) {
      uniforms.uHazeColor.value.copy(vectorFromColor(palette.haze));
    }
    if (uniforms.uParticleColor) {
      uniforms.uParticleColor.value.copy(vectorFromColor(palette.particle));
    }
  });

  tunnelGroup?.children.forEach((child, index) => {
    child.material.color = colorFromArray(palette.accent);
    child.material.opacity = 0.10 + index * 0.012;
  });

  pillarsGroup?.children.forEach((child) => {
    child.material.color = colorFromArray(palette.haze);
    child.material.emissive = colorFromArray(palette.beam);
    child.material.emissiveIntensity = 1.2;
    child.material.opacity = 0.55;
  });
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  time += 0.016;

  scene.traverse((child) => {
    if (child.material?.uniforms?.uTime) {
      child.material.uniforms.uTime.value = time;
    }
  });

  if (particles?.userData?.velocities) {
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.userData.velocities;

    for (let index = 0; index < velocities.length; index += 1) {
      positions[index * 3] += velocities[index].x;
      positions[index * 3 + 1] += velocities[index].y;
      positions[index * 3 + 2] += velocities[index].z;

      if (positions[index * 3 + 2] > 2) {
        positions[index * 3] = (Math.random() - 0.5) * 12;
        positions[index * 3 + 1] = Math.random() * 8 - 2;
        positions[index * 3 + 2] = -30;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  tunnelGroup?.children.forEach((frame) => {
    frame.position.z += frame.userData.speed;
    frame.material.opacity = THREE.MathUtils.clamp(
      0.04 + (12 + frame.position.z) * 0.012,
      0.05,
      0.22,
    );
    if (frame.position.z > 2.8) {
      frame.position.z = -30;
    }
  });

  pillarsGroup?.children.forEach((pillar, index) => {
    pillar.position.z += 0.05;
    pillar.position.x =
      pillar.userData.baseX + Math.sin(time * 0.8 + pillar.userData.swayOffset) * 0.03;
    pillar.material.emissiveIntensity = 1.0 + Math.sin(time * 1.6 + index) * 0.18;

    if (pillar.position.z > 2.5) {
      pillar.position.z = -32 - Math.random() * 6;
    }
  });

  camera.position.x = Math.sin(time * 0.12) * 0.18;
  camera.position.y = Math.cos(time * 0.08) * 0.12;
  camera.lookAt(0, -0.2, -12);

  renderer.render(scene, camera);
};

const updateBackdropSize = () => {
  if (!backdropMesh || !camera) {
    return;
  }

  const fovRad = (camera.fov * Math.PI) / 180;
  const distance = Math.abs(camera.position.z - backdropMesh.position.z);
  const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
  const visibleWidth = visibleHeight * camera.aspect;
  const padding = 1.15;

  backdropMesh.scale.set(visibleWidth * padding, visibleHeight * padding, 1);
};

const onResize = () => {
  if (!container.value || !camera || !renderer) {
    return;
  }

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  updateBackdropSize();

  scene.traverse((child) => {
    if (child.material?.uniforms?.uResolution) {
      child.material.uniforms.uResolution.value.set(width, height);
    }
  });
};

const cleanup = () => {
  window.removeEventListener("resize", onResize);
  if (startupTimerId) {
    window.clearTimeout(startupTimerId);
    startupTimerId = null;
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  scene?.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });

  if (renderer) {
    renderer.dispose();
    if (container.value?.contains(renderer.domElement)) {
      container.value.removeChild(renderer.domElement);
    }
  }

  backdropMesh = null;
  floorMesh = null;
  tunnelGroup = null;
  pillarsGroup = null;
  particles = null;
  scene = null;
  camera = null;
  renderer = null;
};

onMounted(() => {
  startupTimerId = window.setTimeout(() => {
    initScene();
    updatePalette();
  }, 120);
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
div {
  pointer-events: none;
}
</style>
