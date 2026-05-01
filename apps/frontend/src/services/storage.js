/**
 * طبقة تخزين آمنة فوق localStorage / sessionStorage
 * تعزل تفاصيل التخزين عن متاجر Pinia والمكونات
 * تدعم "تذكرني" عبر localStorage، والجلسة المؤقتة عبر sessionStorage
 */

const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  REMEMBER_ME: "remember_me",
};

const getStore = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true"
      ? localStorage
      : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

const readJSON = (key, fallback = null) => {
  try {
    const store = getStore();
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};


const removeSessionKeys = (keys) => {
  keys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

const authStorage = {
  getToken: () => {
    const store = getStore();
    return store.getItem(STORAGE_KEYS.TOKEN);
  },
  setToken: (token, remember = false) => {
    const store = remember ? localStorage : sessionStorage;
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(remember));
    store.setItem(STORAGE_KEYS.TOKEN, token);
  },
  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getUser: () => readJSON(STORAGE_KEYS.USER, null),
  setUser: (user, remember = false) => {
    const store = remember ? localStorage : sessionStorage;
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(remember));
    store.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  },

  clearSession(clearTransient = false) {
    this.removeToken();
    this.removeUser();
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    
    // Clean up legacy admin storage if exists
    removeSessionKeys([
      "admin_token",
      "admin_user",
      "admin_remember_me",
    ]);

    if (clearTransient) {
      removeSessionKeys([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
    }
  },

  isRemembered: () => localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true",
};

const themeStorage = {
  getTheme: () => localStorage.getItem(STORAGE_KEYS.THEME),
  setTheme: (theme) => localStorage.setItem(STORAGE_KEYS.THEME, theme),
};

export { STORAGE_KEYS, authStorage, themeStorage };
