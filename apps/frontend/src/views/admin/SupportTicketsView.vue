<template>
  <div class="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
    <!-- Header Section -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">تذاكر الدعم والمراسلات</h1>
        <span v-if="pagination.total > 0" class="px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-xs font-medium rounded-full">
          {{ pagination.total }} تذكرة
        </span>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <div class="relative flex-1 sm:w-64">
          <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <AppIcon name="MagnifyingGlassIcon" class="w-4 h-4" />
          </span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="بحث بالاسم، الهاتف، الموضوع..."
            class="block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary-500 focus:border-primary-500 transition-all"
            @input="debounceSearch"
          />
        </div>

        <!-- Audio Alert Toggle -->
        <button
          @click="toggleMute"
          class="p-2 rounded-lg transition-all flex items-center justify-center border shadow-sm"
          :class="isMuted ? 'border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800' : 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20'"
          :title="isMuted ? 'تفعيل التنبيهات الصوتية' : 'كتم التنبيهات الصوتية'"
        >
          <AppIcon :name="isMuted ? 'BellSlashIcon' : 'BellAlertIcon'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Main Content: Split View -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar: Tickets List -->
      <div 
        :class="[
          'w-full lg:w-96 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 z-20',
          selectedTicket ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <!-- Filter Bar -->
        <div class="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-2 overflow-x-auto no-scrollbar">
          <button 
            v-for="status in statusFilters" 
            :key="status.value"
            @click="filters.status = status.value; fetchTickets()"
            class="whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all"
            :class="filters.status === status.value 
              ? 'bg-primary-600 text-white shadow-sm' 
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'"
          >
            {{ status.label }}
          </button>
        </div>

        <!-- List Area -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div v-if="loading && !tickets.length" class="flex flex-col items-center justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
            <p class="text-sm text-gray-500">جاري تحميل التذاكر...</p>
          </div>
          
          <div v-else-if="!tickets.length" class="flex flex-col items-center justify-center p-12 text-center">
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
              <AppIcon name="InboxIcon" class="h-10 w-10 text-gray-400" />
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium">لا توجد تذاكر حالياً</p>
            <p class="text-xs text-gray-400 mt-1">جرب تغيير الفلاتر أو البحث</p>
          </div>
          
          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              @click="selectTicket(ticket)"
              :class="[
                'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all relative border-r-4',
                selectedTicket?.id === ticket.id 
                  ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-600 shadow-inner' 
                  : 'border-transparent'
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                  {{ ticket.subject }}
                </span>
                <span
                  class="mr-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="getStatusClass(ticket.status)"
                >
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </div>

              <div class="flex items-center gap-2 mb-2">
                <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold shrink-0">
                  {{ getUserInitials(ticket.user) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                      {{ ticket.user?.full_name || 'مستخدم' }}
                    </span>
                    <span v-if="ticket.user?.role" class="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                      {{ getRoleLabel(ticket.user.role) }}
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {{ ticket.user?.phone || 'بدون هاتف' }}
                  </p>
                </div>
              </div>

              <div class="flex justify-between items-center mt-1">
                <span class="text-[10px] text-gray-400 flex items-center gap-1">
                  <AppIcon name="CalendarIcon" class="w-3 h-3" />
                  {{ formatDate(ticket.created_at) }}
                </span>
                <span v-if="ticket.unread_count > 0" class="h-5 w-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {{ ticket.unread_count }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination Area -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <button
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
            class="p-2 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <AppIcon name="ChevronRightIcon" class="w-5 h-5" />
          </button>
          
          <div class="flex items-center gap-1">
            <span class="text-xs font-bold text-gray-900 dark:text-white">{{ pagination.page }}</span>
            <span class="text-xs text-gray-400">/</span>
            <span class="text-xs text-gray-500">{{ pagination.totalPages }}</span>
          </div>

          <button
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
            class="p-2 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <AppIcon name="ChevronLeftIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div 
        :class="[
          'flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative',
          !selectedTicket ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <template v-if="selectedTicket">
          <!-- Chat Header -->
          <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-10">
            <div class="flex items-center gap-3 min-w-0">
              <button 
                @click="selectedTicket = null" 
                class="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <AppIcon name="ArrowRightIcon" class="w-5 h-5" />
              </button>
              
              <div class="flex items-center gap-3 truncate">
                <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shrink-0">
                  {{ getUserInitials(selectedTicket.user) }}
                </div>
                <div class="truncate">
                  <h2 class="font-bold text-gray-900 dark:text-white truncate">{{ selectedTicket.subject }}</h2>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ selectedTicket.user?.full_name }}</span>
                    <span class="text-gray-300 dark:text-gray-600">•</span>
                    <span class="text-[10px] text-gray-400" dir="ltr">{{ selectedTicket.user?.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <BaseSelect
                v-model="selectedTicket.status"
                select-class="form-select text-xs py-1.5 min-w-[120px]"
                @change="updateStatus(selectedTicket.status)"
                :options="[
                  { label: 'مفتوحة', value: 'open' },
                  { label: 'تم الحل', value: 'resolved' },
                  { label: 'مغلقة', value: 'closed' },
                ]"
              />
            </div>
          </div>

          <!-- Messages Area -->
          <div 
            class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" 
            ref="messagesContainer"
            @scroll="handleChatScroll"
          >
            <div v-if="loadingMessages" class="flex justify-center p-8">
              <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span class="text-xs text-gray-500">جاري تحميل الرسائل...</span>
              </div>
            </div>
            
            <template v-else>
              <div v-if="!selectedTicketDetails?.messages?.length" class="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                <AppIcon name="ChatBubbleOvalLeftIcon" class="w-16 h-16 mb-2" />
                <p>لا توجد رسائل بعد</p>
              </div>

              <div
                v-for="(msg, index) in selectedTicketDetails?.messages"
                :key="msg.id"
                class="flex flex-col"
                :class="msg.sender_type === 'admin' ? 'items-end' : 'items-start'"
              >
                <!-- Date Separator -->
                <div v-if="shouldShowDateSeparator(index)" class="w-full flex justify-center my-6">
                  <span class="px-3 py-1 bg-gray-200/50 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 rounded-full">
                    {{ getFriendlyDate(msg.created_at) }}
                  </span>
                </div>

                <div class="flex flex-col max-w-[85%] sm:max-w-[70%] group">
                  <div 
                    class="flex items-center gap-2 mb-1 px-1"
                    :class="msg.sender_type === 'admin' ? 'flex-row-reverse' : ''"
                  >
                    <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {{ msg.sender_type === 'admin' ? 'أنت' : (selectedTicket.user?.full_name || 'العميل') }}
                    </span>
                    <span class="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {{ formatTime(msg.created_at) }}
                    </span>
                  </div>
                  
                  <div
                    class="px-4 py-2.5 rounded-2xl shadow-sm text-sm relative"
                    :class="msg.sender_type === 'admin' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'"
                  >
                    <p class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
                    <div 
                      class="text-[9px] mt-1 text-left"
                      :class="msg.sender_type === 'admin' ? 'text-primary-100' : 'text-gray-400'"
                    >
                      {{ formatTime(msg.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Scroll to Bottom Button -->
          <button 
            v-if="showScrollBottom"
            @click="scrollToBottom(true)"
            class="absolute bottom-24 left-6 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-primary-600 hover:text-primary-700 transition-all z-20"
          >
            <AppIcon name="ChevronDownIcon" class="w-6 h-6" />
          </button>

          <!-- Input Area -->
          <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div v-if="selectedTicket.status === 'closed'" class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-sm mb-3">
              <AppIcon name="LockClosedIcon" class="w-5 h-5 shrink-0" />
              <p>هذه التذكرة مغلقة. يمكنك إعادة فتحها من القائمة العلوية لإرسال ردود.</p>
            </div>

            <form @submit.prevent="sendMessage" class="flex items-end gap-3">
              <div class="flex-1 relative">
                <textarea
                  id="reply"
                  v-model="newMessage"
                  rows="1"
                  ref="inputField"
                  class="block w-full rounded-2xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white shadow-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm resize-none py-3 pr-4 pl-12 transition-all"
                  placeholder="اكتب ردك هنا..."
                  :disabled="sendingMessage || selectedTicket.status === 'closed'"
                  @input="adjustTextareaHeight"
                  @keydown.enter.exact.prevent="sendMessage"
                ></textarea>
                
                <div class="absolute left-2 bottom-2">
                  <button
                    type="button"
                    class="p-2 text-gray-400 hover:text-primary-600 rounded-full transition-colors"
                  >
                    <AppIcon name="FaceSmileIcon" class="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                :disabled="!newMessage.trim() || sendingMessage || selectedTicket.status === 'closed'"
                class="inline-flex items-center justify-center h-11 w-11 rounded-full shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <div v-if="sendingMessage" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <AppIcon v-else name="PaperAirplaneIcon" class="h-5 w-5 rtl:rotate-180" />
              </button>
            </form>
            <p class="text-[10px] text-gray-400 mt-2 px-2 hidden sm:block">
              اضغط Enter للإرسال، Shift+Enter لسطر جديد
            </p>
          </div>
        </template>
        
        <!-- Empty State -->
        <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-900/50">
          <div class="relative mb-8">
            <div class="absolute -inset-4 bg-primary-100 dark:bg-primary-900/20 rounded-full animate-pulse"></div>
            <div class="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-xl border border-gray-100 dark:border-gray-700">
              <AppIcon name="ChatBubbleLeftRightIcon" class="h-16 w-16 text-primary-500" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">تذاكر الدعم والمساعدة</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm">
            اختر تذكرة من القائمة الجانبية لبدء المحادثة مع العميل وحل مشكلته. يمكنك تصفية التذاكر حسب الحالة أو البحث عن مستخدم محدد.
          </p>
          
          <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            <div class="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div class="text-primary-600 dark:text-primary-400 font-bold text-lg mb-1">{{ stats.open || 0 }}</div>
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">تذاكر مفتوحة</div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div class="text-green-600 dark:text-green-400 font-bold text-lg mb-1">{{ stats.resolved || 0 }}</div>
                  <div class="text-[10px] text-gray-500 uppercase tracking-wider">تم الحل</div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div class="text-gray-600 dark:text-gray-300 font-bold text-lg mb-1">{{ stats.closed || 0 }}</div>
              <div class="text-[10px] text-gray-500 uppercase tracking-wider">تذاكر مغلقة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BaseSelect } from "@/components/base";
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { AppIcon } from '@/components/icons';
import { supportAPI } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { getSocket } from '@/services/socket';
import { preferenceStorage } from '@/services/storage';

const notificationStore = useNotificationStore();
const authStore = useAuthStore();

// State
const loading = ref(true);
const error = ref(null);
const tickets = ref([]);
const filters = ref({
  status: '',
  search: '',
});
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
});

const stats = ref({
  open: 0,
  resolved: 0,
  closed: 0
});

const statusFilters = [
  { label: 'الكل', value: '' },
  { label: 'مفتوحة', value: 'open' },
  { label: 'تم الحل', value: 'resolved' },
  { label: 'مغلقة', value: 'closed' },
];

// Chat State
const selectedTicket = ref(null);
const selectedTicketDetails = ref(null);
const loadingMessages = ref(false);
const newMessage = ref('');
const sendingMessage = ref(false);
const messagesContainer = ref(null);
const inputField = ref(null);
const isMuted = ref(false);
const showScrollBottom = ref(false);

let socketClient = null;
let searchTimeout = null;

const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchTickets();
  }, 500);
};

