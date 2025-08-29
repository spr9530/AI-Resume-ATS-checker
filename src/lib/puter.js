import { create } from "zustand";

const getPuter = () => (typeof window !== "undefined" && window.puter ? window.puter : null);

export const usePuterStore = create((set, get) => {
  const setError = (msg) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser,
      },
    });
  };

  const checkAuthStatus = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user,
          },
          isLoading: false,
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null,
          },
          isLoading: false,
        });
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check auth status");
      return false;
    }
  };

  const signIn = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  const signOut = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null,
        },
        isLoading: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  };

  const refreshUser = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user,
        },
        isLoading: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh user");
    }
  };

  const init = () => {
    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 10000);
  };

  const write = async (path, data) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.fs.write(path, data);
  };

  const readDir = async (path) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.fs.readdir(path);
  };

  const readFile = async (path) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.fs.read(path);
  };

  const upload = async (files) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.fs.upload(files);
  };

  const deleteFile = async (path) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.fs.delete(path);
  };

  const chat = async (prompt, imageURL, testMode, options) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.ai.chat(prompt, imageURL, testMode, options);
  };

  const feedback = async (path, message) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            { type: "file", puter_path: path },
            { type: "text", text: message },
          ],
        },
      ],
      { model: "claude-3-7-sonnet" }
    );
  };

  const img2txt = async (image, testMode) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.ai.img2txt(image, testMode);
  };

  const getKV = async (key) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.kv.get(key);
  };

  const setKV = async (key, value) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.kv.set(key, value);
  };

  const deleteKV = async (key) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.kv.delete(key);
  };

  const listKV = async (pattern, returnValues = false) => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.kv.list(pattern, returnValues);
  };

  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) return setError("Puter.js not available");
    return puter.kv.flush();
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write,
      read: readFile,
      readDir,
      upload,
      delete: deleteFile,
    },
    ai: {
      chat,
      feedback,
      img2txt,
    },
    kv: {
      get: getKV,
      set: setKV,
      delete: deleteKV,
      list: listKV,
      flush: flushKV,
    },
    init,
    clearError: () => set({ error: null }),
  };
});
