<template>
  <div class="space-y-6">
    <BaseToast ref="toast" />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          إعدادات النظام
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          إدارة إعدادات المنصة
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="resetToDefaults"
          class="px-4 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-brand-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
        >
          <AppIcon name="ArrowPath" size="sm" />
          إعادة التعيين
        </button>
        <button
          @click="saveAllSettings"
          :disabled="saving"
          class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AppIcon
            v-if="saving"
            name="Refresh"
            size="sm"
            customClass="animate-spin"
          />
          <AppIcon v-else name="Check" size="sm" />
          {{ saving ? "جاري الحفظ..." : "حفظ التغييرات" }}
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
    >
      <AppIcon
        name="CheckCircle"
        size="lg"
        customClass="text-green-600 dark:text-green-400"
      />
      <span class="text-sm font-medium text-green-800 dark:text-green-200"
        >تم حفظ الإعدادات بنجاح</span
      >
    </div>

    <!-- Tabs -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-2"
    >
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center gap-2"
          :class="
            activeTab === tab.key
              ? 'bg-brand-100 dark:bg-neutral-900/30 text-brand-700 dark:text-neutral-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-gray-700'
          "
        >
          <AppIcon :name="tab.icon" size="sm" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8"
    >
      <!-- General Settings -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          الإعدادات العامة
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- اسم الموقع -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >اسم الموقع</label
            >
            <input
              v-model="settings.general.site_name"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="أدخل اسم الموقع"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              يظهر في عنوان المتصفح وشريط التنقل
            </p>
          </div>

          <!-- وصف الموقع -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >وصف الموقع</label
            >
            <input
              v-model="settings.general.site_description"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="وصف قصير للموقع"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              يظهر في نتائج محركات البحث
            </p>
          </div>

          <!-- الشعار اللفظي -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >الشعار اللفظي (Slogan)</label
            >
            <input
              v-model="settings.general.site_slogan"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="الخيار الأول لقطع الغيار"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              عبارة قصيرة تظهر بجانب اسم الموقع
            </p>
          </div>

          <!-- عنوان الصفحة الرئيسية -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >عنوان الصفحة الرئيسية للزوار</label
            >
            <input
              v-model="settings.general.landing_hero_title"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="اكتشف منصة وفر لقطع الغيار"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              العنوان الرئيسي الذي يظهر للزوار غير المسجلين
            </p>
          </div>

          <!-- وصف الصفحة الرئيسية -->
          <div class="space-y-2 lg:col-span-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >وصف الصفحة الرئيسية للزوار</label
            >
            <textarea
              v-model="settings.general.landing_hero_description"
              rows="3"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="المنصة الذكية الأولى في ليبيا للبحث المتقدم..."
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              الوصف التفصيلي الذي يظهر تحت العنوان الرئيسي
            </p>
          </div>

          <!-- المنطقة الزمنية -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >المنطقة الزمنية</label
            >
            <select
              v-model="settings.general.timezone"
              class="form-select"
            >
              <option value="Africa/Tripoli">ليبيا (GMT+2)</option>
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Asia/Cairo">القاهرة (GMT+2)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <!-- البريد الإلكتروني للإدارة -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >البريد الإلكتروني للإدارة</label
            >
            <input
              v-model="settings.general.admin_email"
              type="email"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="admin@example.com"
            />
          </div>

          <!-- رقم هاتف الدعم -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >رقم هاتف الدعم</label
            >
            <input
              v-model="settings.general.support_phone"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="966500000000"
            />
          </div>
        </div>

        <!-- شعار وأيقونة المنصة -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            شعار وأيقونة المنصة
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- الشعار (Logo) -->
            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                شعار الموقع (Logo)
              </label>
              <div class="flex items-center gap-4">
                <div
                  class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600"
                >
                  <img
                    v-if="settings.general.site_logo"
                    :src="settings.general.site_logo"
                    class="max-w-full max-h-full object-contain"
                    alt="شعار المنصة"
                  />
                  <AppIcon
                    v-else
                    name="Photo"
                    size="lg"
                    customClass="text-gray-400"
                  />
                </div>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input type="file" ref="logoInput" class="hidden" accept="image/*" @change="uploadImage($event, 'site_logo')" />
                    <button
                      @click="$refs.logoInput.click()"
                      :disabled="uploadingLogo"
                      class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
                    >
                      {{ uploadingLogo ? 'جاري الرفع...' : 'رفع شعار' }}
                    </button>
                    <button
                      v-if="settings.general.site_logo"
                      @click="settings.general.site_logo = ''"
                      class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      حذف
                    </button>
                  </div>
                  <input
                    v-model="settings.general.site_logo"
                    class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="أو أدخل رابط الشعار هنا"
                  />
                </div>
              </div>
            </div>

            <!-- الأيقونة (Favicon) -->
            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                أيقونة الموقع (Favicon)
              </label>
              <div class="flex items-center gap-4">
                <div
                  class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600"
                >
                  <img
                    v-if="settings.general.site_favicon"
                    :src="settings.general.site_favicon"
                    class="max-w-full max-h-full object-contain"
                    alt="أيقونة المنصة"
                  />
                  <AppIcon
                    v-else
                    name="GlobeAlt"
                    size="lg"
                    customClass="text-gray-400"
                  />
                </div>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <input type="file" ref="faviconInput" class="hidden" accept="image/*" @change="uploadImage($event, 'site_favicon')" />
                    <button
                      @click="$refs.faviconInput.click()"
                      :disabled="uploadingFavicon"
                      class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
                    >
                      {{ uploadingFavicon ? 'جاري الرفع...' : 'رفع أيقونة' }}
                    </button>
                    <button
                      v-if="settings.general.site_favicon"
                      @click="settings.general.site_favicon = ''"
                      class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    >
                      حذف
                    </button>
                  </div>
                  <input
                    v-model="settings.general.site_favicon"
                    class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="أو أدخل رابط الأيقونة هنا"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            إعدادات الويدجت العائم
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">لون الخلفية</label>
              <input type="color" v-model="settings.widget.widget_bg_color" class="w-full h-12 rounded-xl cursor-pointer" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">لون الأيقونة</label>
              <input type="color" v-model="settings.widget.widget_icon_color" class="w-full h-12 rounded-xl cursor-pointer" />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الشكل</label>
              <select v-model="settings.widget.widget_shape" class="form-select">
                <option value="circle">دائري</option>
                <option value="rounded">مربع منحني</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      <!-- PDF Processing Settings -->
      <div v-show="activeTab === 'pdf'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            إعدادات معالجة PDF
          </h2>
          <button
            @click="manageAnalysisEngines"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            <AppIcon name="CpuChip" size="sm" />
            لوحة المحركات
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- طريقة المعالجة الافتراضية -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >طريقة المعالجة الافتراضية</label
            >
            <select
              v-model="settings.pdf_processing.default_pdf_method"
              class="form-select"
            >
              <option value="node_pdf">Node.js</option>
              <option value="python_pypdf">بايثون PyPDF</option>
              <option value="python_ai">Python AI</option>
              <option value="aws_textract">AWS Textract</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              المحرك المستخدم لاستخراج النصوص من
              ملفات PDF
            </p>
          </div>

          <!-- مفتاح Gemini AI -->
          <div class="space-y-2 lg:col-span-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >مفتاح ذكاء اصطناعي Gemini (لتقنية الرؤية البصرية)</label
            >
            <input
              v-model="settings.pdf_processing.gemini_api_key"
              type="password"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="أدخل مفتاح GEMINI_API_KEY هنا (اختياري)"
            />
            <p class="text-xs text-brand-600 dark:text-brand-400">
              مطلوب لتشغيل التقنية البصرية (Vision AI) لاستخراج أسماء الشركات بتصميم معقد بنسبة دقة 99٪.
            </p>
          </div>

          <!-- الحد الأقصى لحجم الملف -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >الحد الأقصى لحجم الملف (MB)</label
            >
            <input
              v-model.number="settings.pdf_processing.max_file_size"
              type="number"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="50"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              أكبر حجم مسموح به لملفات PDF
            </p>
          </div>

          <!-- جودة الاستخراج -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >جودة الاستخراج</label
            >
            <select
              v-model="settings.pdf_processing.extraction_quality"
              class="form-select"
            >
              <option value="low">منخفضة (سريع)</option>
              <option value="medium">متوسطة</option>
              <option value="high">عالية</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              تؤثر على دقة استخراج النصوص
            </p>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >محرك استخراج الجداول في Python</label
            >
            <select
              v-model="settings.pdf_processing.python_table_engine_default"
              class="form-select"
            >
              <option value="auto">تلقائي</option>
              <option value="pymupdf">PyMuPDF</option>
              <option value="pdfplumber">pdfplumber</option>
              <option value="camelot">Camelot</option>
            </select>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >سلسلة البدائل (Fallback Chain)</label
            >
            <input
              v-model="settings.pdf_processing.pdf_fallback_chain"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="python_pypdf,node_pdf,ocr"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              اكتب الطرق مفصولة بفواصل حسب ترتيب البدائل.
            </p>
          </div>

          <!-- تفعيل OCR -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >تفعيل OCR للصور الممسوحة</label
            >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="settings.pdf_processing.ocr_enabled"
                class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >استخراج النص من الصور داخل PDF</span
              >
            </div>
          </div>

          <!-- لغة OCR -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >لغة OCR</label
            >
            <select
              v-model="settings.pdf_processing.ocr_language"
              class="form-select"
            >
              <option value="ara">العربية</option>
              <option value="eng">الإنجليزية</option>
              <option value="ara+eng">
                العربية والإنجليزية
              </option>
            </select>
          </div>

          <!-- حفظ الصفحات المصغرة -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >حفظ الصفحات المصغرة</label
            >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="settings.pdf_processing.generate_thumbnails"
                class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300"
                >إنشاء صور مصغرة لكل صفحة</span
              >
            </div>
          </div>

          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                التبديل التلقائي بين المحركات
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                الانتقال تلقائياً إلى الطريقة التالية عند ضعف النتائج أو فشل المعالجة
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.pdf_processing.pdf_enable_auto_fallback"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
              ></div>
            </label>
          </div>
        </div>

        <!-- إعدادات متقدمة -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            إعدادات متقدمة
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- مهلة المعالجة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >مهلة المعالجة (ثانية)</label
              >
              <input
                v-model.number="settings.pdf_processing.processing_timeout"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="300"
              />
            </div>

            <!-- إعادة المحاولة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >عدد مرات إعادة المحاولة</label
              >
              <input
                v-model.number="settings.pdf_processing.retry_attempts"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="3"
              />
            </div>

            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  ذكاء لاستخراج البيانات الوصفية
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  استخدام مزود AI المفضل لاكتشاف اسم الشركة والتاريخ عند تعثر الاستخراج العادي
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.pdf_processing.pdf_enable_ai_metadata"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
                ></div>
              </label>
            </div>

            <div
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  ذكاء لتحسين النتائج
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  تجهيز المسار لاستخدام الذكاء لاحقاً في تنظيف النتائج بعد الاستخراج
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="settings.pdf_processing.pdf_enable_ai_enrichment"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Providers Settings -->
      <div v-show="activeTab === 'ai_providers'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            إعدادات مزودي الذكاء الاصطناعي
          </h2>
          <button
            @click="manageAIProviders"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            <AppIcon name="AdjustmentsHorizontal" size="sm" />
            إدارة المزودين
          </button>
        </div>

        <!-- تفعيل الذكاء الاصطناعي -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
        >
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              تفعيل مزودي الذكاء الاصطناعي
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              تمكين المعالجة بواسطة مزودي الذكاء الاصطناعي لاستخراج البيانات
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="settings.ai_providers.ai_enabled"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
            ></div>
          </label>
        </div>

        <div
          v-if="settings.ai_providers.ai_enabled"
          class="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <!-- المزود المفضل -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >المزود المفضل الافتراضي</label
            >
            <select
              v-model="settings.ai_providers.ai_preferred_provider"
              class="form-select"
            >
              <option value="google">Google Gemini</option>
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="mistral">Mistral AI</option>
            </select>
          </div>

          <!-- تفعيل التبديل التلقائي -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                التبديل التلقائي للمزود
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                الانتقال للمزود التالي عند فشل المزود الحالي
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.ai_providers.ai_fallback_enabled"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
              ></div>
            </label>
          </div>

          <!-- تفعيل الرؤية البصرية -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                معالجة الصور البصرية
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                تمكين تحليل الصور لاستخراج البيانات
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.ai_providers.ai_vision_enabled"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
              ></div>
            </label>
          </div>

          <!-- تتبع التكاليف -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                تتبع تكاليف الاستخدام
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                تسجيل تكاليف طلبات الذكاء الاصطناعي
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.ai_providers.ai_cost_tracking_enabled"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"
              ></div>
            </label>
          </div>

          <!-- الحد الأقصى للرموز -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >الحد الأقصى للرموز الافتراضي</label
            >
            <input
              type="number"
              v-model.number="settings.ai_providers.ai_max_tokens_default"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="4096"
            />
          </div>

          <!-- درجة الإبداع -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >درجة الإبداع الافتراضية (0-1)</label
            >
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              v-model.number="settings.ai_providers.ai_temperature_default"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="0.1"
            />
          </div>

          <!-- مهلة الاتصال -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >مهلة الاتصال بالمزود (ثانية)</label
            >
            <input
              type="number"
              v-model.number="settings.ai_providers.ai_timeout_seconds"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="60"
            />
          </div>

          <!-- عتبة فصل الدائرة -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >عتبة فصل الدائرة (محاولات فاشلة)</label
            >
            <input
              type="number"
              v-model.number="settings.ai_providers.ai_circuit_breaker_threshold"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="5"
            />
          </div>
        </div>
      </div>

      <!-- Email Settings -->
      <div v-show="activeTab === 'email'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          إعدادات البريد الإلكتروني
        </h2>

        <!-- تفعيل SMTP -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
        >
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              تفعيل SMTP
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              إرسال رسائل البريد الإلكتروني عبر
              خادم SMTP
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="settings.email.smtp_enabled"
              class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>
        </div>

        <div v-if="settings.email.smtp_enabled" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- خادم SMTP -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >خادم SMTP</label
              >
              <input
                v-model="settings.email.smtp_host"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="smtp.gmail.com"
              />
            </div>

            <!-- منفذ SMTP -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >منفذ SMTP</label
              >
              <input
                v-model.number="settings.email.smtp_port"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="587"
              />
            </div>

            <!-- التشفير -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >التشفير</label
              >
              <select
                v-model="settings.email.smtp_encryption"
                class="form-select"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">بدون تشفير</option>
              </select>
            </div>

            <!-- اسم المستخدم -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >اسم المستخدم</label
              >
              <input
                v-model="settings.email.smtp_user"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="user@example.com"
              />
            </div>

            <!-- كلمة المرور -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >كلمة المرور</label
              >
              <input
                v-model="settings.email.smtp_password"
                type="password"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
              />
            </div>

            <!-- عنوان المرسل -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >عنوان المرسل</label
              >
              <input
                v-model="settings.email.smtp_from"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="noreply@example.com"
              />
            </div>
          </div>

          <!-- اسم المرسل -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >اسم المرسل</label
            >
            <input
              v-model="settings.email.smtp_from_name"
              class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="اسم المنصة"
            />
          </div>

          <!-- زر اختبار -->
          <div class="flex gap-3">
            <button
              @click="testEmailSettings"
              :disabled="testingEmail"
              class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <AppIcon
                :name="testingEmail ? 'ArrowPath' : 'PaperAirplane'"
                size="sm"
                :customClass="testingEmail ? 'animate-spin' : ''"
              />
              {{ testingEmail ? "جاري الفحص..." : "فحص الإعدادات" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div v-show="activeTab === 'security'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          إعدادات الأمان
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- المصادقة الثنائية -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                المصادقة الثنائية
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                إضافة طلبقة أمان إضافية لحسابات
                المسؤولين
              </p>
            </div>
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="settings.security.two_factor_auth"
                class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>

          <!-- القائمة البيضاء لعناوين IP -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                القائمة البيضاء لعناوين IP
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                السماح فقط لعناوين IP المحددة
                بالوصول إلى لوحة الإدارة
              </p>
            </div>
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="settings.security.ip_whitelist_enabled"
                class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div v-if="settings.security.ip_whitelist_enabled" class="space-y-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >عناوين IP المسموح بها</label
          >
          <textarea
            v-model="settings.security.ip_whitelist"
            rows="4"
            class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="192.168.1.1&#10;10.0.0.1"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            ضع كل عنوان IP في سطر مستقل
          </p>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            إعدادات الجلسات
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- مهلة الجلسة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >مهلة الجلسة (دقيقة)</label
              >
              <input
                v-model.number="settings.security.session_timeout"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400">
                الوقت قبل انتهاء صلاحية الجلسة
                تلقائياً
              </p>
            </div>

            <!-- الجلسات المتزامنة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >الحد الأقصى للجلسات المتزامنة</label
              >
              <input
                v-model.number="settings.security.max_concurrent_sessions"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            سياسة كلمات المرور
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- الحد الأدنى لطول كلمة المرور -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >الحد الأدنى لطول كلمة المرور</label
              >
              <input
                v-model.number="settings.security.min_password_length"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="8"
              />
            </div>

            <!-- إلزام الأحرف الخاصة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >إلزام الأحرف الخاصة</label
              >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="settings.security.require_special_chars"
                  class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >مثل: @#$%^&*</span
                >
              </div>
            </div>

            <!-- إلزام الأرقام -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >إلزام الأرقام</label
              >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="settings.security.require_numbers"
                  class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >0-9</span
                >
              </div>
            </div>

            <!-- إلزام الأحرف الكبيرة -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >إلزام الأحرف الكبيرة</label
              >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="settings.security.require_uppercase"
                  class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >A-Z</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            الحماية من الهجمات
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- حد محاولات تسجيل الدخول -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >حد محاولات تسجيل الدخول
                الفاشة</label
              >
              <input
                v-model.number="settings.security.max_login_attempts"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="5"
              />
            </div>

            <!-- مدة الحظر -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >مدة الحظر (دقيقة)</label
              >
              <input
                v-model.number="settings.security.lockout_duration"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="15"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Rate Limiting Settings -->
      <div v-show="activeTab === 'rate_limiting'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          إعدادات تحديد المعدل
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          التحكم في حدود الطلبات المسموح بها
          لأنواع العمليات المختلفة
        </p>

        <!-- تفعيل أو تعطيل تحديد المعدل -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              تفعيل تحديد معدل الطلبات
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              عند الإيقاف، لا توجد قيود على عدد
              الطلبات
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="settings.rate_limiting.rate_limiting_enabled"
              class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>
        </div>

        <div v-if="settings.rate_limiting.rate_limiting_enabled">
          <!-- Auth Rate Limiting -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3
              class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <AppIcon name="LockClosed" size="sm" />
              عمليات المصادقة (تسجيل
              الدخول/التسجيل)
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >عدد المحاولات المسموحة</label
                >
                <input
                  v-model.number="settings.rate_limiting.auth_rate_limit_points"
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="10"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  عدد المحاولات في النافذة الزمنية
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >مدة النافذة (ثانية)</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.auth_rate_limit_duration
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="900"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  المدة الزمنية قبل إعادة تعيين
                  العداد
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >مدة الحظر (ثانية)</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.auth_rate_limit_block_duration
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="900"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  مدة الحظر عند تجاوز الحد
                </p>
              </div>
            </div>
          </div>

          <!-- API Rate Limiting -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3
              class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <AppIcon name="GlobeAlt" size="sm" />
              طلبات API العامة
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >عدد الطلبات المسموح بها</label
                >
                <input
                  v-model.number="settings.rate_limiting.api_rate_limit_points"
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="1000"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  عدد طلبات API في النافذة الزمنية
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >مدة النافذة (ثانية)</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.api_rate_limit_duration
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="900"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  15 دقيقة افتراضياً
                </p>
              </div>
            </div>
          </div>

          <!-- Upload Rate Limiting -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3
              class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <AppIcon name="CloudArrowUp" size="sm" />
              عمليات رفع الملفات
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >عدد عمليات الرفع المسموح بها</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.upload_rate_limit_points
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="20"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  عدد عمليات الرفع في النافذة
                  الزمنية
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >مدة النافذة (ثانية)</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.upload_rate_limit_duration
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="3600"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ساعة واحدة افتراضياً
                </p>
              </div>
            </div>
          </div>

          <!-- Search Rate Limiting -->
          <div
            class="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3
              class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"
            >
              <AppIcon name="MagnifyingGlass" size="sm" />
              عمليات البحث
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >عدد عمليات البحث المسموح بها</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.search_rate_limit_points
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="30"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  عدد عمليات البحث في النافذة
                  الزمنية
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >مدة النافذة (ثانية)</label
                >
                <input
                  v-model.number="
                    settings.rate_limiting.search_rate_limit_duration
                  "
                  type="number"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  placeholder="60"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  دقيقة واحدة افتراضياً
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div
          class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3"
        >
          <AppIcon
            name="ExclamationTriangle"
            size="lg"
            customClass="text-yellow-600 dark:text-yellow-400 flex-shrink-0"
          />
          <div>
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200">
              تنبيه هام
            </h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              تغيير هذه الإعدادات يؤثر على أمان
              النظام وأدائه. القيم المنخفضة جدا
              قد تمنع المستخدمين الشرعيين من
              استخدام المنصة، بينما القيم
              المرتفعة جدا قد تجعل النظام عرضة
              للهجمات.
            </p>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div v-show="activeTab === 'system'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          إعدادات النظام
        </h2>

        <!-- وضع الصيانة -->
        <div
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
        >
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              وضع الصيانة
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              إيقاف الموقع مؤقتا لصيانة
              التحديثات
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="settings.system.maintenance_mode"
              class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>
        </div>

        <div v-if="settings.system.maintenance_mode" class="space-y-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >رسالة الصيانة</label
          >
          <textarea
            v-model="settings.system.maintenance_message"
            rows="3"
            class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            placeholder="المنصة تحت الصيانة مؤقتاً"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- المنطقة الزمنية -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >المنطقة الزمنية</label
            >
            <select
              v-model="settings.system.timezone"
              class="form-select"
            >
              <option value="Africa/Tripoli">ليبيا (GMT+2)</option>
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Asia/Cairo">القاهرة (GMT+2)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            السجلات
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- مستوى السجلات -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >مستوى السجلات</label
              >
              <select
                v-model="settings.system.log_level"
                class="form-select"
              >
                <option value="error">أخطاء فقط</option>
                <option value="warn">تحذيرات</option>
                <option value="info">معلومات</option>
                <option value="debug">تصحيح</option>
              </select>
            </div>

            <!-- الاحتفاظ بالسجلات -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >فترة الاحتفاظ بالسجلات (أيام)</label
              >
              <input
                v-model.number="settings.system.log_retention_days"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            التخزين المؤقت
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- مدة التخزين المؤقت -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >مدة التخزين المؤقت (دقيقة)</label
              >
              <input
                v-model.number="settings.system.cache_ttl"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="60"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400">
                الوقت قبل إعادة تحميل البيانات من
                قاعدة البيانات
              </p>
            </div>

            <!-- تفعيل التخزين المؤقت -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >تفعيل التخزين المؤقت</label
              >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="settings.system.cache_enabled"
                  class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >تحسين أداء المنصة</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            النسخ الاحتياطي
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- تفعيل النسخ الاحتياطي التلقائي -->
            <div class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >تفعيل النسخ الاحتياطي التلقائي</label
              >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="settings.system.auto_backup_enabled"
                  class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300"
                  >إنشاء نسخ احتياطية دورية</span
                >
              </div>
            </div>

            <!-- جدول النسخ الاحتياطي -->
            <div v-if="settings.system.auto_backup_enabled" class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >جدول النسخ الاحتياطي</label
              >
              <select
                v-model="settings.system.backup_schedule"
                class="form-select"
              >
                <option value="daily">يومياً</option>
                <option value="weekly">أسبوعياً</option>
                <option value="monthly">شهرياً</option>
              </select>
            </div>

            <!-- عدد النسخ الاحتياطية -->
            <div v-if="settings.system.auto_backup_enabled" class="space-y-2">
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >عدد النسخ الاحتياطية المحفوظة</label
              >
              <input
                v-model.number="settings.system.backup_retention_count"
                type="number"
                class="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="7"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-4">
            معلومات النظام
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                إصدار النظام
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                1.0.0
              </p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                إصدار Node.js
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                v18.17.0
              </p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                إصدار Vue.js
              </p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                3.3.4
              </p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                حالة قاعدة البيانات
              </p>
              <p class="text-sm font-medium text-green-600">متصلة</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Flags Settings -->
      <div v-show="activeTab === 'feature_flags'" class="space-y-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          إدارة الميزات
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          تحكم في إظهار أو إخفاء الميزات للمستخدمين. عند تعطيل ميزة، ستختفي من
          القوائم ولن يتمكن المستخدمون من الوصول إليها.
        </p>

        <!-- MVP Mode Toggle -->
        <div
          class="flex items-center justify-between p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <div>
            <h3 class="font-semibold text-amber-800 dark:text-amber-200">
              الوضع المبسط
            </h3>
            <p class="text-sm text-amber-600 dark:text-amber-300">
              عند التفعيل، تُعرض فقط الميزات الأساسية (بحث، رفع، ملفاتي،
              كتالوجات) وتُخفى كل الميزات المتقدمة تلقائياً
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              v-model="settings.feature_flags.feature_mvp_mode"
              class="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
            />
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(label, key) in {
              feature_search: 'البحث',
              feature_catalogs: 'الكتالوجات',
              feature_upload: 'رفع ملفات PDF',
              feature_files: 'ملفاتي',
              feature_compare: 'المقارنة',
              feature_subscriptions: 'الاشتراكات',
              feature_payments: 'المدفوعات',
              feature_history: 'سجل البحث',
              feature_notifications: 'الإشعارات',
              feature_admin_dashboard: 'لوحة الإدارة',
              feature_admin_monitoring: 'المراقبة',
              feature_admin_advanced_monitoring: 'المراقبة المتقدمة',
              feature_admin_activity_logs: 'سجل الأنشطة',
              feature_email_smtp: 'إعدادات SMTP',
              feature_rate_limiting: 'Rate Limiting',
            }"
            :key="key"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ label }}
            </span>
            <input
              type="checkbox"
              v-model="settings.feature_flags[key]"
              class="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
          </div>
        </div>

        <div
          class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
        >
          <p class="text-sm text-blue-700 dark:text-blue-300">
            <AppIcon
              name="InformationCircle"
              size="sm"
              customClass="inline-block ml-1"
            />
            تغييرات الميزات تُطبق فور الحفظ. المستخدمون المتصلون حالياً
            سيرون التحديثات عند إعادة تحميل الصفحة.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { settingsAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseToast } from "@/components/base";

