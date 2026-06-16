// Firebase has been completely removed. All data now flows through Neon PostgreSQL.
// This file is a compatibility stub to prevent import errors during migration.

// Mock user type compatible with firebase/auth User interface
export interface LocalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Permanent local admin session (no external auth needed)
export const LOCAL_ADMIN: LocalUser = {
  uid: 'local-admin-sovereign',
  email: 'puspharaj.m2003@gmail.com',
  displayName: 'Sovereign Supervisor',
  photoURL: null,
};

// No-op stubs matching firebase exports that the codebase still imports
export const auth = {
  currentUser: LOCAL_ADMIN,
  onAuthStateChanged: (cb: (user: LocalUser) => void) => {
    setTimeout(() => cb(LOCAL_ADMIN), 0);
    return () => {};
  },
  signOut: async () => {}
};

export const db = {}; // no-op - all Firestore calls replaced with fetch()
export const storage = {}; // no-op - all Storage calls replaced with /api/upload

export const firebaseConfig = {
  projectId: 'neon-migrated',
  apiKey: '',
  authDomain: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
