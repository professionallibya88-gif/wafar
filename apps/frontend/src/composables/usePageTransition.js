import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Composable لتحديد نوع الانتقال بين الصفحات
 * يدعم RTL ويحدد نوع الانتقال بناءً على المسقارن والتنقل
 */
export function usePageTransition() {
  const route = useRoute();

  // تخزين المسقارن السابق لتحديد اتجاه التنقل
  const previousRoute = ref(route.path);
  const transitionDirection = ref("forward");

  // تحديد عمق المسقارن (عدد المستويات)
  const getRouteDepth = (path) => {
    return path.split("/").filter(Boolean).length;
  };

  // تحديد نوع الانتقال بناءً على المسار
  const getTransitionType = (to, from) => {
    // الانتقال من/إلى صفحات المصادقة - استخدام scale
    const authRoutes = ["/login", "/register", "/forgot-password"];
    if (
      authRoutes.some((r) => to.startsWith(r)) ||
      authRoutes.some((r) => from.startsWith(r))
    ) {
      return "scale";
    }

    // الانتقال من/إلى لوحة المدير - استخدام fade
    if (to.startsWith("/admin") || from.startsWith("/admin")) {
      return "fade";
    }

    // الانتقال إلى صفحة تفاصيل - استخدام slide
    if (to.includes("/files/") || to.includes("/compare")) {
      return "slide";
    }

    // الافتراضي - استخدام slide
    return "slide";
  };

  // تحديث اتجاه الانتقال عند تغيير المسار
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (!oldPath) {
        previousRoute.value = newPath;
        return;
      }

      const newDepth = getRouteDepth(newPath);
      const oldDepth = getRouteDepth(oldPath);

      // تحديد الاتجاه بناءً على عمق المسار
      if (newDepth > oldDepth) {
        transitionDirection.value = "forward";
      } else if (newDepth < oldDepth) {
        transitionDirection.value = "back";
      } else {
        // نفس المستوى - استخدام forward افتراضياً
        transitionDirection.value = "forward";
      }

      previousRoute.value = oldPath;
    },
  );

  // خصائص الانتقال الحالية
  const transitionProps = computed(() => ({
    type: getTransitionType(route.path, previousRoute.value),
    direction: transitionDirection.value,
    mode: "out-in",
  }));

  return {
    transitionProps,
    transitionDirection,
    getTransitionType,
  };
}
