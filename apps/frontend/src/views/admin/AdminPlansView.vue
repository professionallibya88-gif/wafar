<template>
  <div class="space-y-8">
    <BaseToast />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          باقات الاشتراك
        </h1>
        <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          تحكم مرن في النوع واللون والصلاحيات والأدوار وحدود كل باقة.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          @click="loadPlans"
          :disabled="loading"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <AppIcon name="ArrowPath" size="sm" />
          تحديث
        </button>

        <button
          @click="openCreateForm"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <AppIcon name="Plus" size="sm" color="white" />
          إضافة باقة
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:shadow-neutral-900/50"
      >
        <div 
          class="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-transform duration-500 group-hover:scale-150"
          :class="card.bgClass"
        />
        
        <div class="relative flex items-center gap-5">
          <div
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm"
            :class="card.iconClass"
          >
            <AppIcon :name="card.icon" size="lg" />
          </div>
          
          <div>
            <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {{ card.label }}
            </p>
            <p class="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {{ card.value }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div class="relative flex-1 min-w-[240px]">
        <AppIcon
          name="MagnifyingGlass"
          size="sm"
          customClass="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          v-model.trim="filters.search"
          type="text"
          class="h-11 w-full rounded-xl border border-neutral-100 bg-neutral-50/50 pr-10 pl-4 text-sm text-neutral-900 outline-none transition focus:border-brand-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          placeholder="ابحث باسم الباقة أو الوصف..."
        />
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <AppIcon 
            name="AdjustmentsHorizontal" 
            size="sm" 
            customClass="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <select
            v-model="filters.status"
            class="form-select h-11"
          >
            <option value="all">كل الحالات</option>
            <option value="active">النشطة</option>
            <option value="inactive">المعطلة</option>
          </select>
        </div>

        <div class="relative">
          <AppIcon 
            name="Tag" 
            size="sm" 
            customClass="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <select
            v-model="filters.type"
            class="form-select h-11"
          >
            <option value="all">كل الأنواع</option>
            <option
              v-for="option in planTypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div
        v-for="index in 4"
        :key="index"
        class="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="filteredPlans.length"
      class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[var(--card-glow)] dark:bg-neutral-800"
        :class="plan.is_active ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-200/70 opacity-90 dark:border-neutral-700/70'"
        :style="getPlanCardStyle(plan)"
      >
        <!-- Header with Dynamic Color -->
        <div
          class="relative border-b border-neutral-100 p-4 transition-colors duration-500 dark:border-neutral-700/50"
          :style="{ 
            backgroundColor: `${plan.color_hex}05`,
            borderTop: `4px solid ${plan.color_hex}`
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105"
                  :style="getPillStyle(plan.color_hex)"
                >
                  {{ getPlanTypeLabel(plan.plan_type) }}
                </span>
                <span
                  class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black shadow-sm transition-transform group-hover:scale-105"
                  :class="
                    plan.is_active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  "
                >
                  <span class="h-1 w-1 rounded-full" :class="plan.is_active ? 'bg-emerald-500' : 'bg-red-500'"></span>
                  {{ plan.is_active ? 'نشطة' : 'معطلة' }}
                </span>
              </div>
              <h2 class="truncate text-lg font-black tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-950 dark:text-white dark:group-hover:text-white">
                {{ plan.name_ar }}
              </h2>
              <p class="truncate text-[10px] font-bold text-neutral-400 uppercase tracking-tighter dark:text-neutral-500" dir="ltr">
                {{ plan.name_en || plan.name }}
              </p>
            </div>

            <div 
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 dark:bg-neutral-900 dark:ring-neutral-700"
            >
              <AppIcon name="ShieldCheck" size="md" :style="{ color: plan.color_hex }" />
            </div>
          </div>
        </div>

        <!-- Body Content -->
        <div class="flex-1 p-4 space-y-4">
          <p class="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ plan.description || "لا يوجد وصف لهذه الباقة." }}
          </p>

          <div class="grid grid-cols-1 gap-3">
            <!-- Price Section -->
            <div class="group/section flex items-center justify-between rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900">
              <div class="flex items-center gap-2">
                <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-800">
                  <AppIcon name="Banknotes" size="xs" class="text-neutral-400" />
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">السعر</span>
                  <p class="text-[10px] font-medium text-neutral-500">
                    {{ plan.duration_days > 0 ? `${plan.duration_days} يوم` : "مجانية" }}
                  </p>
                </div>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {{ formatCurrency(plan.price, '') }}
                </span>
                <span class="text-[9px] font-bold text-neutral-400">{{ plan.currency || 'LYD' }}</span>
              </div>
            </div>

            <!-- Limits Section -->
            <div class="group/section rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900">
              <div class="mb-2 flex items-center gap-2">
                <AppIcon name="ChartBar" size="xs" class="text-neutral-400" />
                <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">الحدود</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="block text-[8px] font-bold text-neutral-400 uppercase">البحث</span>
                  <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(plan.max_searches_per_day) }}</span>
                </div>
                <div class="flex-1 border-r border-neutral-200 pr-4 dark:border-neutral-700">
                  <span class="block text-[8px] font-bold text-neutral-400 uppercase">الرفع</span>
                  <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(plan.max_pdf_uploads) }}</span>
                </div>
              </div>
            </div>

            <!-- Summary Roles/Perms -->
            <div class="flex flex-wrap gap-1.5">
              <div class="flex -space-x-1.5 overflow-hidden rtl:space-x-reverse">
                <div 
                  v-for="role in plan.allowed_roles" 
                  :key="role"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-neutral-50 dark:bg-neutral-800 dark:ring-neutral-900"
                  :title="getRoleLabel(role)"
                >
                  <AppIcon name="Users" size="xs" class="text-neutral-400" />
                </div>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="permission in getEnabledPermissions(plan.permissions).slice(0, 2)"
                  :key="permission.key"
                  class="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold text-neutral-600 shadow-sm ring-1 ring-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700"
                >
                  {{ permission.label }}
                </span>
                <span 
                  v-if="getEnabledPermissions(plan.permissions).length > 2"
                  class="text-[9px] font-bold text-neutral-400 pt-0.5"
                >
                  +{{ getEnabledPermissions(plan.permissions).length - 2 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="border-t border-neutral-100 bg-neutral-50/30 p-3 transition-colors group-hover:bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-900/20 dark:group-hover:bg-neutral-900/40">
          <div class="flex items-center justify-between gap-2">
            <div class="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              #{{ plan.sort_order || 0 }}
            </div>

            <div class="flex items-center gap-1.5">
              <button
                @click="togglePlanActive(plan)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition-all hover:ring-brand-500 hover:text-brand-600 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700"
                :title="plan.is_active ? 'إيقاف/تعطيل' : 'تفعيل'"
              >
                <AppIcon :name="plan.is_active ? 'EyeSlash' : 'Eye'" size="xs" />
              </button>
              <button
                @click="editPlan(plan)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition-all hover:ring-brand-500 hover:text-brand-600 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700"
                title="تعديل"
              >
                <AppIcon name="PencilSquare" size="xs" />
              </button>
              <button
                @click="duplicatePlan(plan)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-500 shadow-sm ring-1 ring-neutral-200 transition-all hover:ring-brand-500 hover:text-brand-600 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700"
                title="نسخ"
              >
                <AppIcon name="DocumentDuplicate" size="xs" />
              </button>
              <button
                @click="deletePlan(plan.id)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-400 shadow-sm ring-1 ring-neutral-200 transition-all hover:bg-red-50 hover:ring-red-500 hover:text-red-600 dark:bg-neutral-800 dark:ring-neutral-700 dark:hover:bg-red-500/10"
                title="حذف"
              >
                <AppIcon name="Trash" size="xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900"
      >
        <AppIcon
          name="Swatch"
          size="xl"
          customClass="text-neutral-400 dark:text-neutral-500"
        />
      </div>
      <h3 class="mt-5 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        لا توجد باقات مطابقة
      </h3>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        جرّب تغيير الفلاتر أو أضف باقة جديدة بإعدادات أكثر مرونة.
      </p>
    </div>

    <BaseModal
      :show="showForm"
      :title="editingId ? 'تعديل الباقة' : 'إضافة باقة جديدة'"
      size="xl"
      @update:show="handleModalVisibility"
      @close="resetForm"
    >
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-6">
          <section class="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <div class="mb-4 flex items-center gap-2">
              <AppIcon name="Identification" size="sm" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                البيانات الأساسية
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  الاسم بالعربية
                </label>
                <input
                  v-model.trim="form.name_ar"
                  type="text"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="مثال: الباقة الاحترافية"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  الاسم النظامي
                </label>
                <input
                  v-model.trim="form.name_en"
                  type="text"
                  dir="ltr"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="professional-plan"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  نوع الباقة
                </label>
                <select
                  v-model="form.plan_type"
                  class="form-select"
                >
                  <option
                    v-for="option in planTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  الترتيب
                </label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                الوصف
              </label>
              <textarea
                v-model.trim="form.description"
                rows="4"
                class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="وصف موجز يوضح القيمة المضافة لهذه الباقة"
              />
            </div>
          </section>

          <section class="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <div class="mb-4 flex items-center gap-2">
              <AppIcon name="Swatch" size="sm" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                اللون والحالة
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  اللون
                </label>
                <input
                  v-model="form.color_hex"
                  type="color"
                  class="h-12 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  قيمة اللون
                </label>
                <input
                  v-model.trim="form.color_hex"
                  type="text"
                  dir="ltr"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm uppercase text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="#2563EB"
                />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                class="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
              >
                <div>
                  <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    تفعيل الباقة
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    تظهر للمستخدمين وللإدارة
                  </p>
                </div>
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
              </label>

              <label
                class="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
              >
                <div>
                  <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    عملة التسعير
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    متاحة حالياً بعملتين
                  </p>
                </div>
                <select
                  v-model="form.currency"
                  class="form-select"
                >
                  <option value="LYD">LYD</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>
          </section>

          <section class="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <div class="mb-4 flex items-center gap-2">
              <AppIcon name="Banknotes" size="sm" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                التسعير والحدود
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  السعر
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  مدة الاشتراك بالأيام
                </label>
                <input
                  v-model.number="form.duration_days"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="30"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  بحث يومي
                </label>
                <input
                  v-model.number="form.max_searches_per_day"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="0 غير محدود"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  رفع PDF
                </label>
                <input
                  v-model.number="form.max_pdf_uploads"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="0 غير محدود"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  مقارنات يومية
                </label>
                <input
                  v-model.number="form.max_comparisons_per_day"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="0 غير محدود"
                />
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <div class="mb-4 flex items-center gap-2">
              <AppIcon name="Users" size="sm" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                الأدوار المسموح بها
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label
                v-for="role in roleOptions"
                :key="role.value"
                class="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
              >
                <div>
                  <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {{ role.label }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ role.description }}
                  </p>
                </div>
                <input
                  :checked="form.allowed_roles.includes(role.value)"
                  type="checkbox"
                  class="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                  @change="toggleRole(role.value)"
                />
              </label>
            </div>
          </section>

          <section class="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
            <div class="mb-4 flex items-center gap-2">
              <AppIcon name="ShieldCheck" size="sm" />
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                الصلاحيات
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                v-for="permission in permissionOptions"
                :key="permission.key"
                class="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
              >
                <div>
                  <p class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {{ permission.label }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ permission.description }}
                  </p>
                </div>
                <input
                  v-model="form.permissions[permission.key]"
                  type="checkbox"
                  class="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
              </label>
            </div>
          </section>
        </div>

        <aside class="space-y-4">
          <div class="sticky top-6">
            <p class="mb-4 text-xs font-black uppercase tracking-widest text-neutral-400">
              معاينة مباشرة
            </p>
            
            <div
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-500 dark:border-neutral-700 dark:bg-neutral-800"
              :style="getPlanCardStyle(previewPlan)"
            >
              <!-- Preview Header -->
              <div
                class="relative border-b border-neutral-100 p-4 transition-colors duration-500 dark:border-neutral-700/50"
                :style="{ 
                  backgroundColor: `${previewPlan.color_hex}05`,
                  borderTop: `4px solid ${previewPlan.color_hex}`
                }"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1 space-y-1">
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span
                        class="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm"
                        :style="getPillStyle(previewPlan.color_hex)"
                      >
                        {{ getPlanTypeLabel(previewPlan.plan_type) }}
                      </span>
                      <span
                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black shadow-sm"
                        :class="
                          previewPlan.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        "
                      >
                        <span class="h-1 w-1 rounded-full" :class="previewPlan.is_active ? 'bg-emerald-500' : 'bg-red-500'"></span>
                        {{ previewPlan.is_active ? 'نشطة' : 'معطلة' }}
                      </span>
                    </div>
                    <h2 class="truncate text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                      {{ previewPlan.name_ar || 'اسم الباقة' }}
                    </h2>
                    <p class="truncate text-[10px] font-bold text-neutral-400 uppercase tracking-tighter dark:text-neutral-500" dir="ltr">
                      {{ previewPlan.name_en || 'plan-identifier' }}
                    </p>
                  </div>

                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
                    <AppIcon name="ShieldCheck" size="md" :style="{ color: previewPlan.color_hex }" />
                  </div>
                </div>
              </div>

              <!-- Preview Body -->
              <div class="flex-1 p-4 space-y-4">
                <p class="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {{ previewPlan.description || "هنا يظهر وصف الباقة." }}
                </p>

                <div class="grid grid-cols-1 gap-3">
                  <!-- Price Section -->
                  <div class="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/50">
                    <div class="flex items-center gap-2">
                      <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-800">
                        <AppIcon name="Banknotes" size="xs" class="text-neutral-400" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">السعر</span>
                        <p class="text-[10px] font-medium text-neutral-500">
                          {{ previewPlan.duration_days > 0 ? `${previewPlan.duration_days} يوم` : "مجانية" }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-baseline gap-0.5">
                      <span class="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                        {{ formatCurrency(previewPlan.price, '') }}
                      </span>
                      <span class="text-[9px] font-bold text-neutral-400">{{ previewPlan.currency }}</span>
                    </div>
                  </div>

                  <!-- Limits Preview -->
                  <div class="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/50">
                    <div class="mb-2 flex items-center gap-2">
                      <AppIcon name="ChartBar" size="xs" class="text-neutral-400" />
                      <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">الحدود</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex-1">
                        <span class="block text-[8px] font-bold text-neutral-400 uppercase">البحث</span>
                        <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(previewPlan.max_searches_per_day) }}</span>
                      </div>
                      <div class="flex-1 border-r border-neutral-200 pr-4 dark:border-neutral-700">
                        <span class="block text-[8px] font-bold text-neutral-400 uppercase">الرفع</span>
                        <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(previewPlan.max_pdf_uploads) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            يتم تطبيق اللون والنوع والصلاحيات مباشرة على هذه الباقة.
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="resetForm"
              class="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-200"
            >
              إلغاء
            </button>
            <button
              @click="savePlan"
              :disabled="saving"
              class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              <AppIcon name="Check" size="sm" color="white" />
              {{ saving ? "جارٍ الحفظ..." : "حفظ الباقة" }}
            </button>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseToast, BaseModal } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";
