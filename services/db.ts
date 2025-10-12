import { Report, User, Notification, Comment, ReportHistory } from '../types';
import { mockReports, mockNotifications, mockComments, mockReportHistory } from '../data/mockData';
import { generateSalt, hashPassword } from './crypto';
import { initialCategories, initialBadges, initialGamificationSettings } from '../data/dynamicConfig';


export const DB_NAME = 'mshkltk-app-db';
export const DB_VERSION = 6; // Incremented version to add audit log store.
export const STORES = ['users', 'reports', 'notifications', 'comments', 'reportHistory', 'sessions', 'dynamic_categories', 'dynamic_badges', 'gamification_settings', 'audit_logs'];

let db: IDBDatabase;
export const getDb = () => db;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      console.log('IndexedDB upgrade needed. Rebuilding all data stores.');
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      
      // Get a list of existing stores to delete them first
      const existingStores = Array.from(dbInstance.objectStoreNames);
      existingStores.forEach(storeName => {
        dbInstance.deleteObjectStore(storeName);
        console.log(`Deleted old store: ${storeName}`);
      });

      // Re-create all stores from the master list to ensure a clean slate
      STORES.forEach(storeName => {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          dbInstance.createObjectStore(storeName, { keyPath: 'id' });
          console.log(`Re-created store: ${storeName}`);
        }
      });
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('Error opening database');
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode): IDBObjectStore => {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

export const dbService = {
  async init(): Promise<void> {
    await openDB();
  },

  // FIX: The superAdmin parameter was incorrectly typed as an array. It is a single object.
  async seedInitialData(defaultUsersRaw: Omit<User, 'password_hash' | 'salt'>[], defaultAdmins: Omit<User, 'password_hash' | 'salt'>[], superAdmin: Omit<User, 'password_hash' | 'salt'>): Promise<void> {
    const checkStore = getStore('reports', 'readonly');
    const countRequest = checkStore.count();

    const shouldSeed = await new Promise<boolean>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result === 0);
        countRequest.onerror = () => reject(countRequest.error);
    });

    if (!shouldSeed) {
        console.log("Database already contains data. Skipping seed.");
        return Promise.resolve();
    }

    console.log("Database is empty or needs seeding, seeding initial data...");

    const createHashedUser = async (user: Omit<User, 'password_hash' | 'salt'>, password: string): Promise<User> => {
        const salt = generateSalt();
        const password_hash = await hashPassword(password, salt);
        return { ...user, salt, password_hash, password_plain: password };
    };
    
    const hashedSuperAdmin = await createHashedUser(superAdmin, "okidoki11");
    const hashedAdmins = await Promise.all(defaultAdmins.map(u => createHashedUser(u, "password123")));
    const hashedUsers = await Promise.all(defaultUsersRaw.map(u => createHashedUser(u, "password123")));

    const allInitialUsers = [hashedSuperAdmin, ...hashedAdmins, ...hashedUsers];
    
    const dataToSeed: { [storeName: string]: any[] } = {
        users: allInitialUsers,
        reports: mockReports,
        notifications: mockNotifications,
        comments: mockComments,
        reportHistory: mockReportHistory,
        dynamic_categories: initialCategories,
        dynamic_badges: initialBadges,
        gamification_settings: [initialGamificationSettings],
    };

    const tx = db.transaction(STORES, 'readwrite');
    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => {
            console.log("Database seeded successfully.");
            resolve();
        };
        tx.onerror = () => {
            console.error("Error seeding database:", tx.error);
            reject(tx.error);
        };

        STORES.forEach(storeName => {
            const store = tx.objectStore(storeName);
            store.clear(); 
            if (dataToSeed[storeName]) {
                dataToSeed[storeName].forEach(item => store.put(item));
            }
        });
    });
  },

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = getStore(storeName, 'readonly');
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  },

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = getStore(storeName, 'readonly');
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  },

  async put<T>(storeName: string, item: T): Promise<void> {
    const store = getStore(storeName, 'readwrite');
    const request = store.put(item);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async delete(storeName: string, id: string): Promise<void> {
    const store = getStore(storeName, 'readwrite');
    const request = store.delete(id);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
  },
};