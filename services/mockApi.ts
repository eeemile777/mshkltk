import { mockReports, mockNotifications } from '../data/mockData';
import { Report, User, Notification, ReportStatus } from '../types';
import { generateSalt, hashPassword } from './crypto';

const USERS_KEY = 'mshkltk.users';
const SESSION_KEY = 'mshkltk.currentUser';

// --- Storage Utilities ---
const readUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error("Failed to read users from localStorage", e);
    return [];
  }
};

const writeUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Internal helper to persist changes to a user in the main user list
const updateUserInList = (userToUpdate: User) => {
    if (userToUpdate.is_anonymous) return; // Don't persist guest users in the main list
    const allUsers = readUsers();
    const userIndex = allUsers.findIndex(u => u.id === userToUpdate.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = userToUpdate;
        writeUsers(allUsers);
    }
};

const readSession = (): User | null => {
  try {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    console.error("Failed to read session from localStorage", e);
    return null;
  }
};

const writeSession = (user: User | null): void => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Also update the main user list to persist changes like points/badges
    updateUserInList(user);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

let reports: Report[] = [...mockReports];
let notifications: Notification[] = [...mockNotifications];

const delay = <T,>(data: T, ms = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

// --- Auth API ---

export const getCurrentUser = (): Promise<User | null> => {
    return Promise.resolve(readSession());
};

export const setCurrentUser = (user: User | null): Promise<void> => {
    writeSession(user);
    return Promise.resolve();
};

export const listUsers = (): Promise<User[]> => {
    return Promise.resolve(readUsers());
};

export const createUser = async (data: Pick<User, 'first_name' | 'last_name' | 'username'> & {password: string}): Promise<User> => {
    const users = readUsers();
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        throw new Error('Username already exists');
    }
    
    const salt = generateSalt();
    const password_hash = await hashPassword(data.password, salt);
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: `${data.first_name} ${data.last_name}`,
        is_anonymous: false,
        password_hash,
        salt,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/user${users.length + 1}/100`,
    };
    
    writeUsers([...users, newUser]);
    return delay(newUser);
};

export const loginUser = async ({ username, password }): Promise<User> => {
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && !u.is_anonymous);
    
    if (!user || !user.password_hash || !user.salt) {
        throw new Error('Invalid credentials');
    }
    
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
        throw new Error('Invalid credentials');
    }

    writeSession(user);
    return delay(user);
};

export const createAnonymousUser = (): Promise<User> => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const user: User = {
        id: `anon-${Date.now()}`,
        username: `anonymous${randomId}`,
        first_name: 'Anonymous',
        last_name: '',
        display_name: `Anonymous#${randomId}`,
        is_anonymous: true,
        points: 0,
        achievements: [],
        reports_count: 0,
        reportsConfirmed: 0,
        created_at: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/anon${randomId}/100`,
    };
    writeSession(user);
    return delay(user);
};

export const logout = (): Promise<void> => {
    writeSession(null);
    return Promise.resolve();
};


// --- App Data API ---

export const fetchReports = (): Promise<Report[]> => {
  return delay(reports);
};

export const fetchTrendingReports = (): Promise<Report[]> => {
    const sorted = [...reports].sort((a,b) => b.confirmations_count - a.confirmations_count).slice(0, 10);
    return delay(sorted);
}

export const fetchReportById = (id: string): Promise<Report | undefined> => {
  const report = reports.find(r => r.id === id);
  return delay(report);
};

export const fetchUserById = (id: string): Promise<User | undefined> => {
    const users = readUsers();
    return delay(users.find(u => u.id === id));
};

export const fetchNotificationsByUserId = (userId: string): Promise<Notification[]> => {
    const userNotifications = notifications
        .filter(n => n.user_id === userId)
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return delay(userNotifications);
}

export const submitReport = (newReportData: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>): Promise<Report> => {
  const newReport: Report = {
    ...newReportData,
    id: `report-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: ReportStatus.New,
    confirmations_count: 1,
  };
  reports = [newReport, ...reports];
  // User update logic is now handled exclusively in AppContext
  return delay(newReport, 1000);
};

export const confirmReport = (reportId: string, confirmingUserId: string): Promise<{report: Report | undefined}> => {
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if(reportIndex > -1) {
        // Prevent user from confirming their own report
        if (reports[reportIndex].created_by !== confirmingUserId) {
            reports[reportIndex].confirmations_count += 1;
        }
        // User update logic is now handled exclusively in AppContext
        return delay({ report: reports[reportIndex] });
    }
    return delay({ report: undefined });
}