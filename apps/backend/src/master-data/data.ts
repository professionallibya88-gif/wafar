export const carModelsByMakerData = {
  toyota: ['كامري', 'كورولا', 'هايس', 'لاند كروزر', 'برادو', 'راف فور', 'افنزيس'],
  hyundai: ['توسان', 'النترا', 'سوناتا', 'اكسنت', 'ستارقس', 'استار اكس', 'H1', 'i10', 'i20', 'i30'],
  kia: ['سيراتو', 'ريو', 'سبورتاج', 'اوبتيما', 'موهافي', 'سورينتو', 'بيكانتو'],
  chevrolet: ['اوبترا', 'كالوس', 'ابترا', 'افيو', 'كروز', 'كابتيفا', 'سبارك', 'تاهو'],
  daewoo: ['نوبيرا', 'نيبرا', 'لانوس', 'جنترا', 'سيلو', 'فرسان', 'ماتيز'],
  ford: ['فوكس', 'فييستا', 'اسكيب', 'اكسبلورر', 'رينجر'],
  nissan: ['صني', 'التيما', 'باترول', 'مورانو', 'سنترا', 'تيدا'],
  mitsubishi: ['لانسر', 'باجيرو', 'اوتلاندر'],
} as const;

export const makerKeywordsByMakerData = {
  toyota: ['تويوتا', 'Toyota'],
  hyundai: ['هونداي', 'هوندا', 'Hyundai'],
  kia: ['كيا', 'Kia'],
  chevrolet: ['شفرليت', 'شيفروليت', 'Chevrolet', 'Chevy'],
  daewoo: ['داوو', 'داو', 'Daewoo'],
  ford: ['فورد', 'Ford'],
  nissan: ['نيسان', 'Nissan'],
} as const;

export const partTypeKeywordsByTypeData = {
  brake: ['اسطب', 'اسطبات', 'فرامل', 'تيل', 'Brake', 'Pad'],
  cylinder: ['ابلاطو', 'صمام', 'Valve'],
  piston: ['بسطون', 'بسطونى', 'بسطوني', 'Piston'],
  bearing: ['بيرنق', 'رولمان', 'كرسي', 'Bearing'],
  hose: ['انشبولة', 'خرطوم', 'ماسورة', 'Hose'],
  link: ['برولي', 'برولى', 'وصلة', 'Link', 'Joint'],
  filter: ['فلتر', 'مصفاة', 'Filter'],
  pulley: ['بكرة', 'Pulley'],
  belt: ['سير', 'حزام', 'Belt'],
  gasket: ['جوان', 'Gasket'],
  spark_plug: ['بواجي', 'شمعات', 'Spark', 'Plug'],
  shock_absorber: ['مساعد', 'مخمد', 'Shock'],
  oil_seal: ['سدادة زيت', 'Oil Seal'],
} as const;
