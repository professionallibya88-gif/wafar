/**
 * نظام الأيقونات الموحد - Unified Icon System
 * يستخدم Heroicons (outline style) لضمان التناسق في جميع أنحاء منصة وفر
 */

import AppIcon from "./AppIcon.vue";

import {
  // الأيقونات الأساسية
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  CogIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,

  // أيقونات الإجراءات
  PlusIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,

  // أيقونات التنقل
  Bars3Icon,
  Bars3BottomRightIcon,
  XCircleIcon,
  ListBulletIcon,
  Squares2X2Icon,
  SwatchIcon,
  ArrowLeftEndOnRectangleIcon,

  // أيقونات الإحصائيات
  ChartBarIcon,
  ChartPieIcon,
  FunnelIcon,

  // أيقونات التنبيهات
  BellIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,

  // أيقونات الملفات
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  CloudIcon,
  DocumentMagnifyingGlassIcon,
  DocumentChartBarIcon,
  DocumentDuplicateIcon,
  
  // أيقونات المستخدم
  UserCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserGroupIcon,
  IdentificationIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon,

  // أيقونات التصنيفات
  TagIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  BookOpenIcon,

  // أيقونات الاتصال
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,

  // أيقونات متنوعة
  BoltIcon,
  StarIcon,
  HeartIcon,
  FlagIcon,
  TrashIcon,
  PencilIcon,
  PencilSquareIcon,
  ClipboardIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CalendarIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ScaleIcon,
  TruckIcon,
  PhotoIcon,
  HashtagIcon,

  // أيقونات التحميل
  ArrowUpIcon,
  ArrowDownIcon,

  // أيقونات الرد
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  TicketIcon,

  // أيقونات إضافية
  WifiIcon,
  ServerIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CubeIcon,
  CircleStackIcon,
  KeyIcon,

  // أيقونات السمة
  SunIcon,
  MoonIcon,
} from "@heroicons/vue/24/outline";

