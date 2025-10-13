// FIX: Replaced placeholder content with mock data.
// FIX: Import ReportCategory type.
import { Report, ReportStatus, Notification, NotificationType, Comment, ReportHistory, ReportSeverity, ReportCategory } from '../types';
import { getReportImageUrl } from './mockImages';
import { CATEGORIES } from '../constants';

// Helper to generate random dates within September 2025
const d_sep = (day: number, baseHour = 9, minuteSpread = 60) => {
    const randomHour = baseHour + Math.floor(Math.random() * 8); // 9 AM to 5 PM
    const randomMinute = Math.floor(Math.random() * minuteSpread);
    return new Date(2025, 8, day, randomHour, randomMinute).toISOString(); // Month is 0-indexed, so 8 = September
};

// --- Initial, hand-crafted detailed reports ---
const initialReports: Report[] = [
  {
    id: 'report-1',
    title_en: 'Infrastructure issue in Ashrafieh',
    title_ar: 'مشكلة بنية تحتية في الأشرفية',
    photo_urls: [getReportImageUrl('infrastructure', CATEGORIES), getReportImageUrl('infrastructure', CATEGORIES)],
    lat: 33.8938,
    lng: 35.5018,
    area: 'Ashrafieh, Beirut',
    municipality: 'beirut',
    category: 'infrastructure',
    sub_category: 'unpaved_roads',
    note_en: 'A very large and dangerous pothole has formed on the main road near the ABC mall. It needs urgent repair.',
    note_ar: 'تشكلت حفرة كبيرة وخطيرة جدًا على الطريق الرئيسي بالقرب من مول ABC. تحتاج إلى إصلاح عاجل.',
    status: ReportStatus.New,
    severity: ReportSeverity.High,
    confirmations_count: 5,
    created_at: d_sep(28),
    created_by: 'user-1',
    subscribedUserIds: ['user-1', 'user-2'],
  },
  {
    id: 'report-2',
    title_en: 'Waste issue in Hamra',
    title_ar: 'مشكلة نفايات في الحمرا',
    photo_urls: [getReportImageUrl('waste_environment', CATEGORIES)],
    lat: 33.8886,
    lng: 35.4955,
    area: 'Hamra, Beirut',
    municipality: 'beirut',
    category: 'waste_environment',
    sub_category: 'missing_bins',
    note_en: 'The dumpster on the corner of Hamra street has been overflowing for three days. It smells terrible and is attracting pests.',
    note_ar: 'حاوية القمامة على زاوية شارع الحمرا تفيض منذ ثلاثة أيام. الرائحة كريهة جدا وتجذب الحشرات.',
    status: ReportStatus.InProgress,
    severity: ReportSeverity.Medium,
    confirmations_count: 12,
    created_at: d_sep(25),
    created_by: 'user-2',
    subscribedUserIds: ['user-2', 'user-1', 'user-3'],
  },
  {
    id: 'report-3',
    title_en: 'Lighting issue on Seaside Road',
    title_ar: 'مشكلة إنارة على الطريق الساحلي',
    photo_urls: [getReportImageUrl('electricity_energy', CATEGORIES), getReportImageUrl('electricity_energy', CATEGORIES)],
    lat: 34.4363,
    lng: 35.8444,
    area: 'Mina, Tripoli',
    municipality: 'tripoli',
    category: 'electricity_energy',
    sub_category: 'public_lighting',
    note_en: 'The main streetlight on the corniche has been out for over a week, making it very dark and unsafe at night.',
    note_ar: 'ضوء الشارع الرئيسي على الكورنيش معطل منذ أكثر من أسبوع، مما يجعل المكان مظلماً وغير آمن في الليل.',
    status: ReportStatus.Resolved,
    severity: ReportSeverity.Low,
    confirmations_count: 8,
    created_at: d_sep(1),
    created_by: 'user-3',
    subscribedUserIds: ['user-3'],
  },
    {
    id: 'report-104',
    title_en: 'Unsafe Generator Wires in Gemmayze',
    title_ar: 'أسلاك مولدات غير آمنة في الجميزة',
    photo_urls: [getReportImageUrl('electricity_energy', CATEGORIES)],
    lat: 33.8972, lng: 35.5125,
    area: 'Gemmayze, Beirut', municipality: 'beirut',
    category: 'electricity_energy', sub_category: 'unsafe_generators',
    note_en: 'Tangled and exposed generator wires are hanging dangerously low over the sidewalk on Gouraud Street.',
    note_ar: 'أسلاك مولدات متشابكة ومكشوفة تتدلى بشكل خطير على ارتفاع منخفض فوق الرصيف في شارع غورو.',
    status: ReportStatus.New, severity: ReportSeverity.High, confirmations_count: 11, created_at: d_sep(29), created_by: 'user-6'
  },
  {
    id: 'report-203',
    title_en: 'Illegal Dumping Near Fishing Port',
    title_ar: 'رمي نفايات غير شرعي قرب ميناء الصيد',
    photo_urls: [getReportImageUrl('waste_environment', CATEGORIES)],
    lat: 34.4455, lng: 35.8270,
    area: 'Mina, Tripoli', municipality: 'tripoli',
    category: 'waste_environment', sub_category: 'illegal_dumping',
    note_en: 'Construction debris and household garbage are being illegally dumped on the coast near the Mina fishing port.',
    note_ar: 'يتم إلقاء مخلفات البناء والقمامة المنزلية بشكل غير قانوني على الساحل بالقرب من ميناء الصيد في المينا.',
    status: ReportStatus.New, severity: ReportSeverity.High, confirmations_count: 25, created_at: d_sep(28), created_by: 'user-5'
  },
];

