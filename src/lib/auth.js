// Mock user database
// In a real application, this would be a database call.
let USERS = [
  { 
    id: 'usr_1', 
    email: 'user@example.com', 
    password: 'password123', 
    name: 'Test User' 
  }
];

const FAKE_DELAY = 500;

// --- Mock Auth Service ---

export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      if (user) {
        const userData = { id: user.id, email: user.email, name: user.name };
        localStorage.setItem('authUser', JSON.stringify(userData));
        // Return object expected by AuthModal
        resolve({ user: userData, sessionToken: 'fake-token-for-demo' });
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
        const newUser = {
          id: `usr_${Date.now()}`,
          name,
          email,
          password, // In a real app, hash this!
        };
        USERS.push(newUser);
        const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
        // Does not log in, just resolves with user data
        resolve(userData);
      }
    }, FAKE_DELAY);
  });
};

export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      resolve(true);
    }, FAKE_DELAY);
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        resolve(JSON.parse(storedUser));
      } else {
        resolve(null);
      }
    }, FAKE_DELAY / 2); 
  });
};