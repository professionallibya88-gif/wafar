<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">تذاكر الدعم والمراسلات</h1>
      <div class="flex items-center gap-4">
        <!-- Audio Alert Toggle -->
        <button
          @click="toggleMute"
          class="p-2 rounded-full transition-colors flex items-center justify-center border"
          :class="isMuted ? 'border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800' : 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20'"
          :title="isMuted ? 'تفعيل التنبيهات الصوتية' : 'كتم التنبيهات الصوتية'"
        >
          <AppIcon :name="isMuted ? 'Bell' : 'BellAlert'" class="w-5 h-5" />
        </button>

        <!-- Status Filter -->
        <select
          v-model="filters.status"
          class="form-select w-48"
          @change="fetchTickets"
        >
          <option value="">جميع الحالات</option>
          <option value="open">مفتوحة</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="closed">مغلقة</option>
        </select>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <AppIcon name="XCircleIcon" class="h-5 w-5 text-red-400 dark:text-red-300" />
        </div>
        <div class="mr-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            حدث خطأ أثناء جلب التذاكر
          </h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button
              @click="fetchTickets"
              class="rounded-md bg-red-100 dark:bg-red-800 px-2 py-1.5 text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout: List & Chat -->
    <div v-else class="flex gap-6 h-[600px]">
      <!-- Tickets List -->
      <div class="w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 class="font-semibold text-gray-900 dark:text-white">قائمة التذاكر</h2>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading && !tickets.length" class="flex justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
          
          <div v-else-if="!tickets.length" class="text-center p-8 text-gray-500 dark:text-gray-400">
            لا توجد تذاكر حالياً.
          </div>
          
          <ul v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <li
              v-for="ticket in tickets"
              :key="ticket.id"
              @click="selectTicket(ticket)"
              :class="[
                'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                selectedTicket?.id === ticket.id ? 'bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary-500' : ''
              ]"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-sm text-gray-900 dark:text-white truncate max-w-[70%]">
                  {{ ticket.subject }}
                </span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="getStatusClass(ticket.status)"
                >
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center mt-2">
                <span>{{ ticket.user?.full_name || ticket.user?.name || ticket.user?.phone || 'مستخدم' }}</span>
                <span>{{ formatDate(ticket.created_at) }}</span>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Pagination (Simple) -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <button
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
            class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 disabled:opacity-50"
          >
            السابق
          </button>
          <span class="text-xs text-gray-500">صفحة {{ pagination.page }} من {{ pagination.totalPages }}</span>
          <button
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
            class="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>

      <!-- Chat View -->
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <template v-if="selectedTicket">
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <div>
              <h2 class="font-bold text-lg text-gray-900 dark:text-white">{{ selectedTicket.subject }}</h2>
              <div class="flex items-center gap-3 mt-2">
                <span class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <AppIcon name="UserIcon" class="w-4 h-4 text-gray-400" />
                  {{ selectedTicket.user?.full_name || selectedTicket.user?.name || 'غير معروف' }}
                </span>
                <span v-if="selectedTicket.user?.phone" class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300" dir="ltr">
                  <AppIcon name="PhoneIcon" class="w-4 h-4 text-gray-400" />
                  {{ selectedTicket.user.phone }}
                </span>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <span class="text-xs text-gray-500">{{ formatDate(selectedTicket.created_at) }}</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2">
              <select
                v-model="selectedTicket.status"
                @change="updateStatus(selectedTicket.status)"
                class="form-select w-36"
              >
                <option value="open">مفتوحة</option>
                <option value="in_progress">قيد المعالجة</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
            <div v-if="loadingMessages" class="flex justify-center p-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
            
            <template v-else>
              <div
                v-for="msg in selectedTicketDetails?.messages"
                :key="msg.id"
                class="flex flex-col"
                :class="msg.sender_type === 'admin' ? 'items-end' : 'items-start'"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {{ msg.sender_type === 'admin' ? 'الدعم الفني (أنت)' : (selectedTicket.user?.full_name || selectedTicket.user?.name || 'العميل') }}
                  </span>
                  <span class="text-[10px] text-gray-400">{{ formatTime(msg.created_at) }}</span>
                </div>
                <div
                  class="px-4 py-2 rounded-lg max-w-[80%]"
                  :class="msg.sender_type === 'admin' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'"
                >
                  <p class="whitespace-pre-wrap text-sm">{{ msg.message || msg.content }}</p>
                </div>
              </div>
            </template>
          </div>

          <!-- Input Area -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form @submit.prevent="sendMessage" class="flex items-end gap-3">
              <div class="flex-1">
                <label for="reply" class="sr-only">رسالتك</label>
                <textarea
                  id="reply"
                  v-model="newMessage"
                  rows="2"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none"
                  placeholder="اكتب ردك هنا..."
                  @keydown.enter.exact.prevent="sendMessage"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">اضغط Enter للإرسال، Shift+Enter لسطر جديد</p>
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim() || sendingMessage || selectedTicket.status === 'closed'"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="sendingMessage" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                إرسال
                <AppIcon name="PaperAirplaneIcon" class="mr-2 h-4 w-4 transform rotate-180" />
              </button>
            </form>
          </div>
        </template>
        
        <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
          <AppIcon name="ChatBubbleLeftRightIcon" class="h-16 w-16 mb-4 opacity-20" />
          <p>اختر تذكرة من القائمة لعرض المراسلات</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';
