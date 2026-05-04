import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import { useThemeStore } from "./stores/theme";
import { useSiteSettings } from "./composables/useSiteSettings";

const bootstrapState = window.__WAFAR_BOOTSTRAP__ || null;
const nextPaint = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });

const pinia = createPinia();
const app = createApp(App);
const themeStore = useThemeStore(pinia);
const { loadSettings } = useSiteSettings();

themeStore.initTheme(bootstrapState);

app.use(pinia);
app.use(router);
app.mount("#app");

void loadSettings();

router.isReady().finally(async () => {
  await nextPaint();
  bootstrapState?.releaseTransitions?.();
  bootstrapState?.markAppReady?.();
});