// تصدير جميع الأيقونات
export const Icons = {
  // الأيقونات الأساسية
  Home: HomeIcon,
  Search: MagnifyingGlassIcon,
  MagnifyingGlass: MagnifyingGlassIcon,
  User: UserIcon,
  Users: UsersIcon,
  BuildingOffice: BuildingOfficeIcon,
  Banknotes: BanknotesIcon,
  CurrencyDollar: CurrencyDollarIcon,
  CreditCard: CreditCardIcon,
  DocumentText: DocumentTextIcon,
  Document: DocumentIcon,
  Folder: FolderIcon,
  FolderOpen: FolderOpenIcon,
  Cog: CogIcon,
  Cog6Tooth: Cog6ToothIcon,
  Settings: AdjustmentsHorizontalIcon,
  AdjustmentsHorizontal: AdjustmentsHorizontalIcon,

  // أيقونات الإجراءات
  Plus: PlusIcon,
  PlusCircle: PlusCircleIcon,
  MinusCircle: MinusCircleIcon,
  X: XMarkIcon,
  XMark: XMarkIcon,
  Check: CheckIcon,
  CheckCircle: CheckCircleIcon,
  CheckBadge: CheckBadgeIcon,
  Refresh: ArrowPathIcon,
  Spinner: ArrowPathIcon,
  ArrowUpTray: ArrowUpTrayIcon,
  ArrowDownTray: ArrowDownTrayIcon,
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  ArrowRightStartOnRectangle: ArrowRightStartOnRectangleIcon,
  Logout: ArrowRightStartOnRectangleIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronUp: ChevronUpIcon,
  ChevronDown: ChevronDownIcon,
  ChevronDoubleRight: ChevronDoubleRightIcon,
  EllipsisH: EllipsisHorizontalIcon,
  EllipsisV: EllipsisVerticalIcon,

  // أيقونات التنقل
  Bars3: Bars3Icon,
  Bars3BottomRight: Bars3BottomRightIcon,
  Menu: Bars3Icon,
  XCircle: XCircleIcon,
  List: ListBulletIcon,
  Grid: Squares2X2Icon,
  Squares2X2: Squares2X2Icon,
  Swatch: SwatchIcon,
  ChartSquareBar: ChartBarIcon,

  // أيقونات الإحصائيات
  ChartBar: ChartBarIcon,
  ChartPie: ChartPieIcon,
  ChartSquare: Squares2X2Icon,
  Funnel: FunnelIcon,

  // أيقونات التنبيهات
  Bell: BellIcon,
  BellAlert: BellAlertIcon,
  ExclamationTriangle: ExclamationTriangleIcon,
  ExclamationCircle: ExclamationCircleIcon,
  InformationCircle: InformationCircleIcon,

  // أيقونات الملفات
  CloudArrowUp: CloudArrowUpIcon,
  CloudArrowDown: CloudArrowDownIcon,
  Cloud: CloudIcon,
  DocumentMagnifyingGlass: DocumentMagnifyingGlassIcon,
  DocumentChart: DocumentChartBarIcon,
  DocumentDuplicate: DocumentDuplicateIcon,
  
  // أيقونات المستخدم
  UserCircle: UserCircleIcon,
  UserPlus: UserPlusIcon,
  UserMinus: UserMinusIcon,
  UserGroup: UserGroupIcon,
  Identification: IdentificationIcon,
  Lock: LockClosedIcon,
  LockOpen: LockOpenIcon,
  Eye: EyeIcon,
  EyeSlash: EyeSlashIcon,

  // أيقونات التصنيفات
  Tag: TagIcon,
  Bookmark: BookmarkIcon,
  BookmarkSlash: BookmarkSlashIcon,
  BookOpen: BookOpenIcon,

  // أيقونات الاتصال
  Phone: PhoneIcon,
  Envelope: EnvelopeIcon,
  Globe: GlobeAltIcon,
  MapPin: MapPinIcon,

  // أيقونات متنوعة
  Bolt: BoltIcon,
  Signal: BoltIcon,
  Star: StarIcon,
  Heart: HeartIcon,
  Flag: FlagIcon,
  Trash: TrashIcon,
  Pencil: PencilIcon,
  PencilSquare: PencilSquareIcon,
  Clipboard: ClipboardIcon,
  ClipboardList: ClipboardDocumentListIcon,
  ClipboardDocumentList: ClipboardDocumentListIcon,
  Clock: ClockIcon,
  Calendar: CalendarIcon,
  CalendarDays: CalendarDaysIcon,
  Sparkles: SparklesIcon,
  ShieldCheck: ShieldCheckIcon,
  ShieldExclamation: ShieldExclamationIcon,
  Scale: ScaleIcon,
  Truck: TruckIcon,
  Photo: PhotoIcon,
  Hashtag: HashtagIcon,
  ArrowLeftEndOnRectangle: ArrowLeftEndOnRectangleIcon,

  // أيقونات التحميل
  ArrowUp: ArrowUpIcon,
  ArrowDown: ArrowDownIcon,

  // أيقونات الرد
  ChatBubble: ChatBubbleLeftIcon,
  ChatBubbleLeftRight: ChatBubbleLeftRightIcon,
  PaperAirplane: PaperAirplaneIcon,
  TicketIcon: TicketIcon,

  // أيقونات إضافية
  Wifi: WifiIcon,
  Server: ServerIcon,
  CpuChip: CpuChipIcon,
  DevicePhoneMobile: DevicePhoneMobileIcon,
  ComputerDesktop: ComputerDesktopIcon,
  Cube: CubeIcon,
  CircleStack: CircleStackIcon,
  Key: KeyIcon,
  BuildingBank: BuildingOfficeIcon,

  // أيقونات السمة
  Sun: SunIcon,
  Moon: MoonIcon,
  Computer: ComputerDesktopIcon,
};

