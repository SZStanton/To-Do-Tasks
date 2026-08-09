import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

//== AUTH CONTEXT ==
// Handles login, register, logout and JWT session management
const AuthContext = createContext(null);

// API URL from vite environment
const API_URL = import.meta.env.VITE_API_URL;

// Local storage keys
const USER_KEY = 'todo-user';
const TOKEN_KEY = 'todo-token';

// Load saved user
const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

// Load saved token
const loadToken = () => localStorage.getItem(TOKEN_KEY) || '';

function AuthProvider({ children }) {
  // Store logged in user + JWT token
  const [user, setUser] = useState(() => loadUser());
  const [token, setToken] = useState(() => loadToken());

  // Loading state while checking token
  const [loading, setLoading] = useState(true);

  //== CLEAR SESSION ==
  // Remove local session data
  const clearSession = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken('');
  }, []);

  //== CHECK LOGIN SESSION ==
  // Verify saved JWT token when app loads
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error('Invalid token');

        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token, clearSession]);

  //== SAVE SESSION ==
  // Save user + token after login/register
  const saveSession = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  //==== REGISTER ====
  // Register a new user account
  const register = useCallback(
    async ({ name, email, username, password }) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, username, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          return {
            success: false,
            message: data.message || 'Registration failed.',
          };
        }

        saveSession({ token: data.token, user: data.user });
        return { success: true, message: data.message };
      } catch {
        return { success: false, message: 'Registration failed.' };
      }
    },
    [saveSession],
  );

  //=== LOGIN ===
  // Log a user into the app
  const login = useCallback(
    async ({ identifier, password }) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          return { success: false, message: data.message || 'Login failed.' };
        }

        saveSession({ token: data.token, user: data.user });
        return { success: true, message: data.message };
      } catch {
        return { success: false, message: 'Logged failed.' };
      }
    },
    [saveSession],
  );

  //=== LOGOUT ===
  // Log the current user out
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  //=== CONTEXT VALUES ===
  // Memorized context values to reduce unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isLoggedIn: Boolean(user),
      register,
      login,
      logout,
    }),
    [user, token, loading, register, login, logout],
  );

  // Provide authentication data to the app
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