import { supportAPI } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { getSocket } from '@/services/socket';

const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// State
const loading = ref(true);
const error = ref(null);
const tickets = ref([]);
const filters = ref({
  status: '',
});
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
});

// Chat State
const selectedTicket = ref(null);
const selectedTicketDetails = ref(null);
const loadingMessages = ref(false);
const newMessage = ref('');
const sendingMessage = ref(false);
const messagesContainer = ref(null);
const isMuted = ref(false);

let socketClient = null;

const getMuteStorageKey = () => {
  const adminId = authStore.user?.id || 'admin';
  return `admin_support_muted_${adminId}`;
};

const loadMutePreference = () => {
  try {
    isMuted.value = localStorage.getItem(getMuteStorageKey()) === '1';
  } catch {
    isMuted.value = false;
  }
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  try {
    localStorage.setItem(getMuteStorageKey(), isMuted.value ? '1' : '0');
  } catch {
    // تجاهل
  }
};

const playNotificationSound = () => {
  if (isMuted.value) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    // نغمة مختلفة للإدارة للتمييز
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // تجاهل
  }
};

// Fetch Tickets
const fetchTickets = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (filters.value.status) {
      params.status = filters.value.status;
    }
    
    const response = await supportAPI.getAdminTickets(params);
    tickets.value = response.data.data;
    
    if (response.data.meta?.pagination) {
      pagination.value = response.data.meta.pagination;
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'فشل في جلب التذاكر';
    notificationStore.error(error.value);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  fetchTickets();
};

// Select Ticket & Fetch Details
const selectTicket = async (ticket) => {
  selectedTicket.value = ticket;
  loadingMessages.value = true;
  
  try {
    const response = await supportAPI.getAdminTicketDetails(ticket.id);
    selectedTicketDetails.value = response.data.data;
    
    // Scroll to bottom
    await nextTick();
    scrollToBottom();
  } catch (err) {
    notificationStore.error('فشل في جلب تفاصيل التذكرة');
  } finally {
    loadingMessages.value = false;
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Send Message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedTicket.value || sendingMessage.value) return;
  
  sendingMessage.value = true;
  try {
    await supportAPI.replyToAdminTicket(selectedTicket.value.id, {
      message: newMessage.value.trim()
    });
    
    // Refresh ticket details to get the new message
    await selectTicket(selectedTicket.value);
    newMessage.value = '';
    
    // If ticket was new/open, backend might have updated status to in_progress, let's refresh list
    fetchTickets();
  } catch (err) {
    notificationStore.error(err.response?.data?.message || 'فشل في إرسال الرسالة');
  } finally {
    sendingMessage.value = false;
  }
};

// Update Status
const updateStatus = async (newStatus) => {
  if (!selectedTicket.value) return;
  
  try {
    await supportAPI.updateTicketStatus(selectedTicket.value.id, newStatus);
    notificationStore.success('تم تحديث حالة التذكرة بنجاح');
    
    // Update in list
    const index = tickets.value.findIndex(t => t.id === selectedTicket.value.id);
    if (index !== -1) {
      tickets.value[index].status = newStatus;
    }
  } catch (err) {
    notificationStore.error(err.response?.data?.message || 'فشل في تحديث حالة التذكرة');
    // Revert status
    fetchTickets();
  }
};

// Helpers
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
  return date.toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-LY', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// WebSocket Logic
const connectRealtime = () => {
  socketClient = getSocket();
  socketClient.emit('join_admin');

  // عندما يستلم الإدمن تذكرة جديدة تماماً
  socketClient.on('new_ticket', async (ticketData) => {
    playNotificationSound();
    notificationStore.info(`تذكرة جديدة: ${ticketData.subject}`);
    await fetchTickets();
  });

  // عندما يرد مستخدم على تذكرة
  socketClient.on('ticket_reply', async (messageData) => {
    if (!messageData?.ticket_id) return;
    
    // إذا كان المرسل ليس أدمن
    if (messageData.sender_type !== 'admin') {
      playNotificationSound();
    }

    const ticketId = messageData.ticket_id;
    
    // تحديث المحادثة النشطة إذا كانت هي نفسها
    if (selectedTicket.value?.id === ticketId && selectedTicketDetails.value?.messages) {
      const alreadyExists = selectedTicketDetails.value.messages.some(m => m.id === messageData.id);
      if (!alreadyExists) {
        selectedTicketDetails.value.messages.push(messageData);
        await nextTick();
        scrollToBottom();
      }
    }

    // تحديث قائمة التذاكر لجلب أحدث تعديل
    await fetchTickets();
  });

  // عند تغير حالة التذكرة
  socketClient.on('ticket_status_changed', async (payload) => {
    if (!payload?.ticket_id) return;
    
    if (selectedTicket.value?.id === payload.ticket_id) {
      selectedTicket.value.status = payload.status;
    }
    
    await fetchTickets();
  });
};

const disconnectRealtime = () => {
  if (!socketClient) return;
  socketClient.off('new_ticket');
  socketClient.off('ticket_reply');
  socketClient.off('ticket_status_changed');
};

onMounted(() => {
  loadMutePreference();
  fetchTickets();
  connectRealtime();
});

onUnmounted(() => {
  disconnectRealtime();
});
</script>