const getMuteStorageKey = () => {
  const adminId = authStore.user?.id || 'admin';
  return `admin_support_muted_${adminId}`;
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
      search: filters.value.search,
      status: filters.value.status
    };
    
    const response = await supportAPI.getAdminTickets(params);
    tickets.value = response.data.data;
    
    if (response.data.meta?.pagination) {
      pagination.value = response.data.meta.pagination;
    }

    // Update stats from the current list (rough estimate or fetch separately if needed)
    updateStatsLocally();
  } catch (err) {
    error.value = err.response?.data?.message || 'فشل في جلب التذاكر';
    notificationStore.error(error.value);
  } finally {
    loading.value = false;
  }
};

const updateStatsLocally = () => {
  // In a real app, this should probably come from a separate API or the meta data
  const counts = tickets.value.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, { open: 0, resolved: 0, closed: 0 });
  
  stats.value = counts;
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
    
    await nextTick();
    scrollToBottom();
    
    // Focus input on desktop
    if (window.innerWidth >= 1024) {
      inputField.value?.focus();
    }
  } catch (err) {
    notificationStore.error('فشل في جلب تفاصيل التذكرة');
  } finally {
    loadingMessages.value = false;
  }
};

const scrollToBottom = (smooth = false) => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

const handleChatScroll = () => {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  showScrollBottom.value = scrollHeight - scrollTop - clientHeight > 300;
};