import { formatCurrency } from "@/utils/currency";

const planTypeOptions = [
  { value: "free", label: "مجانية" },
  { value: "basic", label: "أساسية" },
  { value: "professional", label: "احترافية" },
  { value: "enterprise", label: "مؤسسية" },
  { value: "custom", label: "مخصصة" },
];

const roleOptions = [
  { value: "retailer", label: "تاجر", description: "مناسبة لحسابات التجار" },
  { value: "supplier", label: "مورد", description: "مناسبة لحسابات الموردين" },
];

const permissionOptions = [
  {
    key: "compare_parts",
    label: "مقارنة القطع",
    description: "السماح بمقارنة النتائج والقطع",
  },
  {
    key: "export_results",
    label: "تصدير النتائج",
    description: "السماح بتنزيل أو تصدير البيانات",
  },
  {
    key: "upload_pdf",
    label: "رفع ملفات PDF",
    description: "السماح باستخدام التحليل ورفع الملفات",
  },
  {
    key: "view_saved_searches",
    label: "السجل المحفوظ",
    description: "إظهار سجل البحث والملفات المحفوظة",
  },
  {
    key: "priority_support",
    label: "دعم مميز",
    description: "إبراز الباقة كخدمة ذات أولوية",
  },
];

const defaultColors = {
  free: "#64748B",
  basic: "#2563EB",
  professional: "#7C3AED",
  enterprise: "#0F766E",
  custom: "#EA580C",
};

