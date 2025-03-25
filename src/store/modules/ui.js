import localStorageService from '@/services/localStorage/localStorageService';

const THEME_KEY = 'theme';

export default {
  namespaced: true,
  
  state: () => ({
    theme: 'light',
    notification: null,
    isLoading: false,
    error: null,
    isFilterOpen: false,
    filterParams: {}
  }),
  
  getters: {
    isDarkTheme: state => state.theme === 'dark',
    notification: state => state.notification,
    isLoading: state => state.isLoading,
    error: state => state.error,
    isFilterOpen: state => state.isFilterOpen,
    filterParams: state => state.filterParams
  },
  
  mutations: {
    SET_THEME(state, theme) {
      state.theme = theme;
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification;
    },
    CLEAR_NOTIFICATION(state) {
      state.notification = null;
    },
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
    SET_FILTER_OPEN(state, isOpen) {
      state.isFilterOpen = isOpen;
    },
    SET_FILTER_PARAMS(state, params) {
      state.filterParams = params;
    },
    CLEAR_FILTER_PARAMS(state) {
      state.filterParams = {};
    }
  },
  
  actions: {
    async initTheme({ commit }) {
      try {
        const savedTheme = await localStorageService.getItem(THEME_KEY);
        if (savedTheme) {
          commit('SET_THEME', savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          // Varsayılan tema
          commit('SET_THEME', 'light');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
      }
    },
    
    async toggleTheme({ commit, state }) {
      try {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        await localStorageService.setItem(THEME_KEY, newTheme);
        
        commit('SET_THEME', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        return newTheme;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return state.theme;
      }
    },
    
    showNotification({ commit }, { message, type = 'info', duration = 20000 }) {
      commit('SET_NOTIFICATION', { message, type });
      
      // Belirli bir süre sonra bildirimi kaldır
      setTimeout(() => {
        commit('CLEAR_NOTIFICATION');
      }, duration);
    },
    
    toggleFilter({ commit, state }) {
      commit('SET_FILTER_OPEN', !state.isFilterOpen);
    },
    
    setFilterParams({ commit }, params) {
      commit('SET_FILTER_PARAMS', params);
    },
    
    clearFilterParams({ commit }) {
      commit('CLEAR_FILTER_PARAMS');
    }
  }
}; 