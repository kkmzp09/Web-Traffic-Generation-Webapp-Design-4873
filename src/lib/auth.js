// Mock authentication functions
// In a real application, these would make API calls to your backend.

const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123',
    username: 'TestUser',
  },
];

let currentUser = null;

const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        currentUser = { id: user.id, email: user.email, username: user.username };
        resolve(currentUser);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

const register = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users.find((u) => u.email === email)) {
        reject(new Error('User with this email already exists'));
      } else {
        const newUser = {
          id: users.length + 1,
          email,
          password,
          username: email.split('@')[0],
        };
        users.push(newUser);
        currentUser = { id: newUser.id, email: newUser.email, username: newUser.username };
        resolve(currentUser);
      }
    }, 500);
  });
};

const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      resolve();
    }, 200);
  });
};

const getCurrentUser = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUser);
    }, 200);
  });
};

export { login, register, logout, getCurrentUser };