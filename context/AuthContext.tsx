
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types';
import * as authService from '../src/services/authService';
import * as userService from '../src/services/userService';
import { trackActivity } from '../services/productService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ email: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  socialLogin: (provider: 'Google' | 'LinkedIn', name: string, email: string) => Promise<void>;
  logout: () => void;
  getDbCount: () => number;
  toggleLikeProduct: (productId: string) => Promise<number>;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  addPoints: (points: number) => void;
  redeemPoints: (points: number) => void;
  refreshUser: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'eco_user';
const DB_KEY = 'ecobazaar_registered_users';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [dbCount, setDbCount] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const hideNotification = () => setNotification(null);

  const mapUser = (user: any): User => {
    return {
      ...user,
      zipCode: user.zip_code || user.zipCode,
      profileImage: user.profile_image || user.profileImage,
      greenPoints: user.green_points !== undefined ? user.green_points : (user.greenPoints || 0),
      likedProducts: (user.liked_products || user.likedProducts || []).map((id: any) => id.toString()),
      sustainabilityPreferences: user.sustainability_preferences || user.sustainabilityPreferences || null
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const rawUser = authService.getCurrentUser();
      if (rawUser) {
        const user = mapUser(rawUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Validate token and refresh user data
        refreshUser();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      
      // Fetch initial user count from public endpoint
      try {
        const response = await fetch('/api/stats/users/count');
        if (response.ok) {
          const { count } = await response.json();
          setDbCount(count);
        }
      } catch (e) {
        // Silent fail for stats
      }
    };
    initAuth();
  }, []);

  const getDbCount = () => dbCount;

  const login = async (email: string, password: string) => {
    const { user: rawUser } = await authService.login(email, password);
    const user = mapUser(rawUser);
    
    // Ensure user is in the local "database" for simulation features
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      users.push({ ...user, cart: [] });
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    } else {
      // Update existing user data in local DB
      users[userIndex] = { ...users[userIndex], ...user };
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    setState({ user, isAuthenticated: true, isLoading: false });
    showNotification(`Welcome back, ${user.name}!`);
  };

  const register = async (name: string, email: string, password: string, role: UserRole = UserRole.USER) => {
    const result = await authService.register(email, password, name);
    
    // Save to local "database" for simulation features
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const newUser = {
      id: result.id || Math.floor(Math.random() * 10000),
      name,
      email,
      role,
      likedProducts: [],
      cart: [],
      greenPoints: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    
    return { email, name, password }; // Return password so we can auto-login
  };

  const verifyEmail = async (email: string, code: string) => {
    // Simulated for now as backend doesn't have verification logic yet
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
  };

  const socialLogin = async (provider: 'Google' | 'LinkedIn', name: string, email: string) => {
    try {
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, provider }),
      });

      if (!response.ok) throw new Error('Social login failed');

      const data = await response.json();
      localStorage.setItem('eco_token', data.token);
      
      const user = mapUser(data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      showNotification(`Welcome, ${user.name}!`);
    } catch (error) {
      console.error('Social login error:', error);
      showNotification('Social login failed', 'error');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const toggleLikeProduct = async (productId: string): Promise<number> => {
    if (!state.user) return 0;

    const currentLiked = state.user.likedProducts || [];
    const isLiked = currentLiked.includes(productId);
    const newLiked = isLiked 
      ? currentLiked.filter(id => id !== productId)
      : [...currentLiked, productId];

    const updatedUser = { ...state.user, likedProducts: newLiked };
    
    let pointsEarned = 0;
    // Track activity in backend
    try {
      const res = await trackActivity(productId, isLiked ? 'unlike' : 'like');
      if (res && res.pointsEarned) {
        pointsEarned = res.pointsEarned;
        addPoints(pointsEarned);
        showNotification(`Earned ${pointsEarned} Green Points for liking!`);
      }
    } catch (e) {
      console.error('Failed to track like activity:', e);
    }
    
    // Update Session
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    
    // Update DB
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex].likedProducts = newLiked;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    setState(prev => ({ ...prev, user: updatedUser }));
    return pointsEarned;
  };

  const addToCart = (productId: string) => {
    if (!state.user) return;
    const currentCart = state.user.cart || [];
    const existingItem = currentCart.find(item => item.productId === productId);
    
    let newCart;
    if (existingItem) {
      newCart = currentCart.map(item => 
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...currentCart, { productId, quantity: 1 }];
    }

    const updatedUser = { ...state.user, cart: newCart };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex].cart = newCart;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
    setState(prev => ({ ...prev, user: updatedUser }));
    showNotification('Added to cart!');
  };

  const removeFromCart = (productId: string) => {
    if (!state.user) return;
    const currentCart = state.user.cart || [];
    const newCart = currentCart.filter(item => item.productId !== productId);

    const updatedUser = { ...state.user, cart: newCart };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex].cart = newCart;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
    setState(prev => ({ ...prev, user: updatedUser }));
    showNotification('Removed from cart', 'info');
  };

  const addPoints = (points: number) => {
    if (!state.user) return;
    const newPoints = (state.user.greenPoints || 0) + points;
    const updatedUser = { ...state.user, greenPoints: newPoints };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex].greenPoints = newPoints;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const redeemPoints = (points: number) => {
    if (!state.user) return;
    const currentPoints = state.user.greenPoints || 0;
    if (currentPoints < points) {
      showNotification('Not enough Green Points', 'error');
      return;
    }
    
    const newPoints = currentPoints - points;
    const updatedUser = { ...state.user, greenPoints: newPoints };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex].greenPoints = newPoints;
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  const refreshUser = async () => {
    try {
      console.log('AuthContext: refreshUser started');
      const token = authService.getToken();
      if (!token) {
        console.log('AuthContext: No token found for refreshUser');
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        console.log('AuthContext: Token invalid or expired, logging out');
        logout();
        return;
      }

      if (response.ok) {
        const text = await response.text();
        console.log('AuthContext: refreshUser response text received');
        let fullUser;
        try {
          fullUser = JSON.parse(text);
        } catch (e) {
          console.error('AuthContext: Failed to parse user profile JSON', e);
          return;
        }

        const mappedUser = mapUser(fullUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
        setState(prev => ({ ...prev, user: mappedUser, isAuthenticated: true }));
        console.log('AuthContext: refreshUser state updated');
      } else {
        console.error('AuthContext: refreshUser failed with status', response.status);
      }
    } catch (error) {
      console.error('AuthContext: Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyEmail, socialLogin, logout, getDbCount, toggleLikeProduct, addToCart, removeFromCart, addPoints, redeemPoints, refreshUser, isCartOpen, setIsCartOpen, notification, showNotification, hideNotification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
