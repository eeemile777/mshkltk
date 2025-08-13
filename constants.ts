import { ReportCategory, ReportStatus, Badge } from './types';
import { FaRoad, FaTrash, FaLightbulb, FaQuestionCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

export const PATHS = {
  HOME: '/',
  MAP: '/map',
  TRENDING: '/trending',
  REPORT_FORM: '/report/new',
  REPORT_DETAILS: '/report/:id',
  NOTIFICATIONS: '/notifications',
  ACHIEVEMENTS: '/achievements',
  PROFILE: '/profile',
  ABOUT: '/about',
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_ANONYMOUS: '/auth/anonymous',
  LOGOUT: '/logout',
};

export const TILE_URL_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
export const TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';


export const CATEGORY_ICONS: Record<ReportCategory, IconType> = {
  [ReportCategory.Roads]: FaRoad,
  [ReportCategory.Waste]: FaTrash,
  [ReportCategory.Lighting]: FaLightbulb,
  [ReportCategory.Other]: FaQuestionCircle,
};

export const STATUS_COLORS: Record<ReportStatus, { light: string, dark: string }> = {
    [ReportStatus.New]: { light: 'bg-gray-200 text-gray-800', dark: 'bg-gray-700 text-gray-200' },
    [ReportStatus.Received]: { light: 'bg-sky text-white', dark: 'bg-cyan-dark text-bg-dark' },
    [ReportStatus.InProgress]: { light: 'bg-teal text-white', dark: 'bg-teal-dark text-bg-dark' },
    [ReportStatus.Resolved]: { light: 'bg-mango text-white', dark: 'bg-mango-dark text-bg-dark' },
};

export const CATEGORY_COLORS: Record<ReportCategory, { light: string, dark: string }> = {
    [ReportCategory.Roads]: { light: '#00BFA6', dark: '#00D2B5' }, // Teal
    [ReportCategory.Waste]: { light: '#FFA62B', dark: '#FFB84D' }, // Mango
    [ReportCategory.Lighting]: { light: '#4BA3C3', dark: '#5BC0EB' }, // Sky/Cyan
    [ReportCategory.Other]: { light: '#0D3B66', dark: '#B0B8C1' }, // Navy/Warm Gray
};

export const BADGES: Record<string, Badge> = {
  pioneer: {
    id: 'pioneer',
    name_ar: 'الرائد',
    name_en: 'Pioneer',
    description_ar: 'لتقديمك أول بلاغ صحيح.',
    description_en: 'For submitting your first valid report.',
    icon: '🚀',
  },
  community_helper: {
    id: 'community_helper',
    name_ar: 'مساعد المجتمع',
    name_en: 'Community Helper',
    description_ar: 'لتأكيدك 5 بلاغات من الآخرين.',
    description_en: 'For confirming 5 reports from others.',
    icon: '🤝',
  },
  waste_warrior: {
    id: 'waste_warrior',
    name_ar: 'محارب النفايات',
    name_en: 'Waste Warrior',
    description_ar: 'للإبلاغ عن 3 مشاكل نفايات.',
    description_en: 'For reporting 3 waste issues.',
    icon: '🗑️',
  },
};

export const translations = {
  ar: {
    appTitle: 'مشكلتك',
    // Auth
    loginTitle: 'تسجيل الدخول',
    signupTitle: 'إنشاء حساب',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    login: 'دخول',
    createAccount: 'إنشاء حساب',
    continueAsGuest: 'المتابعة كضيف',
    invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    firstName: 'الاسم',
    lastName: 'الكنية',
    confirmPassword: 'تأكيد كلمة المرور',
    create: 'إنشاء',
    fieldRequired: 'هذا الحقل مطلوب',
    passwordMinLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين',
    usernameTaken: 'اسم المستخدم هذا مستخدم بالفعل',
    signupSuccess: 'تم إنشاء الحساب بنجاح!',
    guestHint: 'يمكنك اختيار وضع الضيف لاحقاً من تسجيل الخروج.',
    guestMessage: 'أنت في وضع الضيف. لإنشاء حساب وحفظ تقدمك، الرجاء تسجيل الخروج ثم إنشاء حساب جديد.',
    
    // Navigation
    navHome: 'الرئيسية',
    navMap: 'الخريطة',
    navTrending: 'الأكثر تفاعلاً',
    navReport: 'تبليغ جديد',
    navNotifications: 'الإشعارات',
    navProfile: 'ملفي',
    
    // Home Page
    trending: 'الأكثر تفاعلاً',
    mostRecent: 'الأحدث',
    expandMap: 'توسيع الخريطة',
    viewFullReport: 'عرض التفاصيل',
    upvotes: 'تأييد',
    confirmations: 'تأكيدات',
    nearMe: 'بالقرب مني',

    // Report Details
    reportDetails: 'تفاصيل البلاغ',
    category: 'الفئة',
    status: 'الحالة',
    confirmIssue: 'شفتها',
    description: 'الوصف',
    location: 'الموقع',
    area: 'المنطقة',
    
    // Report Form
    newReport: 'بلاغ جديد',
    uploadPhoto: 'تحميل الصور',
    photoPreview: 'معاينة الصورة',
    selectCategory: 'اختر الفئة',
    describeProblem: 'صف المشكلة باختصار',
    submitReport: 'إرسال البلاغ',
    checkingCredibility: 'جاري التحقق من الصورة...',
    credibilityPass: 'صورة مناسبة ✅',
    credibilityNeedsReview: 'جرّب صورة أوضح ⚠️',
    dragPin: 'اسحب الدبوس لتحديد الموقع',
    privacyNotice: 'نخفي الإحداثيات الدقيقة للمنازل',
    submissionSuccess: 'تم استلام بلاغك بنجاح!',
    useCurrentLocation: 'استخدام موقعي الحالي',
    fetchingAddress: 'جاري جلب العنوان...',
    addressNotFound: 'تعذر العثور على العنوان',
    address: 'العنوان',
    fetchError: 'فشل في الاتصال. يرجى التحقق من اتصالك بالإنترنت.',


    // Profile & Achievements
    profile: 'الملف الشخصي',
    myReports: 'بلاغاتي',
    achievements: 'الإنجازات',
    points: 'نقاط',
    noReportsFound: 'لم تقم بتقديم أي بلاغات بعد.',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    earned: 'مكتسبة',
    unearned: 'غير مكتسبة',

    // Notifications
    notifications: 'الإشعارات',
    markAllAsRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات جديدة.',

    // About
    about: 'عن مشكلتك',
    mission: 'مهمتنا هي تمكين المواطنين للمساهمة في تحسين مجتمعاتهم من خلال الإبلاغ السهل والفعال عن المشكلات المحلية.',
    contact: 'تواصل معنا',

    // Categories
    [ReportCategory.Roads]: 'طرق',
    [ReportCategory.Waste]: 'نفايات',
    [ReportCategory.Lighting]: 'إنارة',
    [ReportCategory.Other]: 'أخرى',
    // Statuses
    [ReportStatus.New]: 'جديد',
    [ReportStatus.Received]: 'تم الاستلام',
    [ReportStatus.InProgress]: 'قيد المعالجة',
    [ReportStatus.Resolved]: 'تم الحل',
  },
  en: {
    appTitle: 'Mshkltk',
    // Auth
    loginTitle: 'Log In',
    signupTitle: 'Create Account',
    username: 'Username',
    password: 'Password',
    login: 'Log In',
    createAccount: 'Create Account',
    continueAsGuest: 'Continue as Guest',
    invalidCredentials: 'Invalid username or password.',
    firstName: 'First Name',
    lastName: 'Last Name',
    confirmPassword: 'Confirm Password',
    create: 'Create',
    fieldRequired: 'This field is required',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    usernameTaken: 'This username is already taken',
    signupSuccess: 'Account created successfully!',
    guestHint: 'You can choose guest mode later by logging out.',
    guestMessage: 'You are in guest mode. To create an account and save your progress, please log out and create a new account.',

    // Navigation
    navHome: 'Home',
    navMap: 'Map',
    navTrending: 'Trending',
    navReport: 'New Report',
    navNotifications: 'Notifications',
    navProfile: 'Profile',

    // Home Page
    trending: 'Trending',
    mostRecent: 'Most Recent',
    expandMap: 'Expand Map',
    viewFullReport: 'View Details',
    upvotes: 'Upvotes',
    confirmations: 'Confirmations',
    nearMe: 'Near Me',

    // Report Details
    reportDetails: 'Report Details',
    category: 'Category',
    status: 'Status',
    confirmIssue: 'I saw this',
    description: 'Description',
    location: 'Location',
    area: 'Area',
    
    // Report Form
    newReport: 'New Report',
    uploadPhoto: 'Upload Photos',
    photoPreview: 'Photo Preview',
    selectCategory: 'Select Category',
    describeProblem: 'Briefly describe the issue',
    submitReport: 'Submit Report',
    checkingCredibility: 'Checking image...',
    credibilityPass: 'Suitable photo ✅',
    credibilityNeedsReview: 'Try a clearer photo ⚠️',
    dragPin: 'Drag pin to set location',
    privacyNotice: 'We hide exact home coordinates',
    submissionSuccess: 'Your report has been received!',
    useCurrentLocation: 'Use My Current Location',
    fetchingAddress: 'Fetching address...',
    addressNotFound: 'Address not found',
    address: 'Address',
    fetchError: 'Failed to fetch. Please check your internet connection.',
    
    // Profile & Achievements
    profile: 'Profile',
    myReports: 'My Reports',
    achievements: 'Achievements',
    points: 'Points',
    noReportsFound: 'You haven\'t submitted any reports yet.',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    logout: 'Logout',
    earned: 'Earned',
    unearned: 'Unearned',
    
    // Notifications
    notifications: 'Notifications',
    markAllAsRead: 'Mark all as read',
    noNotifications: 'No new notifications.',

    // About
    about: 'About Mshkltk',
    mission: 'Our mission is to empower citizens to improve their communities through easy and effective reporting of local issues.',
    contact: 'Contact Us',

    // Categories
    [ReportCategory.Roads]: 'Roads',
    [ReportCategory.Waste]: 'Waste',
    [ReportCategory.Lighting]: 'Lighting',
    [ReportCategory.Other]: 'Other',
    // Statuses
    [ReportStatus.New]: 'New',
    [ReportStatus.Received]: 'Received',
    [ReportStatus.InProgress]: 'In Progress',
    [ReportStatus.Resolved]: 'Resolved',
  },
};