const settings = ref({
  general: {},
  pdf_processing: {},
  ai_providers: {},
  email: {},
  security: {},
  rate_limiting: {},
  system: {},
  feature_flags: {},
  widget: {},
});
const activeTab = ref("general");
const saving = ref(false);
const showSuccess = ref(false);
const toast = ref(null);
const testingEmail = ref(false);
const router = useRouter();

const uploadingLogo = ref(false);
const uploadingFavicon = ref(false);

const tabs = [
  { key: "general", label: "عام", icon: "Cog6Tooth" },
  { key: "pdf", label: "معالجة ملفات PDF", icon: "DocumentText" },
  { key: "ai_providers", label: "الذكاء الاصطناعي", icon: "CpuChip" },
  {
    key: "email",
    label: "البريد الإلكتروني",
    icon: "Envelope",
  },
  { key: "security", label: "الأمان", icon: "LockClosed" },
  { key: "rate_limiting", label: "تحديد المعدل", icon: "ShieldCheck" },
  { key: "system", label: "النظام", icon: "Server" },
  {
    key: "feature_flags",
    label: "الميزات",
    icon: "Sparkles",
  },
];

const parseBool = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  return Boolean(value);
};

const loadSettings = async () => {
  try {
    const res = await settingsAPI.getAll();
    const data = res.data?.data || {};

    // Initialize settings with defaults
    settings.value = {
      general: {
        site_name: data.general?.site_name || "",
        site_description: data.general?.site_description || "",
        site_slogan: data.general?.site_slogan || "",
        timezone: data.general?.timezone || "Africa/Tripoli",
        admin_email: data.general?.admin_email || "",
        support_phone: data.general?.support_phone || "",
        site_logo: data.general?.site_logo || "",
        site_favicon: data.general?.site_favicon || "",
        landing_hero_title: data.general?.landing_hero_title || "",
        landing_hero_description: data.general?.landing_hero_description || "",
      },
      pdf_processing: {
        default_pdf_method:
          data.pdf_processing?.default_pdf_method || "node_pdf",
        gemini_api_key: data.pdf_processing?.gemini_api_key || "",
        python_table_engine_default:
          data.pdf_processing?.python_table_engine_default || "auto",
        pdf_fallback_chain:
          data.pdf_processing?.pdf_fallback_chain || "python_pypdf,node_pdf,ocr",
        pdf_enable_auto_fallback:
          parseBool(data.pdf_processing?.pdf_enable_auto_fallback) !== false,
        pdf_enable_ai_metadata:
          parseBool(data.pdf_processing?.pdf_enable_ai_metadata) !== false,
        pdf_enable_ai_enrichment:
          parseBool(data.pdf_processing?.pdf_enable_ai_enrichment) === true,
        max_file_size: data.pdf_processing?.max_file_size || 50,
        extraction_quality: data.pdf_processing?.extraction_quality || "medium",
        ocr_enabled: parseBool(data.pdf_processing?.ocr_enabled) === true,
        ocr_language: data.pdf_processing?.ocr_language || "ara",
        generate_thumbnails: parseBool(data.pdf_processing?.generate_thumbnails) === true,
        processing_timeout: data.pdf_processing?.processing_timeout || 300,
        retry_attempts: data.pdf_processing?.retry_attempts || 3,
      },
      ai_providers: {
        ai_enabled: parseBool(data.ai_providers?.ai_enabled) || false,
        ai_preferred_provider: data.ai_providers?.ai_preferred_provider || "google",
        ai_fallback_enabled: parseBool(data.ai_providers?.ai_fallback_enabled) !== false,
        ai_vision_enabled: parseBool(data.ai_providers?.ai_vision_enabled) !== false,
        ai_max_tokens_default: data.ai_providers?.ai_max_tokens_default || 4096,
        ai_temperature_default: data.ai_providers?.ai_temperature_default || 0.1,
        ai_timeout_seconds: data.ai_providers?.ai_timeout_seconds || 60,
        ai_cost_tracking_enabled:
          parseBool(data.ai_providers?.ai_cost_tracking_enabled) !== false,
        ai_circuit_breaker_threshold:
          data.ai_providers?.ai_circuit_breaker_threshold || 5,
        ai_circuit_breaker_cooldown_seconds:
          data.ai_providers?.ai_circuit_breaker_cooldown_seconds || 120,
      },
      email: {
        smtp_enabled: data.email?.smtp_enabled || false,
        smtp_host: data.email?.smtp_host || "",
        smtp_port: data.email?.smtp_port || 587,
        smtp_encryption: data.email?.smtp_encryption || "tls",
        smtp_user: data.email?.smtp_user || "",
        smtp_password: data.email?.smtp_password || "",
        smtp_from: data.email?.smtp_from || "",
        smtp_from_name: data.email?.smtp_from_name || "",
      },
      security: {
        two_factor_auth: data.security?.two_factor_auth || false,
        ip_whitelist_enabled: data.security?.ip_whitelist_enabled || false,
        ip_whitelist: data.security?.ip_whitelist || "",
        session_timeout: data.security?.session_timeout || 30,
        max_concurrent_sessions: data.security?.max_concurrent_sessions || 3,
        min_password_length: data.security?.min_password_length || 8,
        require_special_chars: data.security?.require_special_chars || true,
        require_numbers: data.security?.require_numbers || true,
        require_uppercase: data.security?.require_uppercase || true,
        max_login_attempts: data.security?.max_login_attempts || 5,
        lockout_duration: data.security?.lockout_duration || 15,
      },
      rate_limiting: {
        rate_limiting_enabled:
          data.rate_limiting?.rate_limiting_enabled !== undefined
            ? data.rate_limiting?.rate_limiting_enabled
            : false,
        auth_rate_limit_points:
          data.rate_limiting?.auth_rate_limit_points || 10,
        auth_rate_limit_duration:
          data.rate_limiting?.auth_rate_limit_duration || 900,
        auth_rate_limit_block_duration:
          data.rate_limiting?.auth_rate_limit_block_duration || 900,
        api_rate_limit_points:
          data.rate_limiting?.api_rate_limit_points || 1000,
        api_rate_limit_duration:
          data.rate_limiting?.api_rate_limit_duration || 900,
        upload_rate_limit_points:
          data.rate_limiting?.upload_rate_limit_points || 20,
        upload_rate_limit_duration:
          data.rate_limiting?.upload_rate_limit_duration || 3600,
        search_rate_limit_points:
          data.rate_limiting?.search_rate_limit_points || 30,
        search_rate_limit_duration:
          data.rate_limiting?.search_rate_limit_duration || 60,
      },
      system: {
        maintenance_mode: data.system?.maintenance_mode || false,
        maintenance_message: data.system?.maintenance_message || "",
        timezone: data.system?.timezone || "Africa/Tripoli",
        log_level: data.system?.log_level || "info",
        log_retention_days: data.system?.log_retention_days || 30,
        cache_ttl: data.system?.cache_ttl || 60,
        cache_enabled: data.system?.cache_enabled || true,
        auto_backup_enabled: data.system?.auto_backup_enabled || false,
        backup_schedule: data.system?.backup_schedule || "daily",
        backup_retention_count: data.system?.backup_retention_count || 7,
      },
      feature_flags: {
        feature_search: parseBool(data.feature_flags?.feature_search) !== false,
        feature_catalogs:
          parseBool(data.feature_flags?.feature_catalogs) !== false,
        feature_upload: parseBool(data.feature_flags?.feature_upload) !== false,
        feature_files: parseBool(data.feature_flags?.feature_files) !== false,
        feature_compare:
          parseBool(data.feature_flags?.feature_compare) !== false,
        feature_subscriptions:
          parseBool(data.feature_flags?.feature_subscriptions) !== false,
        feature_payments:
          parseBool(data.feature_flags?.feature_payments) !== false,
        feature_history:
          parseBool(data.feature_flags?.feature_history) !== false,
        feature_notifications:
          parseBool(data.feature_flags?.feature_notifications) !== false,
        feature_admin_dashboard:
          parseBool(data.feature_flags?.feature_admin_dashboard) !== false,
        feature_admin_monitoring:
          parseBool(data.feature_flags?.feature_admin_monitoring) !== false,
        feature_admin_advanced_monitoring:
          parseBool(data.feature_flags?.feature_admin_advanced_monitoring) !==
          false,
        feature_admin_activity_logs:
          parseBool(data.feature_flags?.feature_admin_activity_logs) !== false,
        feature_email_smtp:
          parseBool(data.feature_flags?.feature_email_smtp) !== false,
        feature_rate_limiting:
          parseBool(data.feature_flags?.feature_rate_limiting) !== false,
        feature_mvp_mode:
          parseBool(data.feature_flags?.feature_mvp_mode) === true,
      },
      widget: {
        widget_bg_color: data.widget?.widget_bg_color || '#2563eb',
        widget_icon_color: data.widget?.widget_icon_color || '#ffffff',
        widget_shape: data.widget?.widget_shape || 'circle',
      },
    };
  } catch (e) {
    if (toast.value) {
      toast.value.addToast({ type: "error", message: "خطأ في جلب الإعدادات" });
    }
  }
};

