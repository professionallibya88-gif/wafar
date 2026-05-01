<template>
  <div ref="container" class="absolute inset-0 w-full h-full overflow-hidden" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const container = ref(null);
let scene, camera, renderer, animationId;
let time = 0;
let backgroundMesh;

const initScene = () => {
  const width = container.value.clientWidth || window.innerWidth;
  const height = container.value.clientHeight || window.innerHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.value.appendChild(renderer.domElement);

  createCinematicBackground();
  createFloatingParticles();
  createLightRays();
  updateBackgroundSize();

  window.addEventListener("resize", onResize);
  animate();
};

const createCinematicBackground = () => {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
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

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 x, int octaves) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.15;

      // Cinematic dark base colors
      vec3 deepBlue = vec3(0.02, 0.04, 0.10);
      vec3 darkNavy = vec3(0.01, 0.03, 0.08);
      vec3 accentCyan = vec3(0.05, 0.25, 0.45);
      vec3 accentBlue = vec3(0.08, 0.18, 0.38);
      vec3 warmGlow = vec3(0.10, 0.20, 0.40);

      // Organic flowing noise
      float n1 = fbm(vec3(uv * 2.5, t * 0.3), 4);
      float n2 = fbm(vec3(uv * 4.0 - vec2(t * 0.2, t * 0.1), t * 0.4), 3);
      float n3 = snoise(vec3(uv * 3.0 + n1, t * 0.2));

      // Layered aurora-like effect
      float aurora1 = smoothstep(-0.2, 0.6, n1 * 0.5 + 0.5);
      float aurora2 = smoothstep(-0.1, 0.4, n2 * 0.4 + 0.5);
      float aurora3 = smoothstep(0.0, 0.3, n3 * 0.3 + 0.5);

      // Base color mixing
      vec3 color = deepBlue;
      color = mix(color, darkNavy, uv.y * 0.5);
      color = mix(color, accentCyan, aurora1 * 0.4);
      color = mix(color, accentBlue, aurora2 * 0.3);
      color = mix(color, warmGlow, aurora3 * 0.25);

      // Cinematic vignette
      vec2 center = uv - 0.5;
      float vignette = 1.0 - dot(center, center) * 1.5;
      vignette = smoothstep(0.0, 1.0, vignette);
      color *= vignette * 0.8 + 0.2;

      // Subtle film grain
      float grain = snoise(vec3(uv * 500.0, uTime * 60.0)) * 0.015;
      color += grain;

      // Color grading - lift blacks slightly for cinematic look
      color = max(color, vec3(0.008));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = {
    uTime: { value: 0.0 },
    uResolution: {
      value: new THREE.Vector2(
        container.value.clientWidth,
        container.value.clientHeight
      ),
    },
  };

  const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });

  backgroundMesh = new THREE.Mesh(geometry, material);
  backgroundMesh.position.z = -5;
  scene.add(backgroundMesh);

  backgroundMesh.userData = { uniforms };
};

const createFloatingParticles = () => {
  const particleCount = 400;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    sizes[i] = 0.02 + Math.random() * 0.06;
    opacities[i] = 0.3 + Math.random() * 0.5;

    velocities.push({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.002 + 0.001,
      z: (Math.random() - 0.5) * 0.001,
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
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying float vOpacity;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha *= vOpacity;
      gl_FragColor = vec4(0.6, 0.8, 1.0, alpha * 0.6);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  particles.userData = { velocities, positions };
};

const createLightRays = () => {
  const rayCount = 5;
  const group = new THREE.Group();

  for (let i = 0; i < rayCount; i++) {
    const geometry = new THREE.PlaneGeometry(0.5, 8, 1, 1);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0.0 },
        uOffset: { value: i * 1.5 },
        uSpeed: { value: 0.3 + Math.random() * 0.4 },
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
        uniform float uOffset;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          float t = uTime * uSpeed + uOffset;
          float fade = sin(vUv.y * 3.14159) * 0.5;
          float pulse = sin(t + vUv.y * 2.0) * 0.3 + 0.7;
          float alpha = fade * pulse * 0.08;
          vec3 color = vec3(0.2, 0.5, 0.9);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 12;
    mesh.position.y = (Math.random() - 0.5) * 6;
    mesh.position.z = -2 + Math.random() * 2;
    mesh.rotation.z = (Math.random() - 0.5) * 0.3;
    group.add(mesh);
  }

  scene.add(group);
  group.userData = { isLightRays: true };
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  time += 0.016;

  // Update shader uniforms
  scene.traverse((child) => {
    if (child.material && child.material.uniforms) {
      if (child.material.uniforms.uTime) {
        child.material.uniforms.uTime.value = time;
      }
    }
  });

  // Animate particles
  scene.traverse((child) => {
    if (child.isPoints && child.userData.velocities) {
      const positions = child.geometry.attributes.position.array;
      const velocities = child.userData.velocities;

      for (let i = 0; i < velocities.length; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        // Wrap around
        if (positions[i * 3 + 1] > 6) positions[i * 3 + 1] = -6;
        if (positions[i * 3 + 1] < -6) positions[i * 3 + 1] = 6;
        if (positions[i * 3] > 10) positions[i * 3] = -10;
        if (positions[i * 3] < -10) positions[i * 3] = 10;
      }
      child.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Slow cinematic camera movement
  camera.position.x = Math.sin(time * 0.08) * 0.3;
  camera.position.y = Math.cos(time * 0.06) * 0.2;
  camera.lookAt(0, 0, -5);

  renderer.render(scene, camera);
};

const updateBackgroundSize = () => {
  if (!backgroundMesh || !camera) return;
  const fovRad = (camera.fov * Math.PI) / 180;
  const dist = Math.abs(camera.position.z - backgroundMesh.position.z);
  const visibleHeight = 2 * Math.tan(fovRad / 2) * dist;
  const visibleWidth = visibleHeight * camera.aspect;
  const padding = 1.15;
  backgroundMesh.scale.set(visibleWidth * padding, visibleHeight * padding, 1);
};

const onResize = () => {
  if (!container.value) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  updateBackgroundSize();

  scene.traverse((child) => {
    if (child.material && child.material.uniforms && child.material.uniforms.uResolution) {
      child.material.uniforms.uResolution.value.set(width, height);
    }
  });
};

const cleanup = () => {
  window.removeEventListener("resize", onResize);
  if (animationId) cancelAnimationFrame(animationId);

  if (renderer) {
    renderer.dispose();
    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement);
    }
  }

  scene.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
};

onMounted(() => {
  initScene();
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
