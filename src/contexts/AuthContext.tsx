import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '@/services/api';

// Role types
export type BackendRole = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_HELPDESK';
export type FrontendRole = 'ADMIN' | 'DOCTOR' | 'HELPDESK';

interface User {
  id: number;
  username: string;
  email: string;
  roles: BackendRole[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Role mapping utilities
export const mapBackendRoleToFrontendRole = (backendRole: BackendRole): FrontendRole => {
  switch (backendRole) {
    case 'ROLE_ADMIN':
      return 'ADMIN';
    case 'ROLE_DOCTOR':
      return 'DOCTOR';
    case 'ROLE_HELPDESK':
      return 'HELPDESK';
    default:
      console.warn(`Unknown role: ${backendRole}, defaulting to HELPDESK`);
      return 'HELPDESK';
  }
};

export const hasRole = (user: User | null, role: FrontendRole): boolean => {
  if (!user) return false;
  return user.roles.some(backendRole => mapBackendRoleToFrontendRole(backendRole) === role);
};

export const getPrimaryRole = (user: User | null): FrontendRole | null => {
  if (!user || !user.roles.length) return null;
  return mapBackendRoleToFrontendRole(user.roles[0]);
};

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<{
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: FrontendRole) => boolean;
  getPrimaryRole: () => FrontendRole | null;
}>({
  state: initialState,
  login: async () => { },
  logout: () => { },
  hasRole: () => false,
  getPrimaryRole: () => null,
});

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.signin({ username, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error) {
      console.error('Login failed:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    try {
      authAPI.signout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        hasRole: (role) => hasRole(state.user, role),
        getPrimaryRole: () => getPrimaryRole(state.user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
