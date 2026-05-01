<template>
  <div class="fixed bottom-24 lg:bottom-6 left-6 z-50 support-widget" dir="rtl">
    <!-- قائمة القنوات و التذاكر -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-16 left-0 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[500px]"
      >
        <div 
          class="p-4 text-center shrink-0"
          :style="{ backgroundColor: widgetBgColor, color: widgetIconColor }"
        >
          <h3 class="font-bold text-lg">تواصل معنا</h3>
          <p class="text-sm opacity-90 mt-1">نحن هنا لمساعدتك</p>
        </div>

        <div class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <!-- View: Main Menu -->
          <div v-if="currentView === 'menu'" class="p-2 space-y-2">
            
            <!-- External Channels -->
            <div v-if="channels.length > 0" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-gray-800/50">قنوات التواصل</h4>
              <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                <li v-for="channel in channels" :key="channel.id">
                  <a
                    :href="getChannelLink(channel)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div
                      class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 ml-3 shrink-0"
                    >
                      <AppIcon :name="channel.icon || getIconName(channel.type)" class="w-4 h-4" />
                    </div>
                    <div class="flex-1 min-w-0 text-right">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ channel.name }}
                      </p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Internal Ticketing -->
            <div v-if="isAuthenticated" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 bg-gray-50 dark:bg-gray-800/50">الدعم الفني المباشر</h4>
              <button
                @click="openTicketsList"
                class="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-right"
              >
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ml-3 shrink-0">
                  <AppIcon name="TicketIcon" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">تذاكر الدعم الخاصة بي</p>
                </div>
                <AppIcon name="ChevronLeftIcon" class="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div v-else class="text-center p-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">سجل الدخول لفتح تذكرة دعم فني</p>
              <router-link to="/login" class="text-sm text-primary-600 hover:underline">تسجيل الدخول</router-link>
            </div>

          </div>

          <!-- View: Tickets List -->
          <div v-else-if="currentView === 'tickets'" class="flex flex-col h-full">
            <div class="p-2 flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <button @click="currentView = 'menu'" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <AppIcon name="ArrowRightIcon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h4 class="flex-1 text-center font-medium text-sm text-gray-900 dark:text-white">تذاكري</h4>
              <button @click="currentView = 'new_ticket'" class="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full" title="تذكرة جديدة">
                <AppIcon name="PlusIcon" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-2">
              <div v-if="loadingTickets" class="flex justify-center p-4">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
              <div v-else-if="!myTickets.length" class="text-center p-4 text-sm text-gray-500">
                لا توجد تذاكر سابقة
              </div>
              <ul v-else class="space-y-2">
                <li v-for="ticket in myTickets" :key="ticket.id">
                  <button
                    @click="openTicketChat(ticket)"
                    class="w-full text-right bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
                  >
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[70%]">{{ ticket.subject }}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded" :class="getStatusClass(ticket.status)">
                        {{ getStatusLabel(ticket.status) }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(ticket.updated_at || ticket.created_at) }}
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- View: New Ticket -->
          <div v-else-if="currentView === 'new_ticket'" class="flex flex-col h-full bg-white dark:bg-gray-800">
            <div class="p-2 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0">
              <button @click="currentView = 'tickets'" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <AppIcon name="ArrowRightIcon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h4 class="flex-1 text-center font-medium text-sm text-gray-900 dark:text-white">تذكرة جديدة</h4>
              <div class="w-7"></div>
            </div>
            <form @submit.prevent="submitNewTicket" class="p-4 space-y-4 flex-1">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">الموضوع</label>
                <input v-model="newTicketForm.subject" required type="text" class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">الرسالة</label>
                <textarea v-model="newTicketForm.message" required rows="4" class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none"></textarea>
              </div>
              <button
                type="submit"
                :disabled="submittingTicket"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <span v-if="submittingTicket" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></span>
                إرسال
              </button>
            </form>
          </div>

          <!-- View: Ticket Chat -->
          <div v-else-if="currentView === 'chat'" class="flex flex-col h-[400px] bg-white dark:bg-gray-800">
            <div class="p-2 flex items-center border-b border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
              <button @click="currentView = 'tickets'" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <AppIcon name="ArrowRightIcon" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div class="flex-1 text-center truncate px-2">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ activeTicket?.subject }}</h4>
                <span class="text-[10px] text-gray-500">{{ getStatusLabel(activeTicket?.status) }}</span>
              </div>
              <div class="w-7"></div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900" ref="chatContainer">
              <div v-if="loadingChat" class="flex justify-center p-4">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
              <template v-else>
                <div
                  v-for="msg in activeTicketDetails?.messages"
                  :key="msg.id"
                  class="flex flex-col"
                  :class="msg.sender_type === 'user' ? 'items-end' : 'items-start'"
                >
                  <div
                    class="px-3 py-1.5 rounded-lg max-w-[85%] text-sm"
                    :class="msg.sender_type === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-tl-none'"
                  >
                    <p class="whitespace-pre-wrap">{{ msg.message }}</p>
                  </div>
                  <span class="text-[9px] text-gray-400 mt-0.5 mx-1">{{ formatTime(msg.created_at) }}</span>
                </div>
              </template>
            </div>
            
            <div class="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <form @submit.prevent="sendReply" class="flex items-center gap-2">
                <input
                  v-model="replyMessage"
                  type="text"
                  placeholder="اكتب رسالتك..."
                  :disabled="activeTicket?.status === 'closed'"
                  class="flex-1 block w-full rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 px-3"
                />
                <button
                  type="submit"
                  :disabled="!replyMessage.trim() || sendingReply || activeTicket?.status === 'closed'"
                  class="p-1.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <AppIcon name="PaperAirplaneIcon" class="w-4 h-4 transform rotate-180" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </transition>

    <!-- الزر العائم -->
    <button
      @click="toggleOpen"
      class="flex items-center justify-center w-14 h-14 text-white shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50"
      :class="[
        isOpen ? 'rotate-180' : '',
        widgetShape === 'square' ? 'rounded-xl' : 'rounded-full'
      ]"
      :style="{ backgroundColor: widgetBgColor, color: widgetIconColor }"
      aria-label="تواصل معنا"
    >
      <AppIcon v-if="isOpen" name="xmark" size="lg" />
      <AppIcon v-else name="chat-bubble-left-right" size="lg" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { supportAPI } from "@/services/api";