const defaultPermissions = () => ({
  compare_parts: false,
  export_results: false,
  upload_pdf: true,
  view_saved_searches: true,
  priority_support: false,
});

const createDefaultForm = () => ({
  name_ar: "",
  name_en: "",
  description: "",
  plan_type: "basic",
  color_hex: defaultColors.basic,
  allowed_roles: ["retailer", "supplier"],
  permissions: defaultPermissions(),
  duration_days: 30,
  price: 0,
  currency: "LYD",
  max_searches_per_day: 0,
  max_pdf_uploads: 0,
  max_comparisons_per_day: 0,
  can_compare: false,
  can_export: false,
  is_active: true,
  sort_order: 0,
});

const plans = ref([]);
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);
const editingId = ref(null);
const form = ref(createDefaultForm());
const filters = ref({
  search: "",
  status: "all",
  type: "all",
});

useAutoApplyFilters(
  () => [filters.value.search, filters.value.status, filters.value.type],
  () => {
    // Local filtering is reactive in computed, so we don't necessarily need to reload.
    // If you want to reload from API on every change, do `loadPlans()` here.
    // In this case, local filtering is handled by `filteredPlans` computed property.
  },
  { delay: 300 }
);

const normalizePlan = (plan = {}) => {
  const type = plan.plan_type || (Number(plan.price || 0) === 0 ? "free" : "basic");
  const permissions = {
    ...defaultPermissions(),
    ...(plan.permissions || {}),
  };

  permissions.compare_parts =
    typeof permissions.compare_parts === "boolean"
      ? permissions.compare_parts
      : Boolean(plan.can_compare);
  permissions.export_results =
    typeof permissions.export_results === "boolean"
      ? permissions.export_results
      : Boolean(plan.can_export);

  return {
    ...createDefaultForm(),
    ...plan,
    name_en: plan.name_en || plan.name || "",
    plan_type: type,
    color_hex: normalizeColor(plan.color_hex || defaultColors[type] || defaultColors.basic),
    allowed_roles: Array.isArray(plan.allowed_roles) && plan.allowed_roles.length
      ? [...new Set(plan.allowed_roles)]
      : ["retailer", "supplier"],
    permissions,
    max_pdf_uploads: plan.max_pdf_uploads ?? plan.max_pdf_files ?? 0,
    sort_order: plan.sort_order ?? 0,
    price: Number(plan.price || 0),
    duration_days: Number(plan.duration_days || 0),
    max_searches_per_day: Number(plan.max_searches_per_day || 0),
    max_comparisons_per_day: Number(plan.max_comparisons_per_day || 0),
    can_compare: permissions.compare_parts,
    can_export: permissions.export_results,
  };
};

