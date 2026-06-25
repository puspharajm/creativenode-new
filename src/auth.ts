// Local Auth API wrapper pointing to Neon DB endpoints in server.ts

export interface LocalUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Temporary global variable to hold the current user session
let _currentUser: LocalUser | null = null;
let _authListeners: ((user: LocalUser | null) => void)[] = [];

function notifyListeners() {
  _authListeners.forEach(cb => cb(_currentUser));
}

// Try to hydrate user from localStorage on load
try {
  const savedUser = localStorage.getItem('creativenode_auth_user');
  if (savedUser) {
    _currentUser = JSON.parse(savedUser);
  }
} catch (e) {
  console.warn("Could not load user from storage");
}

export const auth = {
  get currentUser() {
    return _currentUser;
  },

  login: async (email: string, password: string): Promise<LocalUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.status === 'success') {
      _currentUser = data.user;
      localStorage.setItem('creativenode_auth_user', JSON.stringify(_currentUser));
      notifyListeners();
      return data.user;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  },

  signup: async (email: string, displayName: string, password: string): Promise<LocalUser> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, password })
    });
    const data = await res.json();
    if (data.status === 'success') {
      _currentUser = data.user;
      localStorage.setItem('creativenode_auth_user', JSON.stringify(_currentUser));
      notifyListeners();
      return data.user;
    } else {
      throw new Error(data.message || 'Signup failed');
    }
  },

  googleLogin: async (credential: string): Promise<LocalUser> => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (data.status === 'success') {
      _currentUser = data.user;
      localStorage.setItem('creativenode_auth_user', JSON.stringify(_currentUser));
      notifyListeners();
      return data.user;
    } else {
      throw new Error(data.message || 'Google Login failed');
    }
  },

  onAuthStateChanged: (cb: (user: LocalUser | null) => void) => {
    _authListeners.push(cb);
    setTimeout(() => cb(_currentUser), 0);
    return () => {
      _authListeners = _authListeners.filter(listener => listener !== cb);
    };
  },

  signOut: async () => {
    _currentUser = null;
    localStorage.removeItem('creativenode_auth_user');
    notifyListeners();
  }
};
