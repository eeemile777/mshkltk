import { Report, User, Notification, ReportStatus, Comment, ReportHistory, NotificationType, ReportCategory, AuditLog, DynamicCategory, DynamicBadge, GamificationSettings } from '../types';
import { generateSalt, hashPassword } from './crypto';
// FIX: Import DB_NAME and DB_VERSION to resolve "Cannot find name" errors.
import { dbService, STORES, DB_NAME, DB_VERSION, getDb } from './db';
import { getAvatarUrl, DEFAULT_AVATAR_URL } from '../data/mockImages';

// --- Session Wrapper Interface ---
// This interface ensures the user object is nested, protecting its 'id' from being overwritten by the session's key.
interface SessionWrapper {
    id: 'citizen_session' | 'portal_session' | 'super_admin_session';
    user: User;
}

// --- Database Initialization and Seeding ---
const initializeDatabase = async () => {
    await dbService.init();

    const superAdmin: Omit<User, 'password_hash' | 'salt'> = {
        id: 'user-super-admin',
        username: 'miloadmin',
        first_name: 'Milo',
        last_name: 'Admin',
        display_name: 'Super Admin',
        is_anonymous: false,
        points: 9999,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: getAvatarUrl('Milo Admin'),
        onboarding_complete: true,
        role: 'super_admin',
        is_active: true,
    };

    const defaultAdmins: Omit<User, 'password_hash' | 'salt'>[] = [
      {
        id: 'user-municipality-beirut',
        username: 'beirut_admin',
        first_name: 'Beirut',
        last_name: 'Admin',
        display_name: 'Beirut Municipality',
        is_anonymous: false,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: getAvatarUrl('Beirut Municipality'),
        onboarding_complete: true,
        role: 'municipality',
        municipality_id: 'beirut',
        is_active: true,
        portal_access_level: 'read_write',
      },
      {
        id: 'user-municipality-tripoli',
        username: 'tripoli_admin',
        first_name: 'Tripoli',
        last_name: 'Admin',
        display_name: 'Tripoli Municipality',
        is_anonymous: false,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: getAvatarUrl('Tripoli Municipality'),
        onboarding_complete: true,
        role: 'municipality',
        municipality_id: 'tripoli',
        is_active: true,
        portal_access_level: 'read_write',
      }
    ];
    
    const defaultUsersRaw: Omit<User, 'password_hash' | 'salt'>[] = [
      {
        id: 'user-1',
        username: 'nader',
        first_name: 'Nader',
        last_name: 'H',
        display_name: 'Nader H',
        is_anonymous: false,
        points: 150,
        achievements: ['pioneer', 'waste_warrior', 'road_guardian'],
        reports_count: 5,
        reportsConfirmed: 2,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        avatarUrl: getAvatarUrl('Nader H'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-2',
        username: 'sara',
        first_name: 'Sara',
        last_name: 'K',
        display_name: 'Sara K',
        is_anonymous: false,
        points: 120,
        achievements: ['good_samaritan', 'community_helper'],
        reports_count: 3,
        reportsConfirmed: 6,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
        avatarUrl: getAvatarUrl('Sara K'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-3',
        username: 'ali',
        first_name: 'Ali',
        last_name: 'M',
        display_name: 'Ali M',
        is_anonymous: false,
        points: 95,
        achievements: ['city_explorer'],
        reports_count: 4,
        reportsConfirmed: 3,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        avatarUrl: getAvatarUrl('Ali M'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-4',
        username: 'jad',
        first_name: 'Jad',
        last_name: 'K',
        display_name: 'Jad K',
        is_anonymous: false,
        points: 80,
        achievements: ['pioneer', 'good_samaritan'],
        reports_count: 2,
        reportsConfirmed: 4,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        avatarUrl: getAvatarUrl('Jad K'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: false, // Example of a deactivated user
      },
      {
        id: 'user-5',
        username: 'fatima',
        first_name: 'Fatima',
        last_name: 'A',
        display_name: 'Fatima A',
        is_anonymous: false,
        points: 210,
        achievements: ['civic_leader', 'waste_warrior', 'pioneer'],
        reports_count: 8,
        reportsConfirmed: 10,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
        avatarUrl: getAvatarUrl('Fatima A'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-6',
        username: 'omar',
        first_name: 'Omar',
        last_name: 'B',
        display_name: 'Omar B',
        is_anonymous: false,
        points: 55,
        achievements: ['pioneer'],
        reports_count: 1,
        reportsConfirmed: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        avatarUrl: getAvatarUrl('Omar B'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-7',
        username: 'layla',
        first_name: 'Layla',
        last_name: 'S',
        display_name: 'Layla S',
        is_anonymous: false,
        points: 135,
        achievements: ['park_protector', 'community_helper'],
        reports_count: 5,
        reportsConfirmed: 5,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        avatarUrl: getAvatarUrl('Layla S'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      {
        id: 'user-8',
        username: 'karim',
        first_name: 'Karim',
        last_name: 'N',
        display_name: 'Karim N',
        is_anonymous: false,
        points: 70,
        achievements: ['safety_sentinel'],
        reports_count: 3,
        reportsConfirmed: 2,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        avatarUrl: getAvatarUrl('Karim N'),
        onboarding_complete: true,
        role: 'citizen',
        is_active: true,
      },
      // --- START: Added new users for data expansion ---
      { id: 'user-9', username: 'yara_s', first_name: 'Yara', last_name: 'S', display_name: 'Yara S', is_anonymous: false, points: 175, achievements: ['pioneer', 'community_helper', 'water_watchdog'], reports_count: 6, reportsConfirmed: 8, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(), avatarUrl: getAvatarUrl('Yara S'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-10', username: 'rami_g', first_name: 'Rami', last_name: 'G', display_name: 'Rami G', is_anonymous: false, points: 60, achievements: ['pioneer', 'urban_planner'], reports_count: 2, reportsConfirmed: 1, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), avatarUrl: getAvatarUrl('Rami G'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-11', username: 'dina_h', first_name: 'Dina', last_name: 'H', display_name: 'Dina H', is_anonymous: false, points: 190, achievements: ['lightbringer', 'city_explorer'], reports_count: 7, reportsConfirmed: 9, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), avatarUrl: getAvatarUrl('Dina H'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-12', username: 'hassan_a', first_name: 'Hassan', last_name: 'A', display_name: 'Hassan A', is_anonymous: false, points: 45, achievements: ['pioneer'], reports_count: 1, reportsConfirmed: 0, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), avatarUrl: getAvatarUrl('Hassan A'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-13', username: 'maya_b', first_name: 'Maya', last_name: 'B', display_name: 'Maya B', is_anonymous: false, points: 250, achievements: ['civic_leader', 'health_hero'], reports_count: 10, reportsConfirmed: 12, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(), avatarUrl: getAvatarUrl('Maya B'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-14', username: 'ziad_f', first_name: 'Ziad', last_name: 'F', display_name: 'Ziad F', is_anonymous: false, points: 115, achievements: ['good_samaritan', 'road_guardian'], reports_count: 4, reportsConfirmed: 5, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(), avatarUrl: getAvatarUrl('Ziad F'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-15', username: 'leila_n', first_name: 'Leila', last_name: 'N', display_name: 'Leila N', is_anonymous: false, points: 88, achievements: ['pioneer', 'park_protector'], reports_count: 3, reportsConfirmed: 3, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), avatarUrl: getAvatarUrl('Leila N'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-16', username: 'khalil_m', first_name: 'Khalil', last_name: 'M', display_name: 'Khalil M', is_anonymous: false, points: 162, achievements: ['city_explorer', 'community_helper'], reports_count: 5, reportsConfirmed: 7, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(), avatarUrl: getAvatarUrl('Khalil M'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-17', username: 'nour_d', first_name: 'Nour', last_name: 'D', display_name: 'Nour D', is_anonymous: false, points: 99, achievements: ['waste_warrior'], reports_count: 3, reportsConfirmed: 4, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), avatarUrl: getAvatarUrl('Nour D'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-18', username: 'fadi_t', first_name: 'Fadi', last_name: 'T', display_name: 'Fadi T', is_anonymous: false, points: 140, achievements: ['pioneer', 'safety_sentinel'], reports_count: 4, reportsConfirmed: 6, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), avatarUrl: getAvatarUrl('Fadi T'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-19', username: 'jana_r', first_name: 'Jana', last_name: 'R', display_name: 'Jana R', is_anonymous: false, points: 72, achievements: ['pioneer'], reports_count: 2, reportsConfirmed: 2, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), avatarUrl: getAvatarUrl('Jana R'), onboarding_complete: true, role: 'citizen', is_active: true },
      { id: 'user-20', username: 'wassim_k', first_name: 'Wassim', last_name: 'K', display_name: 'Wassim K', is_anonymous: false, points: 205, achievements: ['civic_leader', 'good_samaritan'], reports_count: 8, reportsConfirmed: 11, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(), avatarUrl: getAvatarUrl('Wassim K'), onboarding_complete: true, role: 'citizen', is_active: true },
      // --- END: Added new users ---
    ];
    await dbService.seedInitialData(defaultUsersRaw, defaultAdmins, superAdmin);
};

// Call initialization on module load. This returns a promise.
const dbReady = initializeDatabase();

const delay = <T,>(data: T, ms = 100): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

// --- Audit Log ---
export const logAuditEvent = async (actor: User, message: string): Promise<void> => {
    await dbReady;
    const logEntry: AuditLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.display_name,
        actorRole: actor.role,
        message: message,
    };
    await dbService.put('audit_logs', logEntry);
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    await dbReady;
    const logs = await dbService.getAll<AuditLog>('audit_logs');
    return delay(logs);
};

// --- Notification Creator ---
const createNotification = async (
  userId: string, 
  type: NotificationType, 
  metadata: { [key: string]: string },
  reportId: string | null = null
): Promise<Notification> => {
  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.random()}`,
    user_id: userId,
    type,
    report_id: reportId,
    created_at: new Date().toISOString(),
    read: false,
    metadata,
  };
  await dbService.put<Notification>('notifications', newNotification);
  return newNotification;
};

// --- API Functions ---

// -- User Management --
export const createUser = async (data: Pick<User, 'first_name' | 'last_name' | 'username' | 'avatarUrl'> & { password: string }): Promise<User> => {
    await dbReady;
    const allUsers = await dbService.getAll<User>('users');
    if (allUsers.some(u => u.username?.toLowerCase() === data.username.toLowerCase())) {
        throw new Error('Username already exists');
    }
    const salt = generateSalt();
    const newUser: User = {
        id: `user-${Date.now()}`,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        display_name: `${data.first_name} ${data.last_name}`,
        is_anonymous: false,
        password_hash: await hashPassword(data.password, salt),
        password_plain: data.password,
        salt,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: data.avatarUrl || DEFAULT_AVATAR_URL,
        onboarding_complete: false,
        role: 'citizen',
        is_active: true,
    };
    await dbService.put<User>('users', newUser);
    await logAuditEvent(newUser, `created a new account.`);
    return delay(newUser);
};

// @ts-ignore
export const createAdminUser = async (data: {
    role: 'municipality' | 'utility' | 'union_of_municipalities';
    username: string;
    display_name: string;
    password: string;
    municipality_id?: string;
    scoped_categories?: ReportCategory[];
    scoped_municipalities?: string[];
    scoped_sub_categories?: string[];
    portal_title?: string;
    portal_subtitle?: string;
    portal_access_level?: 'read_write' | 'read_only';
}, actor?: User): Promise<User> => {
    await dbReady;
    const allUsers = await dbService.getAll<User>('users');

    if (allUsers.some(u => u.username?.toLowerCase() === data.username.toLowerCase())) {
        throw new Error(`Username ${data.username} already exists`);
    }
    if (data.role === 'municipality' && allUsers.some(u => u.role === 'municipality' && u.municipality_id === data.municipality_id)) {
        throw new Error(`An account for municipality ID ${data.municipality_id} already exists`);
    }
    
    const salt = generateSalt();
    const newUser: User = {
        id: `user-${data.role}-${data.username}-${Date.now()}`,
        username: data.username,
        first_name: data.display_name.split(' ')[0],
        last_name: 'Admin',
        display_name: data.display_name,
        is_anonymous: false,
        password_hash: await hashPassword(data.password, salt),
        password_plain: data.password,
        salt,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: getAvatarUrl(data.display_name),
        onboarding_complete: true,
        role: data.role,
        is_active: true,
        portal_title: data.portal_title,
        portal_subtitle: data.portal_subtitle,
        portal_access_level: data.portal_access_level || 'read_write',
    };
    
    if (data.role === 'municipality') {
        newUser.municipality_id = data.municipality_id;
    } else if (data.role === 'utility') {
        newUser.scoped_categories = data.scoped_categories;
        newUser.scoped_municipalities = data.scoped_municipalities;
        newUser.scoped_sub_categories = data.scoped_sub_categories;
    } else if (data.role === 'union_of_municipalities') {
        newUser.scoped_municipalities = data.scoped_municipalities;
    }

    await dbService.put<User>('users', newUser);
    if (actor) {
        await logAuditEvent(actor, `created a new admin account "${newUser.display_name}".`);
    }
    return delay(newUser);
};

export const upgradeAnonymousUser = async (
    anonymousUser: User,
    newData: Pick<User, 'first_name' | 'last_name' | 'username' | 'avatarUrl'> & { password: string }
): Promise<User> => {
    await dbReady;
    
    // 1. Check for username uniqueness
    const allUsers = await dbService.getAll<User>('users');
    if (allUsers.some(u => u.username?.toLowerCase() === newData.username.toLowerCase())) {
        throw new Error('Username already exists');
    }

    // 2. Create the new user object by merging data
    const salt = generateSalt();
    const newUser: User = {
        // New data
        id: `user-${Date.now()}`,
        first_name: newData.first_name,
        last_name: newData.last_name,
        username: newData.username,
        display_name: `${newData.first_name} ${newData.last_name}`,
        is_anonymous: false,
        password_hash: await hashPassword(newData.password, salt),
        password_plain: newData.password,
        salt,
        avatarUrl: newData.avatarUrl,
        onboarding_complete: true, // Mark as complete since they've used the app
        role: 'citizen',
        created_at: new Date().toISOString(),
        is_active: true,

        // Migrated data from anonymous user
        points: anonymousUser.points,
        achievements: anonymousUser.achievements,
        reports_count: anonymousUser.reports_count,
        reportsConfirmed: anonymousUser.reportsConfirmed,
        confirmedReportIds: anonymousUser.confirmedReportIds,
        subscribedReportIds: anonymousUser.subscribedReportIds,
    };

    // 3. Re-assign reports from anonymous user to the new user
    const allReports = await dbService.getAll<Report>('reports');
    const reportsToUpdate = allReports.filter(r => r.created_by === anonymousUser.id);
    for (const report of reportsToUpdate) {
        report.created_by = newUser.id;
        // Also update the subscription list if the anon user was subscribed to their own report
        if(report.subscribedUserIds?.includes(anonymousUser.id)) {
            report.subscribedUserIds = report.subscribedUserIds.map(id => id === anonymousUser.id ? newUser.id : id);
        }
        await dbService.put<Report>('reports', report);
    }
    
    // 4. Save new user and delete old anonymous user
    await dbService.put<User>('users', newUser);
    await dbService.delete('users', anonymousUser.id);
    await logAuditEvent(newUser, `upgraded their anonymous account.`);

    return delay(newUser);
};

export const createAnonymousUser = async (): Promise<User> => {
    await dbReady;
    const anonId = `anon-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const user: User = {
        id: anonId,
        username: `anonymous_${anonId}`,
        display_name: `Anonymous#${Math.floor(Math.random() * 9000) + 1000}`,
        first_name: '',
        last_name: '',
        is_anonymous: true,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: DEFAULT_AVATAR_URL,
        onboarding_complete: false,
        role: 'citizen',
        is_active: true,
    };
    await dbService.put<User>('users', user);
    await logAuditEvent(user, `started a guest session.`);
    return delay(user);
};

export const loginUser = async (data: Pick<User, 'username'> & { password: string }, isPortalLogin: boolean = false, isSuperAdminLogin: boolean = false): Promise<User> => {
    await dbReady;
    const allUsers = await dbService.getAll<User>('users');
    const user = allUsers.find(u => u.username?.toLowerCase() === data.username.toLowerCase());
    
    if (!user || user.is_active === false) {
        throw new Error('Invalid username, password, or account is suspended.');
    }
    
    const hash = await hashPassword(data.password, user.salt!);
    if (hash !== user.password_hash) {
        throw new Error('Invalid username or password.');
    }

    if (isSuperAdminLogin) {
        if (user.role !== 'super_admin') {
            throw new Error('This user does not have super admin access.');
        }
    } else if (isPortalLogin) {
        if (user.role === 'super_admin') {
            throw new Error('Super Admin account detected. Please use the Super Admin Portal.');
        }
        if (user.role !== 'municipality' && user.role !== 'utility' && user.role !== 'union_of_municipalities') {
            throw new Error('This user does not have portal access.');
        }
    } else { // Citizen login
        if (user.role !== 'citizen') {
            throw new Error('Admin accounts must use their respective portals.');
        }
    }
    
    await logAuditEvent(user, 'logged in.');
    return delay(user);
};

// -- Session Management --
const getSessionKey = (isPortal: boolean = false, isSuperAdmin: boolean = false): SessionWrapper['id'] => {
    if (isSuperAdmin) return 'super_admin_session';
    return isPortal ? 'portal_session' : 'citizen_session';
};

export const setCurrentUser = async (user: User, isPortal: boolean = false, isSuperAdmin: boolean = false): Promise<void> => {
    await dbReady;
    const sessionKey = getSessionKey(isPortal, isSuperAdmin);
    const session: SessionWrapper = { id: sessionKey, user };
    await dbService.put<SessionWrapper>('sessions', session);
};

export const getCurrentUser = async (): Promise<User | null> => {
    await dbReady;
    const session = await dbService.get<SessionWrapper>('sessions', getSessionKey());
    return session ? session.user : null;
};

export const getCurrentPortalUser = async (): Promise<User | null> => {
    await dbReady;
    const session = await dbService.get<SessionWrapper>('sessions', getSessionKey(true));
    return session ? session.user : null;
};

export const getCurrentSuperAdminUser = async (): Promise<User | null> => {
    await dbReady;
    const session = await dbService.get<SessionWrapper>('sessions', getSessionKey(false, true));
    return session ? session.user : null;
};

export const logout = async (isPortal: boolean = false, isSuperAdmin: boolean = false): Promise<void> => {
    await dbReady;
    await dbService.delete('sessions', getSessionKey(isPortal, isSuperAdmin));
};

export const updateUserAvatar = async (avatarUrl: string): Promise<User> => {
    await dbReady;
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const updatedUser = { ...currentUser, avatarUrl };
    await dbService.put<User>('users', updatedUser);
    await setCurrentUser(updatedUser);
    return updatedUser;
}

// -- Data Fetching --
export const fetchReports = async (): Promise<Report[]> => {
    await dbReady;
    const reports = await dbService.getAll<Report>('reports');
    return delay(reports);
};

export const fetchTrendingReports = async (): Promise<Report[]> => {
    await dbReady;
    const allReports = await dbService.getAll<Report>('reports');
    const sorted = allReports.sort((a, b) => b.confirmations_count - a.confirmations_count);
    return delay(sorted.slice(0, 10)); // Top 10
};

export const fetchLeaderboardUsers = async (): Promise<User[]> => {
    await dbReady;
    const allUsers = await dbService.getAll<User>('users');
    const sorted = allUsers
        .filter(u => u.role === 'citizen' && !u.is_anonymous)
        .sort((a, b) => b.points - a.points);
    return delay(sorted);
};

export const fetchNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    await dbReady;
    const allNotifs = await dbService.getAll<Notification>('notifications');
    const userNotifs = allNotifs.filter(n => n.user_id === userId);
    return delay(userNotifs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};

export const fetchCommentsByReportId = async (reportId: string): Promise<(Comment & { user: User })[]> => {
    await dbReady;
    const allComments = await dbService.getAll<Comment>('comments');
    const allUsers = await dbService.getAll<User>('users');
    const userMap = new Map(allUsers.map(u => [u.id, u]));
    
    const reportComments = allComments
        .filter(c => c.report_id === reportId)
        .map(c => ({
            ...c,
            user: userMap.get(c.user_id) || {
                id: c.user_id, display_name: 'Unknown User', avatarUrl: DEFAULT_AVATAR_URL
            } as User,
        }));
        
    return delay(reportComments.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
};

export const fetchHistoryByReportId = async (reportId: string): Promise<ReportHistory[]> => {
    await dbReady;
    const allHistory = await dbService.getAll<ReportHistory>('reportHistory');
    const reportHistory = allHistory.filter(h => h.report_id === reportId);
    return delay(reportHistory.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()));
};

export const fetchAllReportHistory = async (): Promise<ReportHistory[]> => {
    await dbReady;
    const allHistory = await dbService.getAll<ReportHistory>('reportHistory');
    return delay(allHistory);
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
    await dbReady;
    const user = await dbService.get<User>('users', userId);
    return delay(user || null);
};

export const listUsers = async(): Promise<User[]> => {
    await dbReady;
    const users = await dbService.getAll<User>('users');
    return delay(users);
}

// -- Data Mutation --
export const submitReport = async (
    data: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>,
    actor: User
): Promise<Report> => {
    await dbReady;
    const newReport: Report = {
        ...data,
        id: `report-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: ReportStatus.New,
        confirmations_count: 1,
        subscribedUserIds: [data.created_by],
    };
    await dbService.put<Report>('reports', newReport);
    // Also add to history
    await dbService.put<ReportHistory>('reportHistory', {
        id: `hist-${Date.now()}`,
        report_id: newReport.id,
        status: ReportStatus.New,
        updated_at: newReport.created_at,
        updated_by_id: actor.id,
        updated_by_name: actor.display_name,
    });
    await logAuditEvent(actor, `submitted a new report "${newReport.title_en}".`);
    return delay(newReport);
};

export const confirmReport = async (reportId: string, actor: User): Promise<{report: Report, newNotifications: Notification[]}> => {
    await dbReady;
    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');
    
    report.confirmations_count += 1;
    await dbService.put<Report>('reports', report);
    
    await logAuditEvent(actor, `confirmed the report "${report.title_en}".`);
    
    const newNotifications: Notification[] = [];
    if (report.created_by !== actor.id) {
        const notif = await createNotification(report.created_by, NotificationType.Confirm, { reportTitle: report.title_en }, reportId);
        newNotifications.push(notif);
    }
    
    return delay({ report, newNotifications });
};

export const addComment = async (reportId: string, text: string, actor: User): Promise<{ comment: Comment & { user: User }, newNotifications: Notification[] }> => {
    await dbReady;
    
    if (actor.role !== 'citizen' && actor.role !== 'super_admin' && actor.portal_access_level === 'read_only') {
        throw new Error('Permission Denied: This user has read-only access and cannot add comments.');
    }

    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');
    
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        report_id: reportId,
        user_id: actor.id,
        text,
        created_at: new Date().toISOString(),
    };
    await dbService.put<Comment>('comments', newComment);
    await logAuditEvent(actor, `commented on report "${report.title_en}".`);
    
    // Create notifications for subscribers
    const newNotifications: Notification[] = [];
    const subscribers = (report.subscribedUserIds || []).filter(id => id !== actor.id);
    const commenterName = actor.display_name;
    for (const subId of subscribers) {
        const isCreator = subId === report.created_by;
        const notif = await createNotification(subId, NotificationType.NewComment, { 
            reportTitle: report.title_en,
            commenterName,
            isCreator: String(isCreator),
        }, reportId);
        newNotifications.push(notif);
    }

    return delay({ comment: { ...newComment, user: actor }, newNotifications });
};

export const toggleSubscription = async (reportId: string, actorId: string): Promise<{ report: Report, user: User, newNotifications: Notification[]}> => {
    await dbReady;
    
    // BUG FIX: Fetch fresh user and report data from the database to prevent race conditions and stale state updates.
    const actor = await dbService.get<User>('users', actorId);
    if (!actor) throw new Error("User not found for subscription toggle");
    
    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');

    const isSubscribed = report.subscribedUserIds?.includes(actor.id);
    if (isSubscribed) {
        report.subscribedUserIds = report.subscribedUserIds?.filter(id => id !== actor.id);
        actor.subscribedReportIds = actor.subscribedReportIds?.filter(id => id !== reportId);
    } else {
        report.subscribedUserIds = [...(report.subscribedUserIds || []), actor.id];
        actor.subscribedReportIds = [...(actor.subscribedReportIds || []), reportId];
    }
    
    await dbService.put<Report>('reports', report);
    await dbService.put<User>('users', actor);
    
    const action = isSubscribed ? 'unsubscribed from' : 'subscribed to';
    await logAuditEvent(actor, `${action} report "${report.title_en}".`);

    const newNotifications: Notification[] = [];
    if (!isSubscribed) {
        const notif = await createNotification(actor.id, NotificationType.NewFollower, {
            reportTitle: report.title_en,
            isSelf: "true",
        }, reportId);
        newNotifications.push(notif);
    }

    return delay({ report, user: actor, newNotifications });
};


// --- Portal-specific Mutations ---

export const updateReportStatus = async (reportId: string, status: ReportStatus, proofPhotoUrl?: string, actor?: User): Promise<Report> => {
    await dbReady;

    if (actor && actor.role !== 'citizen' && actor.role !== 'super_admin' && actor.portal_access_level === 'read_only') {
        throw new Error('Permission Denied: This user has read-only access and cannot change report statuses.');
    }
    
    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');
    
    const oldStatus = report.status;
    report.status = status;

    if (proofPhotoUrl && status === ReportStatus.Resolved) {
        report.photo_urls = [...report.photo_urls, proofPhotoUrl];
    }

    await dbService.put<Report>('reports', report);
    
    if (actor) {
        await logAuditEvent(actor, `changed status of report "${report.title_en}" to ${status}.`);
    }
    
    // Create history entry
    const newHistory: ReportHistory = {
        id: `hist-${Date.now()}`,
        report_id: reportId,
        status: status,
        updated_at: new Date().toISOString(),
        updated_by_id: actor?.id,
        updated_by_name: actor?.display_name,
    };
    await dbService.put<ReportHistory>('reportHistory', newHistory);
    
    // Notify subscribers
    const subscribers = report.subscribedUserIds || [];
    for (const subId of subscribers) {
        await createNotification(subId, NotificationType.StatusChange, {
            reportTitle: report.title_en,
            newStatus: status,
            oldStatus: oldStatus,
        }, reportId);
    }

    return delay(report);
};

export const requestResolutionProof = async (reportId: string, actor: User): Promise<Notification[]> => {
    await dbReady;

    if (actor.role !== 'citizen' && actor.role !== 'super_admin' && actor.portal_access_level === 'read_only') {
        throw new Error('Permission Denied: This user has read-only access and cannot request proof.');
    }

    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');

    await logAuditEvent(actor, `requested photo proof for report "${report.title_en}".`);

    const newNotifications: Notification[] = [];
    if (report.created_by) {
        const notif = await createNotification(
            report.created_by,
            NotificationType.ProofRequest,
            { reportTitle: report.title_en },
            reportId
        );
        newNotifications.push(notif);
    }

    return delay(newNotifications);
};


// --- Super Admin Mutations ---
export const updateReport = async(reportId: string, updates: Partial<Report>, actor?: User): Promise<Report> => {
    await dbReady;
    const report = await dbService.get<Report>('reports', reportId);
    if (!report) throw new Error('Report not found');

    // Check if status is changing and create a history entry
    if (updates.status && updates.status !== report.status) {
        const newHistory: ReportHistory = {
            id: `hist-${Date.now()}`,
            report_id: reportId,
            status: updates.status,
            updated_at: new Date().toISOString(),
            updated_by_id: actor?.id,
            updated_by_name: actor?.display_name
        };
        await dbService.put<ReportHistory>('reportHistory', newHistory);
    }
    
    const updatedReport = { ...report, ...updates };
    await dbService.put('reports', updatedReport);
    if (actor) {
        await logAuditEvent(actor, `updated report "${report.title_en}" (ID: ${reportId}).`);
    }
    return updatedReport;
};

export const deleteComment = async(commentId: string, actor?: User): Promise<void> => {
    await dbReady;
    const comment = await dbService.get<Comment>('comments', commentId);
    await dbService.delete('comments', commentId);
    if (actor && comment) {
        await logAuditEvent(actor, `deleted a comment (ID: ${commentId}).`);
    }
};

export const deleteUser = async(userId: string, actor?: User): Promise<void> => {
    await dbReady;
    const userToDelete = await dbService.get<User>('users', userId);
    if (actor && userToDelete) {
        await logAuditEvent(actor, `deleted user "${userToDelete.display_name}" (ID: ${userId}).`);
    }
    
    const dbInstance = getDb();
    if (!dbInstance) {
        throw new Error("Database connection is not available to perform user deletion.");
    }

    const tx = dbInstance.transaction(STORES, 'readwrite');
    const stores = {
        users: tx.objectStore('users'),
        reports: tx.objectStore('reports'),
        comments: tx.objectStore('comments'),
    };

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => {
            console.error("Transaction error in deleteUser:", tx.error);
            reject(tx.error);
        };

        // 1. Delete the user record.
        stores.users.delete(userId);

        // 2. Anonymize reports created by the user and remove them from subscriptions.
        const reportsCursorReq = stores.reports.openCursor();
        reportsCursorReq.onsuccess = () => {
            const cursor = reportsCursorReq.result;
            if (cursor) {
                const report: Report = cursor.value;
                let wasUpdated = false;

                if (report.created_by === userId) {
                    report.created_by = 'user_deleted'; // Anonymize creator
                    wasUpdated = true;
                }

                if (report.subscribedUserIds?.includes(userId)) {
                    report.subscribedUserIds = report.subscribedUserIds.filter(id => id !== userId);
                    wasUpdated = true;
                }

                if (wasUpdated) {
                    cursor.update(report);
                }
                cursor.continue();
            }
        };

        // 3. Anonymize comments made by the user.
        const commentsCursorReq = stores.comments.openCursor();
        commentsCursorReq.onsuccess = () => {
            const cursor = commentsCursorReq.result;
            if (cursor) {
                if (cursor.value.user_id === userId) {
                    const commentToUpdate = cursor.value;
                    commentToUpdate.user_id = 'user_deleted'; // Anonymize commenter
                    cursor.update(commentToUpdate);
                }
                cursor.continue();
            }
        };
    });
};


export const deleteReportAndAssociatedData = async (reportId: string, actor?: User): Promise<void> => {
    await dbReady;
    const reportToDelete = await dbService.get<Report>('reports', reportId);
    const dbInstance = getDb();
    if (!dbInstance) {
        throw new Error("Database connection is not available to perform deletion.");
    }

    const tx = dbInstance.transaction(STORES, 'readwrite');
    const stores = {
        reports: tx.objectStore('reports'),
        comments: tx.objectStore('comments'),
        reportHistory: tx.objectStore('reportHistory'),
        notifications: tx.objectStore('notifications'),
        users: tx.objectStore('users'),
    };

    return new Promise((resolve, reject) => {
        tx.oncomplete = async () => {
             if (actor && reportToDelete) {
                await logAuditEvent(actor, `deleted report "${reportToDelete.title_en}" (ID: ${reportId}).`);
            }
            resolve()
        };
        tx.onerror = () => reject(tx.error);

        // 1. Delete the report
        stores.reports.delete(reportId);

        // 2. Delete comments
        const commentsCursorReq = stores.comments.openCursor();
        commentsCursorReq.onsuccess = () => {
            const cursor = commentsCursorReq.result;
            if (cursor) {
                if (cursor.value.report_id === reportId) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };

        // 3. Delete history
        const historyCursorReq = stores.reportHistory.openCursor();
        historyCursorReq.onsuccess = () => {
            const cursor = historyCursorReq.result;
            if (cursor) {
                if (cursor.value.report_id === reportId) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };

        // 4. Delete notifications
        const notifsCursorReq = stores.notifications.openCursor();
        notifsCursorReq.onsuccess = () => {
            const cursor = notifsCursorReq.result;
            if (cursor) {
                if (cursor.value.report_id === reportId) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };

        // 5. Update users
        const usersCursorReq = stores.users.openCursor();
        usersCursorReq.onsuccess = () => {
            const cursor = usersCursorReq.result;
            if (cursor) {
                const user: User = cursor.value;
                let updated = false;
                if (user.subscribedReportIds?.includes(reportId)) {
                    user.subscribedReportIds = user.subscribedReportIds.filter(id => id !== reportId);
                    updated = true;
                }
                if (user.confirmedReportIds?.includes(reportId)) {
                    user.confirmedReportIds = user.confirmedReportIds.filter(id => id !== reportId);
                    updated = true;
                }
                if (updated) {
                    cursor.update(user);
                }
                cursor.continue();
            }
        };
    });
};

export const updateUser = async(userId: string, updates: Partial<User> & { newPassword?: string; pointAdjustment?: number }, actor?: User): Promise<User> => {
    await dbReady;
    const user = await dbService.get<User>('users', userId);
    if (!user) throw new Error('User not found');
    
    let passwordUpdates: Partial<User> = {};
    if (updates.newPassword) {
        const salt = generateSalt();
        const password_hash = await hashPassword(updates.newPassword, salt);
        passwordUpdates = { salt, password_hash, password_plain: updates.newPassword };
    }
    
    const { newPassword, pointAdjustment, ...otherUpdates } = updates;
    
    const updatedUser = { ...user, ...otherUpdates, ...passwordUpdates };

    if (pointAdjustment) {
        updatedUser.points = (updatedUser.points || 0) + pointAdjustment;
    }
    
    await dbService.put('users', updatedUser);
     if (actor) {
        await logAuditEvent(actor, `updated user "${user.display_name}" (ID: ${userId}).`);
    }
    return updatedUser;
};

// --- Super Admin Config Mutations ---
export const updateDynamicCategory = async (category: DynamicCategory, actor: User): Promise<DynamicCategory> => {
    await dbService.put('dynamic_categories', category);
    await logAuditEvent(actor, `updated the category "${category.name_en}".`);
    return category;
};

export const addDynamicCategory = async (category: DynamicCategory, actor: User): Promise<DynamicCategory> => {
    await dbService.put('dynamic_categories', category);
    await logAuditEvent(actor, `created the category "${category.name_en}".`);
    return category;
};

export const deleteDynamicCategory = async (categoryId: ReportCategory, categoryName: string, actor: User): Promise<void> => {
    await dbService.delete('dynamic_categories', categoryId);
    await logAuditEvent(actor, `deleted the category "${categoryName}".`);
};

export const updateGamificationSettings = async (settings: GamificationSettings, actor: User): Promise<GamificationSettings> => {
    await dbService.put('gamification_settings', settings);
    await logAuditEvent(actor, `updated gamification point rules.`);
    return settings;
};

export const updateDynamicBadge = async (badge: DynamicBadge, actor: User): Promise<DynamicBadge> => {
    await dbService.put('dynamic_badges', badge);
    await logAuditEvent(actor, `updated the badge "${badge.name_en}".`);
    return badge;
};

export const addDynamicBadge = async (badge: DynamicBadge, actor: User): Promise<DynamicBadge> => {
    await dbService.put('dynamic_badges', badge);
    await logAuditEvent(actor, `created the badge "${badge.name_en}".`);
    return badge;
};

export const deleteDynamicBadge = async (badgeId: string, badgeName: string, actor: User): Promise<void> => {
    await dbService.delete('dynamic_badges', badgeId);
    await logAuditEvent(actor, `deleted the badge "${badgeName}".`);
};