const summaryCards = computed(() => [
  {
    key: "total",
    label: "إجمالي الباقات",
    value: formatNumber(plans.value.length),
    icon: "Squares2X2",
    iconClass: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    bgClass: "bg-brand-600",
  },
  {
    key: "active",
    label: "الباقات النشطة",
    value: formatNumber(plans.value.filter((plan) => plan.is_active).length),
    icon: "CheckCircle",
    iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    bgClass: "bg-emerald-600",
  },
  {
    key: "types",
    label: "أنواع مستخدمة",
    value: formatNumber(new Set(plans.value.map((plan) => plan.plan_type)).size),
    icon: "Swatch",
    iconClass: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    bgClass: "bg-violet-600",
  },
  {
    key: "permissions",
    label: "صلاحيات مفعلة",
    value: formatNumber(
      plans.value.reduce((count, plan) => count + getEnabledPermissions(plan.permissions).length, 0),
    ),
    icon: "ShieldCheck",
    iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    bgClass: "bg-amber-600",
  },
]);

const filteredPlans = computed(() => {
  const search = filters.value.search.trim().toLowerCase();

  return plans.value.filter((plan) => {
    const matchesSearch =
      !search ||
      [plan.name_ar, plan.name_en, plan.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));

    const matchesStatus =
      filters.value.status === "all" ||
      (filters.value.status === "active" && plan.is_active) ||
      (filters.value.status === "inactive" && !plan.is_active);

    const matchesType =
      filters.value.type === "all" || plan.plan_type === filters.value.type;

    return matchesSearch && matchesStatus && matchesType;
  });
});