import AppIcon from "@/components/icons/AppIcon.vue";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings } from "@/composables/useSiteSettings";

const authStore = useAuthStore();
const { siteSettings } = useSiteSettings();

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Settings Defaults
const widgetBgColor = computed(() => siteSettings.value.widget_bg_color || '#2563eb');
const widgetIconColor = computed(() => siteSettings.value.widget_icon_color || '#ffffff');
const widgetShape = computed(() => siteSettings.value.widget_shape || 'circle');

// Main State
const isOpen = ref(false);
const channels = ref([]);
const isLoading = ref(true);

// View State: 'menu' | 'tickets' | 'new_ticket' | 'chat'
const currentView = ref('menu');

// Tickets State
const myTickets = ref([]);
const loadingTickets = ref(false);
const newTicketForm = ref({ subject: '', message: '' });
const submittingTicket = ref(false);

// Chat State
const activeTicket = ref(null);
const activeTicketDetails = ref(null);
const loadingChat = ref(false);
const replyMessage = ref('');
const sendingReply = ref(false);
const chatContainer = ref(null);

const fetchChannels = async () => {
  try {
    isLoading.value = true;
    const response = await supportAPI.getActiveChannels();
    if (response.success || response.data?.success) {
      channels.value = response.data?.data || response.data || [];
    }
  } catch (error) {
    console.error("Error fetching support channels:", error);
  } finally {
    isLoading.value = false;
  }
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (!isOpen.value) {
    // Reset view when closing
    setTimeout(() => {
      currentView.value = 'menu';
    }, 300);
  }
};

const closeMenu = (e) => {
  if (isOpen.value && !e.target.closest(".support-widget")) {
    isOpen.value = false;
    setTimeout(() => {
      currentView.value = 'menu';
    }, 300);
  }
};

onMounted(() => {
  fetchChannels();
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
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
  if (!newTicketForm.value.subject.trim() || !newTicketForm.value.message.trim()) return;
  submittingTicket.value = true;
  try {
    const res = await supportAPI.createTicket({
      subject: newTicketForm.value.subject,
      message: newTicketForm.value.message,
    });
    newTicketForm.value = { subject: '', message: '' };
    // Open the new ticket chat
    if (res.data?.data?.ticket) {
      await openTicketChat(res.data.data.ticket);
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
    in_progress: 'قيد المعالجة',
    closed: 'مغلقة',
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const map = {
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
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
