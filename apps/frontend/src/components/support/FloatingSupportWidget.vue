<template>
  <div 
    v-if="isAuthenticated && shouldShowWidget" 
    class="fixed z-[120] support-widget" 
    :class="[isOpen ? 'inset-0 sm:inset-auto' : '']"
    :style="isOpen && !isDesktop ? {} : {
      bottom: isDesktop ? `${widgetBottomDesktop}px` : `${widgetBottomMobile}px`,
      left: widgetPositionX === 'left' ? '16px' : 'auto',
      right: widgetPositionX === 'right' ? '16px' : 'auto',
    }"
    dir="rtl"
  >
    <!-- خلفية مظللة للموبايل فقط عند فتح المحادثة -->
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 sm:hidden z-[120]" @click="isOpen = false"></div>

    <!-- قائمة القنوات و التذاكر -->
    <transition
      enter-active-class="transition ease-out duration-300 sm:duration-200"
      enter-from-class="opacity-0 translate-y-full sm:translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200 sm:duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full sm:translate-y-4"
    >
      <div
        v-if="isOpen"
        @click.stop
        class="absolute z-[130] sm:mb-3 w-full sm:w-96 bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[85dvh] sm:h-[600px] bottom-0 sm:max-h-[85vh] rounded-t-3xl"
        :style="isDesktop ? {
          bottom: '100%',
          left: widgetPositionX === 'left' ? '0' : 'auto',
          right: widgetPositionX === 'right' ? '0' : 'auto',
          touchAction: 'manipulation'
        } : { left: '0', touchAction: 'manipulation' }"
      >
        <div 
          class="p-4 text-center shrink-0 relative sm:pt-4"
          :style="{ backgroundColor: widgetBgColor, color: widgetIconColor }"
        >
          <!-- مؤشر السحب (Drag Handle) للموبايل -->
          <div class="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/40"></div>
          
          <!-- زر إغلاق للموبايل -->
          <button @click="isOpen = false" class="absolute top-4 left-4 sm:hidden p-1 bg-black/10 rounded-full hover:bg-black/20 transition-colors">
            <AppIcon name="xmark" class="w-5 h-5" />
          </button>
          <h3 class="font-bold text-lg">تواصل معنا</h3>
          <p class="text-sm opacity-90 mt-1">نحن هنا لمساعدتك</p>
        </div>

        <div class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <!-- View: Tickets List -->
          <div v-if="currentView === 'tickets'" class="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div class="p-4 flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0 gap-2">
              <h4 class="flex-1 font-bold text-gray-900 dark:text-white">المحادثات السابقة</h4>
              <span class="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                متصل
              </span>
              <button
                @click="toggleMute"
                class="p-1.5 rounded-full transition-colors"
                :class="isMuted ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'"
                :title="isMuted ? 'تفعيل صوت التنبيهات' : 'كتم صوت التنبيهات'"
              >
                <AppIcon :name="isMuted ? 'Bell' : 'BellAlert'" class="w-5 h-5" />
              </button>
              <button @click="currentView = 'new_ticket'" class="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition-colors" title="محادثة جديدة">
                <AppIcon name="PlusIcon" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-3">
              <div v-if="loadingTickets" class="flex justify-center p-8">
                <BaseSpinner size="sm" />
              </div>
              <div v-else-if="!myTickets.length" class="flex flex-col items-center justify-center p-8 text-center">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <AppIcon name="ChatBubbleLeftRightIcon" class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">لا توجد محادثات سابقة</p>
                <p class="text-xs text-gray-500">ابدأ محادثة جديدة للتواصل مع فريق الدعم</p>
              </div>
              <ul v-else class="space-y-3">
                <li v-for="ticket in myTickets" :key="ticket.id">
                  <button
                    @click="openTicketChat(ticket)"
                    class="w-full text-right bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <span class="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[70%]">{{ ticket.subject }}</span>
                      <span class="text-[10px] px-2 py-1 rounded-full font-medium" :class="getStatusClass(ticket.status)">
                        {{ getStatusLabel(ticket.status) }}
                      </span>
                    </div>
                    <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <AppIcon name="ClockIcon" class="w-3 h-3 ml-1" />
                      {{ formatDate(ticket.updated_at || ticket.created_at) }}
                    </div>
                  </button>
                </li>
              </ul>

              <!-- External Channels -->
              <div v-if="channels.length > 0" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">طرق تواصل أخرى</h4>
                <div class="flex gap-2 flex-wrap">
                  <a
                    v-for="channel in channels" :key="channel.id"
                    :href="getChannelLink(channel)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    <AppIcon :name="channel.icon || getIconName(channel.type)" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    {{ channel.name }}
                  </a>
                </div>
              </div>
            </div>
            <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button
                @click="currentView = 'new_ticket'"
                class="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <AppIcon name="chat-bubble-left-right" class="w-5 h-5" />
                بدء محادثة جديدة
              </button>
            </div>
          </div>

          <!-- View: New Ticket -->
          <div v-else-if="currentView === 'new_ticket'" class="flex flex-col h-full bg-white dark:bg-gray-800">
            <div class="p-2 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0">
              <button @click="currentView = 'tickets'" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <AppIcon name="ArrowRightIcon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h4 class="flex-1 text-center font-medium text-sm text-gray-900 dark:text-white">رسالة جديدة</h4>
              <div class="w-7"></div>
            </div>
            <form @submit.prevent="submitNewTicket" class="p-4 space-y-4 flex-1 flex flex-col">
              <div class="flex-1 relative">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">كيف يمكننا مساعدتك؟</label>
                <textarea v-model="newTicketForm.message" required rows="8" placeholder="اكتب استفسارك هنا وسنرد عليك في أقرب وقت..." class="block w-full p-4 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none select-text"></textarea>
                <p class="absolute bottom-3 left-3 text-[10px]" :class="isMessageValid ? 'text-green-500' : 'text-gray-400'">
                  {{ newTicketForm.message.trim().length }} / 10 حرف كحد أدنى
                </p>
              </div>
              <button
                type="submit"
                :disabled="submittingTicket || !isMessageValid"
                class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                :class="isMessageValid && !submittingTicket ? 'text-white bg-primary-600 hover:bg-primary-700' : 'text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'"
              >
                <BaseSpinner v-if="submittingTicket" size="xs" color="white" />
                <AppIcon v-else name="PaperAirplaneIcon" class="w-4 h-4 transform rotate-180" />
                إرسال
              </button>
            </form>
          </div>

          <!-- View: Ticket Chat -->
          <div v-else-if="currentView === 'chat'" class="flex flex-col h-full bg-white dark:bg-gray-800">
            <div class="p-3 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
              <button @click="currentView = 'tickets'" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <AppIcon name="ArrowRightIcon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div class="flex-1 text-center truncate px-2">
                <h4 class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ activeTicket?.subject }}</h4>
                <span class="text-[10px] text-gray-500">{{ getStatusLabel(activeTicket?.status) }}</span>
              </div>
              <div class="w-8"></div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" ref="chatContainer">
              <div v-if="loadingChat" class="flex justify-center p-4">
                <BaseSpinner size="sm" />
              </div>
              <template v-else>
                <div
                  v-for="msg in activeTicketDetails?.messages"
                  :key="msg.id"
                  class="flex flex-col"
                  :class="msg.sender_type === 'user' ? 'items-start' : 'items-end'"
                >
                  <div
                    class="px-4 py-2.5 max-w-[85%] text-sm shadow-sm"
                    :class="msg.sender_type === 'user' 
                      ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm'"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ getMessageText(msg) }}</p>
                  </div>
                  <span class="text-[10px] text-gray-400 mt-1 mx-1 flex items-center gap-1">
                    <AppIcon name="ClockIcon" class="w-3 h-3" />
                    {{ formatTime(msg.created_at) }}
                  </span>
                </div>
              </template>
            </div>
            
            <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <form @submit.prevent="sendReply" class="flex items-center gap-2">
                <input
                  v-model="replyMessage"
                  type="text"
                  placeholder="اكتب ردك هنا..."
                  :disabled="activeTicket?.status === 'closed'"
                  class="flex-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2.5 px-4 select-text"
                />
                <button
                  type="submit"
                  :disabled="!replyMessage.trim() || sendingReply || activeTicket?.status === 'closed'"
                  class="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors shadow-sm"
                >
                  <BaseSpinner v-if="sendingReply" size="xs" color="white" />
                  <AppIcon v-else name="PaperAirplaneIcon" class="w-5 h-5 transform rotate-180" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </transition>

    <!-- الزر العائم -->
    <button
      v-show="!isOpen || (isOpen && isDesktop)"
      @click="toggleOpen"
      class="fixed sm:relative z-[130] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50"
      :class="[
        isOpen ? 'rotate-180' : '',
        widgetShape === 'square' ? 'rounded-xl' : 'rounded-full',
        widgetSizeClass
      ]"
      :style="isDesktop ? {
        backgroundColor: widgetBgColor, 
        color: widgetIconColor
      } : {
        bottom: isOpen ? '24px' : `${widgetBottomMobile}px`,
        left: widgetPositionX === 'left' ? '16px' : 'auto',
        right: widgetPositionX === 'right' ? '16px' : 'auto',
        backgroundColor: widgetBgColor, 
        color: widgetIconColor
      }"
      aria-label="تواصل معنا"
    >
      <AppIcon v-if="isOpen" name="xmark" :size="widgetIconSize" />
      <AppIcon v-else :name="widgetIcon" :size="widgetIconSize" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { supportAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings } from "@/composables/useSiteSettings";