const previewPlan = computed(() => normalizePlan(form.value));

watch(
  () => form.value.plan_type,
  (nextType, previousType) => {
    if (!nextType) {
      return;
    }

    const previousColor = defaultColors[previousType] || defaultColors.basic;
    const nextColor = defaultColors[nextType] || defaultColors.basic;

    if (!form.value.color_hex || normalizeColor(form.value.color_hex) === previousColor) {
      form.value.color_hex = nextColor;
    }
  },
);

watch(
  () => form.value.permissions.compare_parts,
  (value) => {
    form.value.can_compare = value;
  },
);

watch(
  () => form.value.permissions.export_results,
  (value) => {
    form.value.can_export = value;
  },
);

onMounted(() => {
  loadPlans();
});

const loadPlans = async () => {
  loading.value = true;
  try {
    const response = await adminAPI.getPlans();
    const data = response.data?.data || [];
    plans.value = Array.isArray(data) ? data.map((plan) => normalizePlan(plan)) : [];
  } catch (error) {
    window.$toast?.error(getErrorMessage(error, "تعذر تحميل الباقات"));
  } finally {
    loading.value = false;
  }
};

const openCreateForm = () => {
  editingId.value = null;
  form.value = createDefaultForm();
  showForm.value = true;
};

const togglePlanActive = async (plan) => {
  try {
    const newStatus = !plan.is_active;
    
    const normalized = normalizePlan(plan);
    const payload = {
      name: normalized.name_en,
      name_en: normalized.name_en,
      name_ar: normalized.name_ar,
      description: normalized.description,
      plan_type: normalized.plan_type,
      color_hex: normalizeColor(normalized.color_hex),
      allowed_roles: normalized.allowed_roles,
      permissions: normalized.permissions,
      duration_days: Number(normalized.duration_days || 0),
      price: Number(normalized.price || 0),
      currency: normalized.currency || "LYD",
      max_searches_per_day: Number(normalized.max_searches_per_day || 0),
      max_pdf_uploads: Number(normalized.max_pdf_uploads || 0),
      max_comparisons_per_day: Number(normalized.max_comparisons_per_day || 0),
      can_compare: Boolean(normalized.permissions.compare_parts),
      can_export: Boolean(normalized.permissions.export_results),
      is_active: newStatus,
      sort_order: Number(normalized.sort_order || 0),
    };

    await adminAPI.updatePlan(plan.id, payload);
    plan.is_active = newStatus;
    window.$toast?.success(newStatus ? "تم تفعيل الباقة بنجاح" : "تم إيقاف الباقة بنجاح");
  } catch (error) {
    window.$toast?.error(getErrorMessage(error, "تعذر تغيير حالة الباقة"));
  }
};