// --- Procedural Generation Setup ---
const allCategories: ReportCategory[] = Object.keys(CATEGORIES) as ReportCategory[];
const allUsers = [
    ...Array.from({ length: 20 }, (_, i) => `user-${i + 1}`),
    'anon-12345', 'anon-67890', 'anon-54321', 'anon-171819', 'anon-202122'
];

interface City {
    name_en: string;
    name_ar: string;
    lat: number;
    lng: number;
    municipality: string;
}

const tripoliAreaCities: City[] = [
    { name_en: 'Mina', name_ar: 'الميناء', lat: 34.445, lng: 35.827, municipality: 'tripoli' },
    { name_en: 'El-Tell', name_ar: 'التل', lat: 34.436, lng: 35.833, municipality: 'tripoli' },
    { name_en: 'Qoubbeh', name_ar: 'القبة', lat: 34.431, lng: 35.855, municipality: 'tripoli' },
    { name_en: 'Bab Al-Tabbaneh', name_ar: 'باب التبانة', lat: 34.439, lng: 35.848, municipality: 'tripoli' },
    { name_en: 'Azmi Street', name_ar: 'شارع عزمي', lat: 34.433, lng: 35.839, municipality: 'tripoli' },
    { name_en: 'Qalamoun', name_ar: 'القلمون', lat: 34.373, lng: 35.781, municipality: 'qalamoun' },
    { name_en: 'Beddawi', name_ar: 'البداوي', lat: 34.457, lng: 35.861, municipality: 'tripoli' },
];

const beirutAreaCities: City[] = [
    { name_en: 'Ashrafieh', name_ar: 'الأشرفية', lat: 33.888, lng: 35.515, municipality: 'beirut' },
    { name_en: 'Hamra', name_ar: 'الحمرا', lat: 33.896, lng: 35.482, municipality: 'beirut' },
    { name_en: 'Gemmayze', name_ar: 'الجميزة', lat: 33.897, lng: 35.512, municipality: 'beirut' },
    { name_en: 'Mar Mikhael', name_ar: 'مار مخايل', lat: 33.898, lng: 35.522, municipality: 'beirut' },
    { name_en: 'Verdun', name_ar: 'فردان', lat: 33.889, lng: 35.478, municipality: 'beirut' },
    { name_en: 'Raouche', name_ar: 'الروشة', lat: 33.892, lng: 35.471, municipality: 'beirut' },
    { name_en: 'Borj Hammoud', name_ar: 'برج حمود', lat: 33.907, lng: 35.533, municipality: 'beirut' },
];