import { getSocket } from "@/services/socket";
import { preferenceStorage } from "@/services/storage";

const route = useRoute();
const authStore = useAuthStore();
const { siteSettings } = useSiteSettings();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Show widget only on specific pages
const allowedRoutes = ['Home', 'Profile', 'Subscriptions', 'Payments', 'Contact', 'About', 'Settings', 'Privacy', 'Terms', 'AdminSettings'];
const shouldShowWidget = computed(() => {
  return route.name && allowedRoutes.includes(route.name);
});

watch(shouldShowWidget, (newVal) => {
  if (!newVal && isOpen.value) {
    isOpen.value = false;
  }
});

// Check if desktop to manage floating button visibility on mobile when open
const isDesktop = ref(window.innerWidth >= 640);
const updateDesktopState = () => {
  isDesktop.value = window.innerWidth >= 640;
};

// Settings Defaults
const widgetBgColor = computed(() => siteSettings.value.widget_bg_color || '#2563eb');
const widgetIconColor = computed(() => siteSettings.value.widget_icon_color || '#ffffff');
const widgetShape = computed(() => siteSettings.value.widget_shape || 'circle');
const widgetSize = computed(() => siteSettings.value.widget_size || 'medium');
const widgetPositionX = computed(() => siteSettings.value.widget_position_x || 'left');
const widgetBottomDesktop = computed(() => siteSettings.value.widget_bottom_desktop || 24);
const widgetBottomMobile = computed(() => siteSettings.value.widget_bottom_mobile || 112);
const widgetIcon = computed(() => siteSettings.value.widget_icon || 'chat-bubble-left-right');