const editPlan = (plan) => {
  editingId.value = plan.id;
  form.value = normalizePlan(plan);
  showForm.value = true;
};

const duplicatePlan = (plan) => {
  editingId.value = null;
  const duplicatedPlan = normalizePlan(plan);
  duplicatedPlan.name_ar = `${duplicatedPlan.name_ar} - نسخة`;
  duplicatedPlan.name_en = duplicatedPlan.name_en
    ? `${duplicatedPlan.name_en}-copy`
    : "";
  duplicatedPlan.sort_order = Number(duplicatedPlan.sort_order || 0) + 1;
  form.value = duplicatedPlan;
  showForm.value = true;
};

const toggleRole = (role) => {
  if (form.value.allowed_roles.includes(role)) {
    form.value.allowed_roles = form.value.allowed_roles.filter((item) => item !== role);
    return;
  }

  form.value.allowed_roles = [...form.value.allowed_roles, role];
};

const savePlan = async () => {
  const validationMessage = validateForm();
  if (validationMessage) {
    window.$toast?.error(validationMessage);
    return;
  }

  saving.value = true;
  try {
    const payload = buildPayload();

    if (editingId.value) {
      await adminAPI.updatePlan(editingId.value, payload);
      window.$toast?.success("تم تحديث الباقة بنجاح");
    } else {
      await adminAPI.createPlan(payload);
      window.$toast?.success("تم إنشاء الباقة بنجاح");
    }

    resetForm();
    await loadPlans();
  } catch (error) {
    window.$toast?.error(getErrorMessage(error, "تعذر حفظ الباقة"));
  } finally {
    saving.value = false;
  }
};

