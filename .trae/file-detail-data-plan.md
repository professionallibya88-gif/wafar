# خطة إصلاح عرض وبيانات تفاصيل الملف

## الهدف
- إصلاح سبب ظهور بيانات ملف `http://localhost:3050/files/d7aaeb80-b99d-4fdb-bf2a-77bd7e6e6040` بشكل غير صحيح في صفحة التفاصيل.
- توحيد ما بين ما تُخرجه طبقة الاستخراج، وما يعيده الـ API، وما تعرضه الواجهة.

## التشخيص المختصر
- صفحة التفاصيل تعرض حقولًا أكثر من الحقول التي يعيدها endpoint أجزاء الملف.
- بعض الحقول محفوظة أو مشتقة في الخلفية لكن لا تُعاد للواجهة، مثل `oem_number`, `item_number`, `origin_country`, `quantity_available`, `in_stock`, `price_cash`, `price_bank`, `price_wholesale`, و`derived.car_model`.
- هناك احتمال انزياح في بعض الصفوف داخل pipeline عندما تتكرر ترويسات الصفحات أو يتغير شكل الصف، ويتم إصلاحه heuristically في `RowNormalizer` لكنه ما زال يحتاج تضييقًا ومنعًا لتمرير الصفوف غير الصحيحة.

## الأسباب الأساسية
1. **نقص projection في API تفاصيل الملف**
   - المسار [PartRepository.ts](file:///c:/companyprojectstools/apps/backend/src/repositories/PartRepository.ts) يعيد فقط مجموعة صغيرة من الحقول لصفحة التفاصيل.
   - الواجهة في [FileDetailView.vue](file:///c:/companyprojectstools/apps/frontend/src/views/dashboard/FileDetailView.vue) تعتمد على حقول غير معادة أصلًا.

2. **عدم تطابق أسماء الحقول بين backend وfrontend**
   - الواجهة تفحص `part.quality` بدل الاعتماد الصريح على `quality_grade`.
   - الواجهة تتوقع `car_model` كحقل علوي بينما مصدره الحالي عمليًا هو `derived.car_model`.

3. **تداخل في تعيين الأعمدة أثناء الاستخراج**
   - [HeaderMapper.ts](file:///c:/companyprojectstools/apps/backend/src/services/HeaderMapper.ts) يعتمد على مرادفات متداخلة ومطابقات عامة قد تلتقط عنوانًا لحقل غير المقصود.

4. **تمرير صفوف مزعجة أو منزاحة**
   - [RowNormalizer.ts](file:///c:/companyprojectstools/apps/backend/src/services/RowNormalizer.ts) يصلح بعض الصفوف المنزاحة، لكن لا يزال يجب تشديد شروط قبول الصف النهائي حتى لا تمر ترويسات الصفحات أو الصفوف شبه الفارغة.

## النهج الموصى به
### 1. إصلاح API تفاصيل الملف أولًا
- توسيع الحقول المعادة من `findByPDFFileIdWithPagination()` في [PartRepository.ts](file:///c:/companyprojectstools/apps/backend/src/repositories/PartRepository.ts).
- تضمين الحقول اللازمة للعرض الفعلي:
  - `oem_number`
  - `item_number`
  - `origin_country`
  - `quantity_available`
  - `in_stock`
  - `price_cash`
  - `price_bank`
  - `price_wholesale`
  - `price_wholesale_small`
  - `quality_grade`
  - `derived`
  - أي حقل إضافي تعتمد عليه الصفحة مباشرة
- إضافة تحويل خفيف في الخدمة إذا لزم لاستخراج `car_model` من `derived.car_model` قبل إرساله للواجهة.

### 2. إصلاح واجهة تفاصيل الملف
- تعديل [FileDetailView.vue](file:///c:/companyprojectstools/apps/frontend/src/views/dashboard/FileDetailView.vue) لاستخدام الحقول الفعلية القادمة من الـ API بشكل متسق.
- الاعتماد الصريح على:
  - `quality_grade` بدل الشرط الحالي المختلط
  - `part.car_model || part.derived?.car_model`
  - `price_cash` ثم `price_bank` ثم `price_wholesale` دون افتراض أن `price` وحده كافٍ
- تحسين عرض القيم المفقودة حتى لا تبدو وكأنها خطأ استخراج إذا كانت غير موجودة أصلًا.

### 3. تشديد pipeline الاستخراج
- مراجعة `HeaderMapper` في [HeaderMapper.ts](file:///c:/companyprojectstools/apps/backend/src/services/HeaderMapper.ts) لتقليل تداخل المرادفات:
  - إعطاء أولوية صريحة لبعض العناوين الحرجة مثل:
    - `الرقم الأصلي` -> `oem_number`
    - `رقم الصنف` -> `item_number`
    - `م` -> `serial` فقط عند الحاجة
  - تقليل المطابقات العامة التي تعتمد فقط على `contains` للعناوين المتداخلة مثل `الموديل` و`الشركة`.
- مراجعة `RowNormalizer` في [RowNormalizer.ts](file:///c:/companyprojectstools/apps/backend/src/services/RowNormalizer.ts) لتشديد:
  - استبعاد ترويسات الصفحات
  - رفض الصفوف التي اسمها ليس اسم قطعة فعليًا
  - منع اعتبار كود OEM كاسم قطعة
  - تحسين التقاط العلامة التجارية من الصف المنزاح

### 4. جعل قبول الصف النهائي أكثر صرامة
- إبقاء gate القبول في [pdfProcessor.ts](file:///c:/companyprojectstools/apps/backend/src/services/pdfProcessor.ts) قائمًا على `validateRow()`.
- توسيع الاختبارات على صفوف من هذا الملف تحديدًا لحالات:
  - صف سليم
  - صف منزاح
  - ترويسة صفحة مكررة
  - صف فيه `OEM` و`part_code` واسم عربي في خلايا مختلفة

## الملفات الحرجة المرشحة للتعديل
- [PartRepository.ts](file:///c:/companyprojectstools/apps/backend/src/repositories/PartRepository.ts)
- [PDFService.ts](file:///c:/companyprojectstools/apps/backend/src/services/PDFService.ts)
- [FileDetailView.vue](file:///c:/companyprojectstools/apps/frontend/src/views/dashboard/FileDetailView.vue)
- [HeaderMapper.ts](file:///c:/companyprojectstools/apps/backend/src/services/HeaderMapper.ts)
- [RowNormalizer.ts](file:///c:/companyprojectstools/apps/backend/src/services/RowNormalizer.ts)
- [pdfProcessor.ts](file:///c:/companyprojectstools/apps/backend/src/services/pdfProcessor.ts)
- [headerMapping.test.ts](file:///c:/companyprojectstools/apps/backend/src/tests/headerMapping.test.ts)
- [pdfProcessor.test.ts](file:///c:/companyprojectstools/apps/backend/src/tests/pdfProcessor.test.ts)

## ترتيب التنفيذ
1. توسيع API تفاصيل الملف وإرجاع الحقول الفعلية المطلوبة.
2. تعديل الواجهة لقراءة الحقول الصحيحة وعرضها بشكل متسق.
3. تشديد `HeaderMapper` و`RowNormalizer` لخفض الانزياح والضجيج.
4. إضافة اختبارات على نفس النمط المتأثر.
5. إعادة معالجة الملف المتضرر والتحقق من النتيجة.

## التحقق النهائي
- تشغيل اختبارات backend ذات الصلة:
  - `npx jest src/tests/headerMapping.test.ts src/tests/pdfProcessor.test.ts --runInBand`
- تشغيل البناء:
  - `npm run build`
- إعادة معالجة الملف ثم فتح صفحة التفاصيل:
  - التأكد أن `OEM / الكود` و`الاسم` و`الشركة` و`الأسعار` و`التوفر` تظهر بقيم منطقية
  - مراجعة أول الصفوف من الصفحة الأولى ثم صفوف من بداية الصفحة الثانية
  - التأكد أن الترويسات أو صفوف الضجيج لا تظهر كقطع
