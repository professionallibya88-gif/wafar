<template>
  <div
    v-if="isAuthenticated && shouldShowWidget"
    class="fixed z-widget support-widget"
    :class="[isOpen ? 'inset-0 sm:inset-auto' : '']"
    :style="isOpen && !isDesktop ? {} : {
      bottom: isDesktop ? `${widgetBottomDesktop}px` : `${widgetBottomMobile}px`,
      left: widgetPositionX === 'left' ? '16px' : 'auto',
      right: widgetPositionX === 'right' ? '16px' : 'auto',
    }"
    dir="rtl"
  >
    <!-- خلفية مظللة للموبايل فقط عند فتح المحادثة -->
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 sm:hidden z-widget" @click="isOpen = false"></div>

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
        class="absolute z-popover sm:mb-3 w-full sm:w-96 bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl border-t sm:border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[85dvh] sm:h-[600px] bottom-0 sm:max-h-[85vh] rounded-t-3xl"
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
      class="fixed sm:relative z-popover flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50"
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
import { AppIcon } from "@/components/icons";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import { useSupportWidget } from "@/composables/useSupportWidget";

const {
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
} = useSupportWidget();
</script>