const deletePlan = async (id) => {
  const confirmed = await window.$confirm?.("هل أنت متأكد من حذف هذه الباقة؟");
  if (!confirmed) {
    return;
  }

  try {
    await adminAPI.deletePlan(id);
    plans.value = plans.value.filter((plan) => plan.id !== id);
    window.$toast?.success("تم حذف الباقة بنجاح");
  } catch (error) {
    window.$toast?.error(getErrorMessage(error, "تعذر حذف الباقة"));
  }
};

const buildPayload = () => {
  const normalized = normalizePlan(form.value);

  return {
    name: normalized.name_en,
    name_en: normalized.name_en,
    name_ar: normalized.name_ar,
    description: normalized.description,
    plan_type: normalized.plan_type,
    color_hex: normalizeColor(normalized.color_hex),
    allowed_roles: normalized.allowed_roles,
    permissions: normalized.permissions,
    duration_days: Number(normalized.duration_days || 0),
    price: Number(normalized.price || 0),
    currency: normalized.currency || "LYD",
    max_searches_per_day: Number(normalized.max_searches_per_day || 0),
    max_pdf_uploads: Number(normalized.max_pdf_uploads || 0),
    max_comparisons_per_day: Number(normalized.max_comparisons_per_day || 0),
    can_compare: Boolean(normalized.permissions.compare_parts),
    can_export: Boolean(normalized.permissions.export_results),
    is_active: Boolean(normalized.is_active),
    sort_order: Number(normalized.sort_order || 0),
  };
};

const validateForm = () => {
  if (!form.value.name_ar.trim()) {
    return "اسم الباقة بالعربية مطلوب";
  }

  if (!form.value.name_en.trim()) {
    return "الاسم النظامي للباقة مطلوب";
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(normalizeColor(form.value.color_hex))) {
    return "لون الباقة غير صالح";
  }

  if (!form.value.allowed_roles.length) {
    return "يجب اختيار دور واحد على الأقل";
  }

  return "";
};

const handleModalVisibility = (value) => {
  showForm.value = value;
  if (!value) {
    resetForm();
  }
};

const resetForm = () => {
  showForm.value = false;
  editingId.value = null;
  form.value = createDefaultForm();
};

const getPlanTypeLabel = (type) =>
  planTypeOptions.find((option) => option.value === type)?.label || "غير محدد";

const getRoleLabel = (role) =>
  roleOptions.find((option) => option.value === role)?.label || role;

const getEnabledPermissions = (permissions = {}) =>
  permissionOptions.filter((permission) => permissions?.[permission.key]);

const normalizeColor = (color) => {
  if (typeof color !== "string") {
    return defaultColors.basic;
  }

  const normalized = color.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : defaultColors.basic;
};

const formatLimit = (value) =>
  value === null || value === undefined || Number(value) === 0 ? "غير محدود" : formatNumber(value);

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

const getPillStyle = (color) => {
  const normalized = normalizeColor(color);
  return {
    backgroundColor: `${normalized}12`,
    color: normalized,
    border: `1px solid ${normalized}26`,
  };
};

const getPlanCardStyle = (plan) => {
  const color = normalizeColor(plan.color_hex);
  return {
    '--card-glow': `${color}1A`,
    boxShadow: `0 10px 30px -15px ${color}33`,
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.msg ||
  fallback;
</script>
