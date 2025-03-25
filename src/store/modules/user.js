import localStorageService from '@/services/localStorage/localStorageService';

const USERS_KEY = 'users';
const AUTH_TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';
const USER_BOOKS_KEY = 'user_books';

export default {
  namespaced: true,
  
  state: () => ({
    currentUser: null,
    users: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null,
    userBooks: []
  }),
  
  getters: {
    currentUser: state => state.currentUser,
    isAuthenticated: state => state.isAuthenticated,
    isLoading: state => state.isLoading,
    error: state => state.error,
    getUserById: state => id => state.users.find(user => user.id === id),
    userBooks: state => state.userBooks
  },
  
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      state.isAuthenticated = !!user;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    ADD_USER(state, user) {
      state.users.push(user);
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser);
        if (state.currentUser && state.currentUser.id === updatedUser.id) {
          state.currentUser = updatedUser;
        }
      }
    },
    SET_AUTH_TOKEN(state, token) {
      state.token = token;
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
    SET_USER_BOOKS(state, books) {
      state.userBooks = books;
    },
    ADD_USER_BOOK(state, book) {
      state.userBooks.push(book);
    }
  },
  
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true);
      try {
        const users = await localStorageService.getItem(USERS_KEY) || [];
        commit('SET_USERS', users);
        return users;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async register({ commit, state }, userData) {
      commit('CLEAR_ERROR');
      commit('SET_LOADING', true);
      
      try {
        // Kullanıcı zaten var mı kontrol et
        const users = await localStorageService.getItem(USERS_KEY) || [];
        const existingUser = users.find(user => user.email === userData.email);
        
        if (existingUser) {
          throw new Error('Bu e-posta adresi zaten kullanılıyor');
        }
        
        // Yeni kullanıcı oluştur
        const newUser = {
          ...userData,
          id: `user-${Date.now()}`,
          favorites: [],
          addedBooks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Kullanıcıları güncelle
        const updatedUsers = [...users, newUser];
        await localStorageService.setItem(USERS_KEY, updatedUsers);
        
        // Simüle edilmiş JWT token oluştur
        const token = `simulated-jwt-token-${newUser.id}-${Date.now()}`;
        await localStorageService.setItem(AUTH_TOKEN_KEY, token);
        await localStorageService.setItem(CURRENT_USER_KEY, newUser);
        
        // State güncelle
        commit('SET_CURRENT_USER', newUser);
        commit('SET_AUTH_TOKEN', token);
        commit('SET_USERS', updatedUsers);
        
        return newUser;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async login({ commit }, credentials) {
      commit('CLEAR_ERROR');
      commit('SET_LOADING', true);
      
      try {
        const users = await localStorageService.getItem(USERS_KEY) || [];
        const user = users.find(user => 
          user.email === credentials.email && user.password === credentials.password
        );
        
        if (!user) {
          throw new Error('Geçersiz e-posta veya şifre');
        }
        
        // Simüle edilmiş JWT token oluştur
        const token = `simulated-jwt-token-${user.id}-${Date.now()}`;
        await localStorageService.setItem(AUTH_TOKEN_KEY, token);
        await localStorageService.setItem(CURRENT_USER_KEY, user);
        
        commit('SET_CURRENT_USER', user);
        commit('SET_AUTH_TOKEN', token);
        
        return user;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async logout({ commit }) {
      try {
        await localStorageService.removeItem(AUTH_TOKEN_KEY);
        await localStorageService.removeItem(CURRENT_USER_KEY);
        
        commit('SET_CURRENT_USER', null);
        commit('SET_AUTH_TOKEN', null);
        
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      }
    },
    
    async checkAuth({ commit }) {
      try {
        const token = await localStorageService.getItem(AUTH_TOKEN_KEY);
        const user = await localStorageService.getItem(CURRENT_USER_KEY);
        
        if (token && user) {
          commit('SET_CURRENT_USER', user);
          commit('SET_AUTH_TOKEN', token);
          return true;
        }
        
        return false;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      }
    },
    
    async updateUserProfile({ commit, state }, userData) {
      commit('SET_LOADING', true);
      
      try {
        const users = await localStorageService.getItem(USERS_KEY) || [];
        const updatedUsers = users.map(user => {
          if (user.id === userData.id) {
            return {
              ...user,
              ...userData,
              updatedAt: new Date().toISOString()
            };
          }
          return user;
        });
        
        const updatedUser = updatedUsers.find(user => user.id === userData.id);
        
        await localStorageService.setItem(USERS_KEY, updatedUsers);
        
        if (state.currentUser && state.currentUser.id === userData.id) {
          await localStorageService.setItem(CURRENT_USER_KEY, updatedUser);
          commit('SET_CURRENT_USER', updatedUser);
        }
        
        commit('SET_USERS', updatedUsers);
        
        return updatedUser;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchUserBooks({ commit, state, dispatch }, userId) {
      if (!userId) return;
      
      commit('SET_LOADING', true);
      try {
        // LocalStorage'dan kullanıcı kitaplarını al
        const userBooksKey = `userBooks:${userId}`;
        
        // LocalStorage service kullan
        let booksData = await localStorageService.getItem(userBooksKey);
        
        // Eski format kontrolü yap (düz 'USER_BOOKS_KEY' kullanımı)
        if (!booksData) {
          const oldBooksData = await localStorageService.getItem(USER_BOOKS_KEY);
          if (oldBooksData) {
            // Eski formattan yeni formata taşı
            await localStorageService.setItem(userBooksKey, oldBooksData);
            await localStorageService.removeItem(USER_BOOKS_KEY);
            booksData = oldBooksData;
          }
        }
        
        if (booksData) {
          commit('SET_USER_BOOKS', booksData);
        } else {
          commit('SET_USER_BOOKS', []);
        }
      } catch (error) {
        commit('SET_ERROR', 'Kitaplar yüklenirken bir hata oluştu');
        commit('SET_USER_BOOKS', []);
        
        // Bildirim göster
        dispatch('ui/showNotification', {
          message: 'Kitaplar yüklenirken bir hata oluştu: ' + error.message,
          type: 'error'
        }, { root: true });
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async addBookToLibrary({ commit, state, dispatch, rootGetters }, { userId, bookId }) {
      if (!userId || !bookId) {
        return;
      }
      
      commit('SET_LOADING', true);
      try {
        
        // Önce tüm kitapları getir - boş obje gönder
        await dispatch('books/fetchBooks', {}, { root: true });
        
        // Kitabı al (selectedBook veya allBooks getter'ını kullan)
        let book;
        if (rootGetters['books/bookById']) {
          book = rootGetters['books/bookById'](bookId);
        } else {
          // Eğer bookById getter'ı yoksa, önce kitabı getir ve selectedBook'u kullan
          await dispatch('books/fetchBookById', bookId, { root: true });
          book = rootGetters['books/selectedBook'];
          
          // Hala yoksa, tüm kitaplardan bul
          if (!book) {
            book = rootGetters['books/allBooks'].find(b => b.id === bookId);
          }
        }
        
        if (!book) {
          throw new Error('Kitap bulunamadı');
        }
        
        
        // Kullanıcının kitap listesini al
        await dispatch('fetchUserBooks', userId);
        
        // Kitap zaten kullanıcının kitaplığında mı kontrol et
        const existingBook = state.userBooks.find(b => b.id === bookId);
        
        if (existingBook) {
          throw new Error('Bu kitap zaten kitaplığınızda');
        }
        
        // Kullanıcı için kitap verisi oluştur
        const userBook = {
          ...book,
          isPurchased: true, // Satın alınmış olarak işaretle
          isBorrowed: false,
          isReading: false,
          addedDate: new Date().toISOString(),
          progress: 0,
          lastReadDate: null,
          returnDate: null
        };
        
        
        // Store'u güncelle
        commit('ADD_USER_BOOK', userBook);
        
        // LocalStorage'a kaydet (state'i sonradan güncelledik, o yüzden tekrar alıyoruz)
        const updatedBooks = [...state.userBooks];
        const userBooksKey = `userBooks:${userId}`;
        
        
        // LocalStorage service kullan
        await localStorageService.setItem(userBooksKey, updatedBooks);
        
        
        // Bildirim göster
        dispatch('ui/showNotification', {
          message: 'Kitap kütüphanenize eklendi',
          type: 'success'
        }, { root: true });
        
        return userBook;
      } catch (error) {
        commit('SET_ERROR', error.message || 'Kitap eklenirken bir hata oluştu');
        
        // Hata bildirimini göster
        dispatch('ui/showNotification', {
          message: error.message || 'Kitap eklenirken bir hata oluştu',
          type: 'error'
        }, { root: true });
        
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
}; 