const widgetSizeClass = computed(() => {
  switch(widgetSize.value) {
    case 'small': return 'w-10 h-10 sm:w-12 sm:h-12';
    case 'large': return 'w-14 h-14 sm:w-16 sm:h-16';
    case 'medium':
    default: return 'w-12 h-12 sm:w-14 sm:h-14';
  }
});

const widgetIconSize = computed(() => {
  switch(widgetSize.value) {
    case 'small': return 'md';
    case 'large': return 'xl';
    case 'medium':
    default: return 'lg';
  }
});

// Main State
const isOpen = ref(false);
const channels = ref([]);

// View State: 'tickets' | 'new_ticket' | 'chat'
const currentView = ref('tickets');

// Tickets State
const myTickets = ref([]);
const loadingTickets = ref(false);
const newTicketForm = ref({ subject: '', message: '' });
const submittingTicket = ref(false);

// Computed validation for new ticket
const isMessageValid = computed(() => {
  return newTicketForm.value.message && newTicketForm.value.message.trim().length >= 10;
});

// Chat State
const activeTicket = ref(null);
const activeTicketDetails = ref(null);
const loadingChat = ref(false);
const replyMessage = ref('');
const sendingReply = ref(false);
const chatContainer = ref(null);
const isMuted = ref(false);

let socketClient = null;
let openWidgetHandler = null;

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
  const userId = authStore.user?.id || 'guest';
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

    oscillator.type = 'sine';
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

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && isAuthenticated.value) {
    openTicketsList();
  } else if (!isOpen.value) {
    // Reset view when closing
    setTimeout(() => {
      currentView.value = 'tickets';
    }, 300);
  }
};