const adjustTextareaHeight = () => {
  const textarea = inputField.value;
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
};

// Send Message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedTicket.value || sendingMessage.value) return;
  
  const content = newMessage.value.trim();
  sendingMessage.value = true;
  try {
    await supportAPI.replyToAdminTicket(selectedTicket.value.id, {
      message: content
    });
    
    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      content: content,
      sender_type: 'admin',
      created_at: new Date().toISOString()
    };
    
    if (!selectedTicketDetails.value.messages) selectedTicketDetails.value.messages = [];
    selectedTicketDetails.value.messages.push(tempMsg);
    
    newMessage.value = '';
    adjustTextareaHeight();
    
    await nextTick();
    scrollToBottom(true);
    
    // Refresh list to show updated status/time
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
    fetchTickets();
  }
};

// Helpers
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
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const getRoleLabel = (role) => {
  const map = {
    supplier: 'مورد',
    trader: 'تاجر',
    admin: 'مدير',
  };
  return map[role] || role;
};

const getUserInitials = (user) => {
  if (!user?.full_name) return '?';
  return user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-LY', {
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

const getFriendlyDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'اليوم';
  if (date.toDateString() === yesterday.toDateString()) return 'أمس';
  
  return date.toLocaleDateString('ar-LY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const shouldShowDateSeparator = (index) => {
  if (index === 0) return true;
  const currentMsg = selectedTicketDetails.value.messages[index];
  const prevMsg = selectedTicketDetails.value.messages[index - 1];
  
  const currentDate = new Date(currentMsg.created_at).toDateString();
  const prevDate = new Date(prevMsg.created_at).toDateString();
  
  return currentDate !== prevDate;
};

// WebSocket Logic
const connectRealtime = () => {
  socketClient = getSocket();
  socketClient.emit('join_admin');

  socketClient.on('new_ticket', async (ticketData) => {
    playNotificationSound();
    notificationStore.info(`تذكرة جديدة: ${ticketData.subject}`);
    await fetchTickets();
  });

  socketClient.on('ticket_reply', async (messageData) => {
    if (!messageData?.ticket_id) return;
    
    if (messageData.sender_type !== 'admin') {
      playNotificationSound();
    }

    const ticketId = messageData.ticket_id;
    
    if (selectedTicket.value?.id === ticketId && selectedTicketDetails.value?.messages) {
      const alreadyExists = selectedTicketDetails.value.messages.some(m => m.id === messageData.id);
      if (!alreadyExists) {
        selectedTicketDetails.value.messages.push(messageData);
        await nextTick();
        scrollToBottom(true);
      }
    }

    await fetchTickets();
  });

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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
