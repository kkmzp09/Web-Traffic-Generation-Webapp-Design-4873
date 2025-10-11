const USERS_STORAGE_KEY = 'trafficker_users';
const FAKE_DELAY = 500;

// Initialize users from localStorage or with a default user
const initializeUsers = () => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
  }
  
  // Default user if nothing is in storage
  const defaultUsers = [
    { 
      id: 'usr_1', 
      email: 'user@example.com', 
      password: 'password123', 
      name: 'Test User' 
    }
  ];
  
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  } catch (e) {
    console.error('Failed to save default users to localStorage', e);
  }
  
  return defaultUsers;
};

let USERS = initializeUsers();

// Save users to localStorage
const saveUsers = () => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(USERS));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};


export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      if (user) {
        const userData = { id: user.id, email: user.email, name: user.name };
        localStorage.setItem('authUser', JSON.stringify(userData));
        resolve({ user: userData, sessionToken: 'fake-token-for-demo-user' });
      } else {
        reject(new Error('Invalid credentials. Please try again.'));
      }
    }, FAKE_DELAY);
  });
};

export const registerUser = ({ name, email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (USERS.some(u => u.email === email)) {
        reject(new Error('An account with this email already exists.'));
      } else {
        const newName = name || email.split('@')[0];
        const newUser = {
          id: `usr_${Date.now()}`,
          name: newName,
          email,
          password,
        };
        USERS.push(newUser);
        saveUsers(); 
        const userData = { id: newUser.id, email: newUser.email, name: newName };
        resolve(userData);
      }
    }, FAKE_DELAY);
  });
};

export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('authUser');
      sessionStorage.clear();
      resolve(true);
    }, FAKE_DELAY);
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          resolve(JSON.parse(storedUser));
        } else {
          resolve(null);
        }
      } catch (e) {
        console.error('Failed to get current user from localStorage', e);
        resolve(null);
      }
    }, FAKE_DELAY / 2); 
  });
};