import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { supportAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings } from "@/composables/useSiteSettings";
import { getSocket } from "@/services/socket";
import { preferenceStorage } from "@/services/storage";

export const useSupportWidget = () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const { siteSettings } = useSiteSettings();

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  const allowedRoutes = [
    "Home",
    "Profile",
    "Subscriptions",
    "Payments",
    "Contact",
    "About",
    "Settings",
    "Privacy",
    "Terms",
    "AdminSettings",
  ];

  const shouldShowWidget = computed(() => route.name && allowedRoutes.includes(route.name));

  const isDesktop = ref(window.innerWidth >= 640);
  const isOpen = ref(false);
  const channels = ref([]);
  const currentView = ref("tickets");
  const myTickets = ref([]);
  const loadingTickets = ref(false);
  const newTicketForm = ref({ subject: "", message: "" });
  const submittingTicket = ref(false);
  const activeTicket = ref(null);
  const activeTicketDetails = ref(null);
  const loadingChat = ref(false);
  const replyMessage = ref("");
  const sendingReply = ref(false);
  const chatContainer = ref(null);
  const isMuted = ref(false);

  let socketClient = null;
  let openWidgetHandler = null;

  const widgetBgColor = computed(() => siteSettings.value.widget_bg_color || "#2563eb");
  const widgetIconColor = computed(() => siteSettings.value.widget_icon_color || "#ffffff");
  const widgetShape = computed(() => siteSettings.value.widget_shape || "circle");
  const widgetSize = computed(() => siteSettings.value.widget_size || "medium");
  const widgetPositionX = computed(() => siteSettings.value.widget_position_x || "left");
  const widgetBottomDesktop = computed(() => siteSettings.value.widget_bottom_desktop || 24);
  const widgetBottomMobile = computed(() => siteSettings.value.widget_bottom_mobile || 112);
  const widgetIcon = computed(() => siteSettings.value.widget_icon || "chat-bubble-left-right");

  const widgetSizeClass = computed(() => {
    switch (widgetSize.value) {
      case "small":
        return "w-10 h-10 sm:w-12 sm:h-12";
      case "large":
        return "w-14 h-14 sm:w-16 sm:h-16";
      case "medium":
      default:
        return "w-12 h-12 sm:w-14 sm:h-14";
    }
  });

  const widgetIconSize = computed(() => {
    switch (widgetSize.value) {
      case "small":
        return "md";
      case "large":
        return "xl";
      case "medium":
      default:
        return "lg";
    }
  });

  const isMessageValid = computed(
    () => newTicketForm.value.message && newTicketForm.value.message.trim().length >= 10
  );

  const updateDesktopState = () => {
    isDesktop.value = window.innerWidth >= 640;
  };

  watch(shouldShowWidget, (newVal) => {
    if (!newVal && isOpen.value) {
      isOpen.value = false;
    }
  });

  const fetchChannels = async () => {
    try {
      const response = await supportAPI.getActiveChannels();
      if (response.success || response.data?.success) {
        channels.value = response.data?.data || response.data || [];
      }
    } catch (error) {
      console.error("Error fetching support channels:", error);
    }
  };

  const getMuteStorageKey = () => {
    const userId = authStore.user?.id || "guest";
    return `support_widget_muted_${userId}`;
  };

  const loadMutePreference = () => {
    isMuted.value = preferenceStorage.getItem(getMuteStorageKey(), false) === true;
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    preferenceStorage.setItem(getMuteStorageKey(), isMuted.value);
  };

  const playNotificationSound = () => {
    if (isMuted.value) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch {
      // تجاهل أخطاء الصوت في المتصفحات المقيدة
    }
  };

  const resetWidgetView = () => {
    setTimeout(() => {
      currentView.value = "tickets";
    }, 300);
  };

  const openTicketsList = async () => {
    currentView.value = "tickets";
    loadingTickets.value = true;
    try {
      const res = await supportAPI.getMyTickets();
      myTickets.value = res.data?.data || [];
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      loadingTickets.value = false;
    }
  };

  const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  };

  const openTicketChat = async (ticket) => {
    activeTicket.value = ticket;
    currentView.value = "chat";
    loadingChat.value = true;
    try {
      const res = await supportAPI.getMyTicketDetails(ticket.id);
      activeTicketDetails.value = res.data?.data || null;
      await scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch ticket details", err);
    } finally {
      loadingChat.value = false;
    }
  };

  const toggleOpen = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value && isAuthenticated.value) {
      void openTicketsList();
    } else if (!isOpen.value) {
      resetWidgetView();
    }
  };

  const closeMenu = (e) => {
    if (isOpen.value) {
      if (!isDesktop.value) return;

      const path = e.composedPath ? e.composedPath() : [];
      const isInsideWidget = path.some(
        (el) => el.classList && el.classList.contains("support-widget")
      );

      if (!isInsideWidget) {
        isOpen.value = false;
        resetWidgetView();
      }
    }
  };

  const getMessageText = (msg) => msg?.message || msg?.content || "";

  const connectRealtime = () => {
    if (!isAuthenticated.value) return;

    socketClient = getSocket();
    socketClient.emit("join_user", authStore.user?.id);

    socketClient.on("ticket_reply", async (messageData) => {
      if (!messageData?.ticket_id) return;

      if (messageData.sender_type === "admin") {
        playNotificationSound();
      }

      const ticketId = messageData.ticket_id;
      const activeTicketId = activeTicket.value?.id;
      if (activeTicketId && activeTicketId === ticketId && activeTicketDetails.value?.messages) {
        const alreadyExists = activeTicketDetails.value.messages.some(
          (item) => item.id === messageData.id
        );
        if (!alreadyExists) {
          activeTicketDetails.value.messages.push(messageData);
          await scrollToBottom();
        }
      }

      await openTicketsList();
    });

    socketClient.on("ticket_status_changed", async (payload) => {
      if (!payload?.ticket_id) return;
      if (activeTicket.value?.id === payload.ticket_id) {
        activeTicket.value = {
          ...activeTicket.value,
          status: payload.status,
        };
      }
      await openTicketsList();
    });
  };

  const disconnectRealtime = () => {
    if (!socketClient) return;
    socketClient.off("ticket_reply");
    socketClient.off("ticket_status_changed");
  };

  onMounted(() => {
    loadMutePreference();
    void fetchChannels();
    document.addEventListener("click", closeMenu);
    window.addEventListener("resize", updateDesktopState);
    connectRealtime();

    openWidgetHandler = (e) => {
      if (!isOpen.value) {
        toggleOpen();
      }
      if (e.detail && e.detail.ticket) {
        setTimeout(() => {
          void openTicketChat(e.detail.ticket);
        }, 300);
      }
    };
    document.addEventListener("open-support-widget", openWidgetHandler);
  });

  onUnmounted(() => {
    document.removeEventListener("click", closeMenu);
    window.removeEventListener("resize", updateDesktopState);
    if (openWidgetHandler) {
      document.removeEventListener("open-support-widget", openWidgetHandler);
    }
    disconnectRealtime();
  });

  const getIconName = (type) => {
    switch (type) {
      case "whatsapp":
        return "chat-bubble-left-right";
      case "phone":
        return "phone";
      case "email":
        return "envelope";
      default:
        return "Globe";
    }
  };

  const getChannelLink = (channel) => {
    if (channel.type === "whatsapp") {
      const cleanNumber = channel.value.replace(/\D/g, "");
      return `https://wa.me/${cleanNumber}`;
    }
    if (channel.type === "phone") {
      return `tel:${channel.value}`;
    }
    if (channel.type === "email") {
      return `mailto:${channel.value}`;
    }
    return channel.value;
  };

  const submitNewTicket = async () => {
    if (!newTicketForm.value.message.trim()) return;
    submittingTicket.value = true;
    try {
      const res = await supportAPI.createTicket({
        subject: `استفسار دعم فني - ${new Date().toLocaleDateString("ar-LY")}`,
        message: newTicketForm.value.message,
      });
      const createdTicket = res.data?.data?.ticket || res.data?.data || null;
      newTicketForm.value = { subject: "", message: "" };
      if (createdTicket?.id) {
        await openTicketChat(createdTicket);
      } else {
        await openTicketsList();
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      submittingTicket.value = false;
    }
  };

  const sendReply = async () => {
    if (!replyMessage.value.trim() || !activeTicket.value) return;
    sendingReply.value = true;
    try {
      await supportAPI.replyToMyTicket(activeTicket.value.id, {
        message: replyMessage.value.trim(),
      });
      replyMessage.value = "";
      await openTicketChat(activeTicket.value);
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      sendingReply.value = false;
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      open: "مفتوحة",
      resolved: "تم الحل",
      closed: "مغلقة",
    };
    return map[status] || status;
  };

  const getStatusClass = (status) => {
    const map = {
      open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-LY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
  };

  return {
    activeTicket,
    activeTicketDetails,
    channels,
    chatContainer,
    currentView,
    formatDate,
    formatTime,
    getChannelLink,
    getIconName,
    getMessageText,
    getStatusClass,
    getStatusLabel,
    isAuthenticated,
    isDesktop,
    isMessageValid,
    isMuted,
    isOpen,
    loadingChat,
    loadingTickets,
    myTickets,
    newTicketForm,
    openTicketChat,
    replyMessage,
    sendReply,
    sendingReply,
    shouldShowWidget,
    submitNewTicket,
    submittingTicket,
    toggleMute,
    toggleOpen,
    widgetBgColor,
    widgetBottomDesktop,
    widgetBottomMobile,
    widgetIcon,
    widgetIconColor,
    widgetIconSize,
    widgetPositionX,
    widgetShape,
    widgetSizeClass,
  };
};
