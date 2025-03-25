import axios from 'axios';
import store from '@/store';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'https://api.example.com', // Gerçek API URL'ini buraya ekleyin
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek interceptor'ı
api.interceptors.request.use(
  config => {
    // Auth token'ı ekle (eğer varsa)
    const token = store.state.user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const errorMessage = error.response?.data?.message || 'Beklenmeyen bir hata oluştu';
    
    // Vuex store üzerinden UI'da hata göster
    store.commit('ui/SET_ERROR', errorMessage);
    
    // 401 Unauthorized - Kimlik doğrulama hatası
    if (error.response?.status === 401) {
      store.dispatch('user/logout');
      // Router ile login sayfasına yönlendirme burada yapılabilir
    }
    
    return Promise.reject(error);
  }
);

export default api; 