const otherLebanonCities: City[] = [
    // Mount Lebanon
    { name_en: 'Jounieh', name_ar: 'جونيه', lat: 33.983, lng: 35.641, municipality: 'jounieh' },
    { name_en: 'Byblos (Jbeil)', name_ar: 'جبيل', lat: 34.123, lng: 35.651, municipality: 'byblos' },
    { name_en: 'Aley', name_ar: 'عاليه', lat: 33.805, lng: 35.600, municipality: 'aley' },
    { name_en: 'Broummana', name_ar: 'برمانا', lat: 33.890, lng: 35.617, municipality: 'broummana' },
    // South
    { name_en: 'Sidon (Saida)', name_ar: 'صيدا', lat: 33.559, lng: 35.371, municipality: 'sidon' },
    { name_en: 'Tyre (Sour)', name_ar: 'صور', lat: 33.273, lng: 35.193, municipality: 'tyre' },
    { name_en: 'Nabatieh', name_ar: 'النبطية', lat: 33.378, lng: 35.485, municipality: 'nabatieh' },
    // Bekaa
    { name_en: 'Zahle', name_ar: 'زحلة', lat: 33.846, lng: 35.906, municipality: 'zahle' },
    { name_en: 'Baalbek', name_ar: 'بعلبك', lat: 34.006, lng: 36.208, municipality: 'baalbek' },
    // North
    { name_en: 'Batroun', name_ar: 'البترون', lat: 34.255, lng: 35.658, municipality: 'batroun' },
    { name_en: 'Zgharta', name_ar: 'زغرتا', lat: 34.398, lng: 35.895, municipality: 'zgharta' },
];

const generatedReports: Report[] = [];

const generateReport = (id: number, city: City) => {
    const categoryKey = allCategories[id % allCategories.length];
    const categoryData = CATEGORIES[categoryKey];
    const subCategoryKeys = Object.keys(categoryData.subCategories);
    const subCategoryKey = subCategoryKeys[id % subCategoryKeys.length];

    const report: Report = {
        id: `report-${1000 + id}`,
        title_en: `Reported issue in ${city.name_en}`,
        title_ar: `بلاغ في منطقة ${city.name_ar}`,
        photo_urls: [getReportImageUrl(categoryKey, CATEGORIES)],
        lat: city.lat + (Math.random() - 0.5) * 0.01,
        lng: city.lng + (Math.random() - 0.5) * 0.01,
        area: `${city.name_en}, Lebanon`,
        municipality: city.municipality,
        category: categoryKey,
        sub_category: subCategoryKey,
        note_en: `This is a report regarding an issue in the area of ${city.name_en}. The situation requires attention.`,
        note_ar: `هذا بلاغ بخصوص مشكلة تم ملاحظتها في منطقة ${city.name_ar}. الوضع يتطلب اهتماماً.`,
        status: Object.values(ReportStatus)[id % 4],
        severity: Object.values(ReportSeverity)[id % 3],
        confirmations_count: Math.floor(Math.random() * 40),
        created_at: d_sep(Math.floor(Math.random() * 28) + 1),
        created_by: allUsers[id % allUsers.length],
        subscribedUserIds: [],
    };
    generatedReports.push(report);
};

// --- Generation Logic ---
const TOTAL_REPORTS = 200;
const TRIPOLI_PERCENT = 0.30;
const BEIRUT_PERCENT = 0.25;

const numTripoli = Math.floor(TOTAL_REPORTS * TRIPOLI_PERCENT);
const numBeirut = Math.floor(TOTAL_REPORTS * BEIRUT_PERCENT);
const numOther = TOTAL_REPORTS - numTripoli - numBeirut;

for (let i = 0; i < numTripoli; i++) {
    generateReport(i, tripoliAreaCities[i % tripoliAreaCities.length]);
}
for (let i = 0; i < numBeirut; i++) {
    generateReport(numTripoli + i, beirutAreaCities[i % beirutAreaCities.length]);
}
for (let i = 0; i < numOther; i++) {
    generateReport(numTripoli + numBeirut + i, otherLebanonCities[i % otherLebanonCities.length]);
}

export const mockReports: Report[] = [...initialReports, ...generatedReports];

// --- Generate Supporting Data (Comments, History, Notifs) ---
const generatedComments: Comment[] = [];
const generatedHistory: ReportHistory[] = [];
const generatedNotifications: Notification[] = [];

