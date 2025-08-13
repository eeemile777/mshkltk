import { Report, User, ReportCategory, ReportStatus, Notification, NotificationType } from '../types';

// mockUsers is removed. Users will be managed in localStorage via mockApi.

export const mockReports: Report[] = [
  {
    id: 'report-1',
    created_by: 'user-1',
    category: ReportCategory.Roads,
    note: 'حفرة كبيرة في شارع الحمرا تسببت في أضرار للسيارات. تحتاج إلى إصلاح عاجل.',
    lat: 33.8983,
    lng: 35.4763,
    area: "بيروت - الحمرا",
    photo_urls: ['https://picsum.photos/seed/road1/800/600'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: ReportStatus.Received,
    confirmations_count: 15,
  },
  {
    id: 'report-2',
    created_by: 'user-2',
    category: ReportCategory.Waste,
    note: 'تراكم النفايات قرب كورنيش الميناء. الرائحة أصبحت لا تطاق.',
    lat: 34.4512,
    lng: 35.8331,
    area: "طرابلس - الميناء",
    photo_urls: ['https://picsum.photos/seed/waste1/800/600'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    status: ReportStatus.InProgress,
    confirmations_count: 32,
  },
  {
    id: 'report-3',
    created_by: 'user-1',
    category: ReportCategory.Lighting,
    note: 'إنارة الشارع لا تعمل في شارع الكسليك منذ أسبوع.',
    lat: 33.9830,
    lng: 35.6167,
    area: "جونيه - الكسليك",
    photo_urls: ['https://picsum.photos/seed/light1/800/600'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    status: ReportStatus.Resolved,
    confirmations_count: 8,
  },
  {
    id: 'report-4',
    created_by: 'user-3',
    category: ReportCategory.Other,
    note: 'A stray dog has been seen wandering near the old souk. It seems friendly but scared.',
    lat: 34.1230,
    lng: 35.6459,
    area: "Byblos - Old Souk",
    photo_urls: ['https://picsum.photos/seed/other1/800/600'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 day ago
    status: ReportStatus.New,
    confirmations_count: 3,
  },
];

export const mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        user_id: 'user-1',
        type: NotificationType.StatusChange,
        message_ar: 'تم تغيير حالة بلاغك "حفرة كبيرة" إلى قيد المعالجة.',
        message_en: 'Your report "Large pothole" status was changed to In Progress.',
        report_id: 'report-1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
    },
    {
        id: 'notif-2',
        user_id: 'user-1',
        type: NotificationType.Badge,
        message_ar: 'تهانينا! لقد حصلت على شارة "محارب النفايات".',
        message_en: 'Congratulations! You\'ve earned the "Waste Warrior" badge.',
        report_id: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: false,
    },
    {
        id: 'notif-3',
        user_id: 'user-1',
        type: NotificationType.Confirm,
        message_ar: 'أكّد "علي" بلاغك بخصوص "إنارة الشارع".',
        message_en: '"Ali" confirmed your report about "Street lighting".',
        report_id: 'report-3',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        read: true,
    }
];