const closeMenu = (e) => {
  if (isOpen.value) {
    if (!isDesktop.value) return; // On mobile, overlay click handles closing

    const path = e.composedPath ? e.composedPath() : [];
    const isInsideWidget = path.some(el => el.classList && el.classList.contains('support-widget'));
    
    if (!isInsideWidget) {
      isOpen.value = false;
      setTimeout(() => {
        currentView.value = 'tickets';
      }, 300);
    }
  }
};

const getMessageText = (msg) => {
  return msg?.message || msg?.content || '';
};

const connectRealtime = () => {
  if (!isAuthenticated.value) return;
  socketClient = getSocket();
  socketClient.emit('join_user', authStore.user?.id);

  socketClient.on('ticket_reply', async (messageData) => {
    if (!messageData?.ticket_id) return;

    if (messageData.sender_type === 'admin') {
      playNotificationSound();
    }

    const ticketId = messageData.ticket_id;
    const activeTicketId = activeTicket.value?.id;
    if (activeTicketId && activeTicketId === ticketId && activeTicketDetails.value?.messages) {
      const alreadyExists = activeTicketDetails.value.messages.some((item) => item.id === messageData.id);
      if (!alreadyExists) {
        activeTicketDetails.value.messages.push(messageData);
        await scrollToBottom();
      }
    }

    await openTicketsList();
  });

  socketClient.on('ticket_status_changed', async (payload) => {
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
  socketClient.off('ticket_reply');
  socketClient.off('ticket_status_changed');
};

onMounted(() => {
  loadMutePreference();
  fetchChannels();
  document.addEventListener("click", closeMenu);
  window.addEventListener('resize', updateDesktopState);

  connectRealtime();

  openWidgetHandler = (e) => {
    if (!isOpen.value) {
      toggleOpen();
    }
    if (e.detail && e.detail.ticket) {
      setTimeout(() => {
        openTicketChat(e.detail.ticket);
      }, 300);
    }
  };
  document.addEventListener('open-support-widget', openWidgetHandler);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
  window.removeEventListener('resize', updateDesktopState);
  if (openWidgetHandler) {
    document.removeEventListener('open-support-widget', openWidgetHandler);
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
  } else if (channel.type === "phone") {
    return `tel:${channel.value}`;
  } else if (channel.type === "email") {
    return `mailto:${channel.value}`;
  }
  return channel.value;
};

// --- Ticketing Logic ---

const openTicketsList = async () => {
  currentView.value = 'tickets';
  loadingTickets.value = true;
  try {
    const res = await supportAPI.getMyTickets();
    myTickets.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to fetch tickets', err);
  } finally {
    loadingTickets.value = false;
  }
};

const submitNewTicket = async () => {
  if (!newTicketForm.value.message.trim()) return;
  submittingTicket.value = true;
  try {
    const res = await supportAPI.createTicket({
      subject: `استفسار دعم فني - ${new Date().toLocaleDateString('ar-LY')}`,
      message: newTicketForm.value.message,
    });
    const createdTicket = res.data?.data?.ticket || res.data?.data || null;
    newTicketForm.value = { subject: '', message: '' };
    // Open the new ticket chat
    if (createdTicket?.id) {
      await openTicketChat(createdTicket);
    } else {
      openTicketsList();
    }
  } catch (err) {
    console.error('Failed to create ticket', err);
  } finally {
    submittingTicket.value = false;
  }
};

const openTicketChat = async (ticket) => {
  activeTicket.value = ticket;
  currentView.value = 'chat';
  loadingChat.value = true;
  try {
    const res = await supportAPI.getMyTicketDetails(ticket.id);
    activeTicketDetails.value = res.data?.data || null;
    scrollToBottom();
  } catch (err) {
    console.error('Failed to fetch ticket details', err);
  } finally {
    loadingChat.value = false;
  }
};

const sendReply = async () => {
  if (!replyMessage.value.trim() || !activeTicket.value) return;
  sendingReply.value = true;
  try {
    await supportAPI.replyToMyTicket(activeTicket.value.id, {
      message: replyMessage.value.trim()
    });
    replyMessage.value = '';
    // Refresh chat
    await openTicketChat(activeTicket.value);
  } catch (err) {
    console.error('Failed to send reply', err);
  } finally {
    sendingReply.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const getStatusLabel = (status) => {
  const map = {
    open: 'مفتوحة',
    resolved: 'تم الحل',
    closed: 'مغلقة',
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = {
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-LY', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
};
</script>