generatedReports.forEach((report, i) => {
    // Add history for reports that are not new
    if (report.status !== ReportStatus.New) {
        const historyTrail: ReportStatus[] = [];
        historyTrail.push(ReportStatus.New);
        if (report.status === ReportStatus.Received || report.status === ReportStatus.InProgress || report.status === ReportStatus.Resolved) {
            historyTrail.push(ReportStatus.Received);
        }
        if (report.status === ReportStatus.InProgress || report.status === ReportStatus.Resolved) {
            historyTrail.push(ReportStatus.InProgress);
        }
        if (report.status === ReportStatus.Resolved) {
            historyTrail.push(ReportStatus.Resolved);
        }
        
        historyTrail.forEach((status, index) => {
            const reportDate = new Date(report.created_at);
            const updated_at = new Date(reportDate.getTime() + index * 6 * 3600 * 1000).toISOString(); // 6 hours apart
            generatedHistory.push({ id: `hist-${report.id}-${index}`, report_id: report.id, status, updated_at });
        });
    }

    // Add comments to a third of the reports
    if (i % 3 === 0 && report.confirmations_count > 5) {
        const municipalityUser = report.municipality === 'beirut' ? 'user-municipality-beirut' : 'user-municipality-tripoli';
        const commentDate1 = new Date(new Date(report.created_at).getTime() + 2 * 3600 * 1000).toISOString();
        const commentDate2 = new Date(new Date(report.created_at).getTime() + 5 * 3600 * 1000).toISOString();

        generatedComments.push({
            id: `comment-${report.id}-1`, report_id: report.id, user_id: allUsers[(i + 1) % allUsers.length], text: 'I saw this too, it really needs to be fixed.', created_at: commentDate1
        });
        generatedComments.push({
            id: `comment-${report.id}-2`, report_id: report.id, user_id: municipalityUser, text: 'Thank you for your report. Our team has been notified and will investigate the issue.', created_at: commentDate2
        });
    }
});


export const mockNotifications: Notification[] = [
  { id: 'notif-1', user_id: 'user-1', type: NotificationType.StatusChange, report_id: 'report-2', metadata: { reportTitle: 'Overflowing Dumpster', newStatus: 'in_progress', }, created_at: d_sep(25, 18), read: false, },
  { id: 'notif-2', user_id: 'user-3', type: NotificationType.Badge, report_id: null, metadata: { badgeName: 'Pioneer', }, created_at: d_sep(2, 10), read: true, },
  { id: 'notif-3', user_id: 'user-2', type: NotificationType.Confirm, report_id: 'report-1', metadata: { reportTitle: 'Large Pothole on Main Street' }, created_at: d_sep(28, 11), read: false, },
  { id: 'notif-4', user_id: 'user-1', type: NotificationType.NewComment, report_id: 'report-2', metadata: { commenterName: 'Ali M', reportTitle: 'Overflowing Dumpster', isCreator: 'true' }, created_at: d_sep(25, 15), read: false, },
  ...generatedNotifications,
];

export const mockComments: Comment[] = [
  { id: 'comment-1', report_id: 'report-2', user_id: 'user-3', text: 'This is a serious health hazard! It needs to be addressed immediately.', created_at: d_sep(25, 14), },
  { id: 'comment-2', report_id: 'report-2', user_id: 'user-municipality-beirut', text: 'Thank you for your report. Our team has been dispatched and is currently working on clearing the area. We appreciate your patience.', created_at: d_sep(25, 17), },
  { id: 'comment-3', report_id: 'report-3', user_id: 'user-municipality-tripoli', text: 'The streetlight has been repaired. Thank you for bringing this to our attention.', created_at: d_sep(2, 9), },
  ...generatedComments,
];

export const mockReportHistory: ReportHistory[] = [
  // Original histories
  { id: 'hist-1', report_id: 'report-2', status: ReportStatus.New, updated_at: d_sep(25, 10), },
  { id: 'hist-2', report_id: 'report-2', status: ReportStatus.Received, updated_at: d_sep(25, 13), },
  { id: 'hist-3', report_id: 'report-2', status: ReportStatus.InProgress, updated_at: d_sep(25, 17), },
  { id: 'hist-4', report_id: 'report-3', status: ReportStatus.New, updated_at: d_sep(1, 11), },
  { id: 'hist-5', report_id: 'report-3', status: ReportStatus.Received, updated_at: d_sep(1, 16), },
  { id: 'hist-6', report_id: 'report-3', status: ReportStatus.Resolved, updated_at: d_sep(2, 9), },
  ...generatedHistory
];