// الأسماء المستعارة الشائعة - kebab-case وغيرها
export const IconAliases = {
  // التنقل
  "nav-home": "Home",
  "nav-search": "Search",
  "nav-upload": "CloudArrowUp",
  "nav-files": "Folder",
  "nav-compare": "ChartBar",
  "nav-history": "Clock",
  "nav-subscriptions": "CreditCard",
  "nav-payments": "CurrencyDollar",
  "nav-profile": "User",

  // الإجراءات
  "action-add": "Plus",
  "action-edit": "Pencil",
  "action-delete": "Trash",
  "action-download": "ArrowDownTray",
  "action-upload": "ArrowUpTray",
  "action-save": "Check",
  "action-cancel": "X",
  "action-refresh": "Refresh",
  "action-close": "XCircle",

  // الإحصائيات
  "stats-users": "Users",
  "stats-files": "DocumentText",
  "stats-revenue": "CurrencyDollar",
  "stats-growth": "ChartBar",

  // الحالة
  "status-success": "CheckCircle",
  "status-error": "ExclamationCircle",
  "status-warning": "ExclamationTriangle",
  "status-info": "InformationCircle",
  "status-loading": "Spinner",

  // الأخطاء
  "error-404": "DocumentMagnifyingGlass",
  "error-500": "ExclamationTriangle",

  // kebab-case aliases (لضمان التوافق مع الاستخدامات السابقة)
  home: "Home",
  search: "Search",
  "magnifying-glass": "MagnifyingGlass",
  "document-text": "DocumentText",
  document: "Document",
  folder: "Folder",
  "folder-open": "FolderOpen",
  "chart-bar": "ChartBar",
  "chart-square": "ChartSquare",
  "currency-dollar": "CurrencyDollar",
  "credit-card": "CreditCard",
  "cloud-arrow-up": "CloudArrowUp",
  "cloud-arrow-down": "CloudArrowDown",
  cloud: "Cloud",
  "check-circle": "CheckCircle",
  "x-circle": "XCircle",
  "chevron-right": "ChevronRight",
  "chevron-up": "ChevronUp",
  "chevron-down": "ChevronDown",
  "chevron-double-right": "ChevronDoubleRight",
  xmark: "X",
  "information-circle": "InformationCircle",
  "exclamation-circle": "ExclamationCircle",
  "exclamation-triangle": "ExclamationTriangle",
  user: "User",
  users: "Users",
  bell: "Bell",
  clock: "Clock",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "arrow-up": "ArrowUp",
  "arrow-down": "ArrowDown",
  x: "X",
  plus: "Plus",
  check: "Check",
  trash: "Trash",
  settings: "Settings",
  "adjustments-horizontal": "AdjustmentsHorizontal",
  spinner: "Spinner",
  refresh: "Refresh",
  signal: "Signal",
  "arrow-right-start-on-rectangle": "ArrowRightStartOnRectangle",
  "chat-bubble-left-right": "ChatBubbleLeftRight",
  "ticket": "TicketIcon",
  "paper-airplane": "PaperAirplane",
  TicketIcon: "TicketIcon",
  PaperAirplaneIcon: "PaperAirplane",
  bars3: "Bars3",
  "bars-3": "Bars3",
  "cog6-tooth": "Cog6Tooth",
  "building-office": "BuildingOffice",
  phone: "Phone",
  lock: "Lock",
  eye: "Eye",
  "eye-slash": "EyeSlash",
  bolt: "Bolt",
  server: "Server",
  "cpu-chip": "CpuChip",
  key: "Key",
  "building-bank": "BuildingBank",
  "lock-closed": "Lock",
  "lock-open": "LockOpen",
  LockClosed: "Lock",
  GlobeAlt: "Globe",
  ArrowPath: "Refresh",
  Photo: "Photo",
  Hashtag: "Hashtag",
  ArrowLeftEndOnRectangle: "ArrowLeftEndOnRectangle",
  envelope: "Envelope",
  "shield-check": "ShieldCheck",
  pencil: "Pencil",
  "arrow-down-tray": "ArrowDownTray",
  "arrow-up-tray": "ArrowUpTray",
  "arrow-path": "Refresh",
  "clipboard-document-list": "ClipboardDocumentList",
  "document-magnifying-glass": "DocumentMagnifyingGlass",
};

// دالة للحصول على أيقونة بالاسم
export const getIcon = (name) => {
  if (!name) return null;

  // إذا كان الاسم component بالفعل
  if (typeof name === "object" && name?.render) {
    return name;
  }

  // محاولة الحصول على الاسم المستعقارن أولاً
  const aliasName = IconAliases[name];
  const iconName = aliasName || name;

  // محاولة camelCase مع حرف أول كبير (PascalCase)
  const pascalCaseName = name
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  // البحث عن الأيقونة بالترتيب:
  // 1. الاسم الأصلي كما هو
  // 2. PascalCase
  return Icons[iconName] || Icons[pascalCaseName] || null;
};

// الحجم الافتراضي للأيقونات
export const IconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
  "3xl": "w-12 h-12",
};

// لون الأيقونات
export const IconColors = {
  primary: "text-primary-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  info: "text-blue-600",
  white: "text-white",
  gray: "text-gray-400",
  dark: "text-gray-900",
};

export default Icons;
export { AppIcon };
