<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">تواصل معنا</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">نحن هنا لمساعدتك والإجابة على كافة استفساراتك</p>
    </div>

    <div class="flex flex-col md:flex-row-reverse gap-6">
      <!-- Contact Info / Channels -->
      <div class="w-full md:w-1/3 space-y-4">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">قنوات الدعم</h2>
          
          <div v-if="loadingChannels" class="flex justify-center p-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
          </div>
          <div v-else-if="!channels.length" class="text-center text-sm text-gray-500 p-4">
            لا توجد قنوات تواصل متاحة حالياً.
          </div>
          <div v-else class="space-y-3">
            <a v-for="channel in channels" :key="channel.id"
               :href="getChannelLink(channel)" target="_blank" rel="noopener noreferrer"
               class="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors group border border-transparent hover:border-brand-100 dark:hover:border-neutral-600">
              <div class="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-800/50 transition-colors shrink-0">
                <AppIcon :name="channel.icon || getIconName(channel.type)" class="w-5 h-5" />
              </div>
              <div class="overflow-hidden flex-1">
                <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ channel.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate dir-ltr text-right" dir="ltr">{{ channel.value }}</p>
              </div>
            </a>
          </div>
        </div>

        <div class="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-6 border border-brand-100 dark:border-brand-800/50">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <AppIcon name="ChatBubbleLeftRight" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">المحادثة المباشرة</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                يمكنك أيضاً استخدام المحادثة المباشرة المتاحة أسفل الشاشة للتواصل السريع مع فريق الدعم الفني.
              </p>
              <button @click="openWidget" class="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                فتح المحادثة المباشرة &larr;
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="w-full md:w-2/3">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 h-full">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">أرسل لنا رسالة (تذكرة دعم)</h2>
          
          <form @submit.prevent="submitTicket" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">موضوع الرسالة</label>
              <input v-model="form.subject" type="text" required placeholder="مثال: استفسار عن اشتراك" 
                     class="block w-full rounded-xl border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-4 py-3" />
            </div>
            
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص الرسالة</label>
              <textarea v-model="form.message" required rows="6" placeholder="اكتب تفاصيل رسالتك هنا وسنرد عليك في أقرب وقت..." 
                        class="block w-full rounded-xl border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-4 py-3 resize-none"></textarea>
              <p class="absolute bottom-3 left-3 text-[10px]" :class="isMessageValid ? 'text-green-500' : 'text-gray-400'">
                {{ form.message.trim().length }} / 10 حرف
              </p>
            </div>
            
            <div class="pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <button type="submit" :disabled="submitting || !isValid" 
                      class="w-full sm:w-auto flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <AppIcon v-else name="PaperAirplane" class="w-4 h-4 transform rotate-180" />
                إرسال وفتح المحادثة
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supportAPI } from '@/services/api';
import AppIcon from '@/components/icons/AppIcon.vue';

const loadingChannels = ref(false);
const channels = ref([]);

const form = ref({
  subject: '',
  message: ''
});

const submitting = ref(false);

const isMessageValid = computed(() => {
  return form.value.message && form.value.message.trim().length >= 10;
});

const isValid = computed(() => {
  return form.value.subject.trim() && isMessageValid.value;
});

const fetchChannels = async () => {
  try {
    loadingChannels.value = true;
    const response = await supportAPI.getActiveChannels();
    if (response.success || response.data?.success) {
      channels.value = response.data?.data || response.data || [];
    }
  } catch (error) {
    console.error("Error fetching support channels:", error);
  } finally {
    loadingChannels.value = false;
  }
};

const getIconName = (type) => {
  switch (type) {
    case "whatsapp":
      return "ChatBubbleLeftRight";
    case "phone":
      return "Phone";
    case "email":
      return "Envelope";
    default:
      return "GlobeAlt";
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

const openWidget = () => {
  document.dispatchEvent(new CustomEvent('open-support-widget'));
};

const showToast = (type, message) => {
  if (window?.$toast?.[type]) {
    window.$toast[type](message);
  }
};

const submitTicket = async () => {
  if (!isValid.value) return;
  
  submitting.value = true;
  try {
    const res = await supportAPI.createTicket({
      subject: form.value.subject.trim(),
      message: form.value.message.trim(),
    });
    const createdTicket = res.data?.data?.ticket || res.data?.data || null;
    
    // clear form
    form.value.subject = '';
    form.value.message = '';
    showToast('success', 'تم إرسال رسالتك بنجاح');
    
    // open widget to chat directly
    if (createdTicket?.id) {
      document.dispatchEvent(new CustomEvent('open-support-widget', { 
        detail: { ticket: createdTicket } 
      }));
    } else {
      openWidget();
    }
  } catch (error) {
    console.error('Failed to create ticket', error);
    showToast('error', error?.response?.data?.message || 'تعذر إرسال الرسالة حالياً');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchChannels();
});
</script>
