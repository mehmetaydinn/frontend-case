import localStorageService from '@/services/localStorage/localStorageService';

export default {
  namespaced: true,
  
  state: () => ({
    comments: {},
    isLoading: false,
    error: null
  }),
  
  getters: {
    bookComments: state => bookId => state.comments[bookId] || [],
    userComments: state => (userId, comments) => {
      const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
      
      const allComments = comments || Object.values(state.comments).flat();
      return allComments.filter(comment => {
        const commentUserId = typeof comment.userId === 'object' && comment.userId.id 
          ? comment.userId.id 
          : comment.userId;
        
        return commentUserId === actualUserId;
      });
    },
    isLoading: state => state.isLoading,
    error: state => state.error
  },
  
  mutations: {
    SET_BOOK_COMMENTS(state, { bookId, comments }) {
      state.comments = {
        ...state.comments,
        [bookId]: comments
      };
    },
    ADD_COMMENT(state, { bookId, comment }) {
      if (!state.comments[bookId]) {
        state.comments[bookId] = [];
      }
      state.comments[bookId].push(comment);
    },
    UPDATE_COMMENT(state, { bookId, commentId, updatedComment }) {
      if (state.comments[bookId]) {
        const index = state.comments[bookId].findIndex(comment => comment.id === commentId);
        if (index !== -1) {
          state.comments[bookId].splice(index, 1, updatedComment);
        }
      }
    },
    DELETE_COMMENT(state, { bookId, commentId }) {
      if (state.comments[bookId]) {
        state.comments[bookId] = state.comments[bookId].filter(comment => comment.id !== commentId);
      }
    },
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  
  actions: {
    async fetchBookComments({ commit }, bookId) {
      commit('SET_LOADING', true);
      try {
        // localStorage'dan kitap yorumlarını al
        const key = `comments:${bookId}`;
        // Değerin null olabileceğini dikkate alalım ve her zaman dizi döndürelim
        let comments = await localStorageService.getItem(key);
        
        // Eğer comments null veya undefined ise, boş dizi ata
        if (!comments) {
          comments = [];
        }
        
        
        commit('SET_BOOK_COMMENTS', { bookId, comments });
        return comments;
      } catch (error) {
        commit('SET_ERROR', error.message);
        // Hata durumunda da boş dizi döndür
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async addComment({ commit, state, dispatch }, { bookId, userId, userName, text, rating }) {
      commit('SET_LOADING', true);
      try {
        const actualUserId = typeof userId === 'object' && userId.id ? userId.id : userId;
        
        // Yeni yorum oluştur
        const newComment = {
          id: `comment-${Date.now()}`,
          bookId,
          userId: actualUserId,
          userName,
          text,
          rating,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Mevcut yorumları al
        const bookComments = state.comments[bookId] || [];
        const updatedComments = [...bookComments, newComment];
        
        // localStorage'a kaydet
        const key = `comments:${bookId}`;
        await localStorageService.setItem(key, updatedComments);
        
        // State'i güncelle
        commit('ADD_COMMENT', { bookId, comment: newComment });
        
        // Yorumları tekrar getirerek güncel listeyi oluştur
        await dispatch('fetchBookComments', bookId);
        
        return newComment;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateComment({ commit, state, dispatch }, { bookId, commentId, text, rating }) {
      commit('SET_LOADING', true);
      try {
        // Mevcut yorumları al
        const bookComments = state.comments[bookId] || [];
        const commentIndex = bookComments.findIndex(comment => comment.id === commentId);
        
        if (commentIndex === -1) {
          throw new Error('Yorum bulunamadı');
        }
        
        // Yorumu güncelle
        const updatedComment = {
          ...bookComments[commentIndex],
          text,
          rating,
          updatedAt: new Date().toISOString()
        };
        
        const updatedComments = [...bookComments];
        updatedComments[commentIndex] = updatedComment;
        
        // localStorage'a kaydet
        const key = `comments:${bookId}`;
        await localStorageService.setItem(key, updatedComments);
        
        // State'i güncelle
        commit('UPDATE_COMMENT', { bookId, commentId, updatedComment });
        
        // Yorumları tekrar getirerek güncel listeyi oluştur
        await dispatch('fetchBookComments', bookId);
        
        return updatedComment;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteComment({ commit, state, dispatch }, { bookId, commentId }) {
      commit('SET_LOADING', true);
      try {
        // Mevcut yorumları al
        const bookComments = state.comments[bookId] || [];
        
        // Yorumu sil
        const updatedComments = bookComments.filter(comment => comment.id !== commentId);
        
        // localStorage'a kaydet
        const key = `comments:${bookId}`;
        await localStorageService.setItem(key, updatedComments);
        
        // State'i güncelle
        commit('DELETE_COMMENT', { bookId, commentId });
        
        // Yorumları tekrar getirerek güncel listeyi oluştur
        await dispatch('fetchBookComments', bookId);
        
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
}; 