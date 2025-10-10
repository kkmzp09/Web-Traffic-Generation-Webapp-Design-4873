// Mock authentication functions for development
// In production, replace these with actual API calls

export const loginUser = async (email, password) => {
  console.log('loginUser called with:', email);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user was previously registered
    const registeredUser = localStorage.getItem('registered_user');
    let userData;
    
    if (registeredUser) {
      userData = JSON.parse(registeredUser);
      // Verify email matches
      if (userData.email !== email) {
        throw new Error('Invalid email or password');
      }
    } else {
      // Create new user data for login
      userData = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0]
      };
    }
    
    // Mock successful login
    return {
      success: true,
      user: userData,
      sessionToken: `session_${Date.now()}`
    };
    
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export const registerUser = async (userData) => {
  console.log('registerUser called with:', userData);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('All fields are required');
    }
    
    // Check if user already exists (mock check)
    const existingUser = localStorage.getItem('registered_user');
    if (existingUser) {
      const existing = JSON.parse(existingUser);
      if (existing.email === userData.email) {
        throw new Error('User with this email already exists');
      }
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      createdAt: new Date().toISOString()
    };
    
    // Store user data (in production, this would be saved to database)
    localStorage.setItem('registered_user', JSON.stringify(newUser));
    
    return {
      success: true,
      user: newUser,
      message: 'Account created successfully'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

export const logoutUser = async () => {
  try {
    // In production, this would call the logout API endpoint
    localStorage.removeItem('auth_state');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Logout failed');
  }
};

export const getCurrentUser = () => {
  try {
    const authState = localStorage.getItem('auth_state');
    if (authState) {
      const parsed = JSON.parse(authState);
      return parsed.user;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};