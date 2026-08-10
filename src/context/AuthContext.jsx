import { useEffect, useLayoutEffect, useState } from 'react';
import api from '../api/api';
import AuthContext from '../hooks/useAuth';

const AT_KEY = 'at';

let refreshPromise = null;

const getAT = () => localStorage.getItem(AT_KEY);
const setAT = (t) => {
  if (t) {
    localStorage.setItem(AT_KEY, t);
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
  } else {
    localStorage.removeItem(AT_KEY);
    delete api.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const resetAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAT(null);
  };

  useLayoutEffect(() => {
    const req = api.interceptors.request.use((config) => {
      const at = getAT();
      if (at && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${at}`;
      }
      return config;
    });

    const res = api.interceptors.response.use(
      (r) => r,
      async (error) => {
        const orig = error.config;
        const isAuth = orig?.url?.includes('/auth/');

        if (error.response?.status === 401 && !orig?._retry && !isAuth) {
          orig._retry = true;
          try {
            if (!refreshPromise) {
              refreshPromise = api
                .post('/auth/refresh-token')
                .then((r) => { setAT(r.data.data.accessToken); })
                .finally(() => { refreshPromise = null; });
            }
            await refreshPromise;
            return api(orig);
          } catch {
            resetAuth();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(res);
    };
  }, []);

  useEffect(() => {
    if (!getAT()) { setLoading(false); return; }

    api.get('/auth/me')
      .then((u) => { setUser(u.data.data); setIsAuthenticated(true); })
      .catch(resetAuth)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      api.post('/auth/refresh-token')
        .then((r) => setAT(r.data.data.accessToken))
        .catch(resetAuth);
    }, 1000 * 60 * 9);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  const loginUser = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setAT(data.data.accessToken);
      const u = await api.get('/auth/me');
      setUser(u.data.data);
      setIsAuthenticated(true);
      return u.data.data;
    } catch (error) {
      resetAuth();
      throw new Error(error?.response?.data?.message || 'Login failed');
    }
  };

  const logoutUser = async () => {
    try { await api.get('/auth/logout'); } catch (error) { console.error('Logout error:', error); }
    resetAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
