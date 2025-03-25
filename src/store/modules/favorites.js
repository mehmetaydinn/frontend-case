import localStorageService from '@/services/localStorage/localStorageService';

const state = {
  favorites: null, // { userId: { bookIds: [id1, id2, ...] } }
  isLoading: false,
  error: null
};

const getters = {
  getUserFavorites: (state) => (userId) => {
    // Kullanıcı ID'si bir nesne ise .id özelliğini kullan
    const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
    
    return state.favorites && state.favorites[actualUserId] ? 
      state.favorites[actualUserId].bookIds : [];
  },
  
  isBookFavorited: (state) => (userId, bookId) => {
    // Kullanıcı ID'si bir nesne ise .id özelliğini kullan
    const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
    
    return state.favorites && 
           state.favorites[actualUserId] && 
           state.favorites[actualUserId].bookIds.includes(bookId);
  },
  
  getFavoriteBooks: (state, getters, rootState, rootGetters) => (userId) => {
    const favoriteIds = getters.getUserFavorites(userId);
    const allBooks = rootGetters['books/allBooks'];
    
    return allBooks.filter(book => favoriteIds.includes(book.id));
  },
  
  isLoading: (state) => state.isLoading,
  error: (state) => state.error
};

const mutations = {
  SET_FAVORITES(state, favorites) {
    state.favorites = favorites;
  },
  
  ADD_TO_FAVORITES(state, { userId, bookId }) {
    // Kullanıcı favorilerini kontrol et ve gerekirse oluştur
    if (!state.favorites) {
      state.favorites = {};
    }
    
    if (!state.favorites[userId]) {
      state.favorites[userId] = { bookIds: [] };
    }
    
    // Kitap zaten favorilerde değilse ekle
    if (!state.favorites[userId].bookIds.includes(bookId)) {
      state.favorites[userId].bookIds.push(bookId);
    }
  },
  
  REMOVE_FROM_FAVORITES(state, { userId, bookId }) {
    if (state.favorites && 
        state.favorites[userId] && 
        state.favorites[userId].bookIds.includes(bookId)) {
      state.favorites[userId].bookIds = state.favorites[userId].bookIds.filter(id => id !== bookId);
    }
  },
  
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  }
};

const actions = {
  // Favorileri localStorage'dan yükle
  initFavorites({ commit }) {
    commit('SET_LOADING', true);
    
    try {
      const favorites = localStorageService.getItem('favorites') || {};
      commit('SET_FAVORITES', favorites);
      commit('SET_ERROR', null);
    } catch (error) {
      commit('SET_ERROR', 'Favoriler yüklenemedi.');
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Tüm favorileri getir - fetchFavorites metodu
  fetchFavorites({ dispatch, commit }) {
    commit('SET_LOADING', true);
    
    try {
      // Favori verilerini yükle
      dispatch('initFavorites');
      return Promise.resolve();
    } catch (error) {
      commit('SET_ERROR', 'Favoriler yüklenemedi.');
      return Promise.reject(error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Kitabı favorilere ekle veya çıkar
  toggleFavorite({ commit, state, getters }, { userId, bookId }) {
    if (!userId || !bookId) {
      return Promise.reject('Geçersiz kullanıcı ID veya kitap ID');
    }
    
    try {
      // Kullanıcı ID'si bir nesne ise .id özelliğini kullan
      const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
      
      const isFavorited = getters.isBookFavorited(actualUserId, bookId);
      
      if (isFavorited) {
        commit('REMOVE_FROM_FAVORITES', { userId: actualUserId, bookId });
      } else {
        commit('ADD_TO_FAVORITES', { userId: actualUserId, bookId });
      }
      
      // LocalStorage'a kaydet
      localStorageService.setItem('favorites', state.favorites);
      
      return !isFavorited; // Yeni durum geri döndürülür: true (eklendi) veya false (çıkarıldı)
    } catch (error) {
      return Promise.reject('Favori durumu değiştirilemedi.');
    }
  },
  
  // Kullanıcının tüm favorilerini getir
  fetchUserFavorites({ commit, state }, userId) {
    if (!userId) {
      return Promise.reject('Geçersiz kullanıcı ID');
    }
    
    commit('SET_LOADING', true);
    
    try {
      // Kullanıcı ID'si bir nesne ise .id özelliğini kullan
      const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
      
      if (!state.favorites) {
        const favorites = localStorageService.getItem('favorites') || {};
        commit('SET_FAVORITES', favorites);
      }
      
      const userFavorites = state.favorites && state.favorites[actualUserId] ? 
        state.favorites[actualUserId].bookIds : [];
        
      return userFavorites;
    } catch (error) {
      commit('SET_ERROR', 'Kullanıcı favorileri alınamadı.');
      return Promise.reject(error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Tüm favorileri temizle (kullanıcıya özel)
  clearFavorites({ commit, state }, userId) {
    if (!userId) {
      return Promise.reject('Geçersiz kullanıcı ID');
    }
    
    try {
      // Kullanıcı ID'si bir nesne ise .id özelliğini kullan
      const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
      
      if (state.favorites && state.favorites[actualUserId]) {
        commit('SET_FAVORITES', {
          ...state.favorites,
          [actualUserId]: { bookIds: [] }
        });
        
        localStorageService.setItem('favorites', state.favorites);
      }
      
      return true;
    } catch (error) {
      return Promise.reject('Favoriler temizlenemedi.');
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}; 