onMounted(async () => {
  await loadSettings();
});

const saveAllSettings = async () => {
  saving.value = true;
  try {
    await settingsAPI.updateAll(settings.value);
    showSuccess.value = true;
    setTimeout(() => (showSuccess.value = false), 3000);
  } catch (e) {
    if (toast.value) {
      toast.value.addToast({ type: "error", message: "خطأ في حفظ الإعدادات" });
    }
  } finally {
    saving.value = false;
  }
};

const uploadImage = async (event, key) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (key === 'site_logo') uploadingLogo.value = true;
  if (key === 'site_favicon') uploadingFavicon.value = true;

  try {
    const res = await settingsAPI.uploadImage(file, key);
    if (res.data?.data?.url) {
      // Use full URL since it will be saved in DB
      settings.value.general[key] = res.data.data.url;
      if (toast.value) {
        toast.value.addToast({ type: "success", message: "تم رفع الصورة بنجاح" });
      }
    }
  } catch (e) {
    if (toast.value) {
      toast.value.addToast({ type: "error", message: "خطأ في رفع الصورة" });
    }
  } finally {
    if (key === 'site_logo') uploadingLogo.value = false;
    if (key === 'site_favicon') uploadingFavicon.value = false;
    event.target.value = ""; // Reset input
  }
};

const resetToDefaults = async () => {
  const confirmed = await window.$confirm("هل أنت متأكد من إعادة تعيين جميع الإعدادات؟");
  if (!confirmed)
    return;
  try {
    await settingsAPI.resetDefaults();
    await loadSettings();
  } catch (e) {
    if (toast.value) {
      toast.value.addToast({ type: "error", message: "خطأ في إعادة التعيين" });
    }
  }
};

const testEmailSettings = async () => {
  testingEmail.value = true;
  try {
    const res = await settingsAPI.testEmail();
    const message = res.data?.message || "تم فحص إعدادات البريد";
    if (toast.value) {
      toast.value.addToast({ type: "success", message });
    }
  } catch (e) {
    if (toast.value) {
      toast.value.addToast({ type: "error", message: "تعذر فحص إعدادات البريد" });
    }
  } finally {
    testingEmail.value = false;
  }
};

const manageAIProviders = () => {
  window.open('/admin/ai-providers', '_blank');
};

const manageAnalysisEngines = () => {
  router.push("/admin/analysis-engines");
};
</script>
