// axios'u kullanmıyoruz, bu yüzden kaldırıyoruz
// import axios from 'axios';

const state = {
  currency: 'TRY',
  exchangeRates: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
  viewMode: 'grid',
  locale: 'tr', // Varsayılan dil Türkçe
  theme: 'light'  // Tema durumunu tutacak değişken ('light', 'dark', 'blue', 'green')
};

const getters = {
  currentCurrency: (state) => state.currency,
  exchangeRates: (state) => state.exchangeRates,
  viewMode: (state) => state.viewMode,
  isLoading: (state) => state.isLoading,
  hasError: (state) => !!state.error,
  errorMessage: (state) => state.error,
  isDarkTheme: (state) => state.theme === 'dark',  // Karanlık tema kontrolü için getter
  currentTheme: (state) => state.theme, // Mevcut tema
  currentLocale: (state) => state.locale, // Mevcut dil
  
  // Para birimi dönüşümü için yardımcı fonksiyon
  convertPrice: (state) => (price, fromCurrency = 'TRY') => {
    if (!state.exchangeRates || !price) return price;
    
    try {
      
      // Eğer mevcut para birimi zaten istenilen birimse, doğrudan döndür
      if (fromCurrency === state.currency) return price;
      
      // TRY'ye çevir, sonra hedef para birimine dönüştür
      const inTRY = fromCurrency === 'TRY' ? price : price / state.exchangeRates[fromCurrency];
      const convertedPrice = inTRY * state.exchangeRates[state.currency];
      
      
      
      return convertedPrice;
    } catch (error) {
      return price;
    }
  },
  
  // Formatlı fiyat gösterimi
  formatPrice: (state) => (price, currency = state.currency) => {
    if (!price && price !== 0) return '';
    
    const formatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    
    try {
      return new Intl.NumberFormat(state.locale === 'tr' ? 'tr-TR' : 'en-US', formatOptions).format(price);
    } catch (error) {
      return `${price} ${currency}`;
    }
  }
};

const mutations = {
  SET_CURRENCY(state, currency) {
    state.currency = currency;
    
    // LocalStorage'a kaydet
    localStorage.setItem('app_currency', currency);
  },
  
  SET_VIEW_MODE(state, mode) {
    state.viewMode = mode;
    
    // LocalStorage'a kaydet
    localStorage.setItem('app_view_mode', mode);
  },
  
  SET_EXCHANGE_RATES(state, rates) {
    state.exchangeRates = rates;
    state.lastUpdated = new Date().toISOString();
    
    // LocalStorage'a kaydet (24 saat için)
    localStorage.setItem('exchange_rates', JSON.stringify({
      rates,
      timestamp: state.lastUpdated
    }));
  },
  
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_THEME(state, theme) {
    state.theme = theme;
    
    // LocalStorage'a kaydet
    localStorage.setItem('app_theme', theme);
  },
  
  SET_LOCALE(state, locale) {
    state.locale = locale;
    
    // LocalStorage'a kaydet
    localStorage.setItem('app_locale', locale);
  }
};

const actions = {
  initSettings({ commit, dispatch }) {
    // LocalStorage'dan ayarları yükle
    const savedCurrency = localStorage.getItem('app_currency');
    const savedViewMode = localStorage.getItem('app_view_mode');
    const savedTheme = localStorage.getItem('app_theme');
    const savedLocale = localStorage.getItem('app_locale');
    
    if (savedCurrency) {
      commit('SET_CURRENCY', savedCurrency);
    }
    
    if (savedViewMode) {
      commit('SET_VIEW_MODE', savedViewMode);
    }
    
    if (savedTheme) {
      commit('SET_THEME', savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    if (savedLocale) {
      commit('SET_LOCALE', savedLocale);
    }
    
    // Döviz kurlarını yükle
    dispatch('fetchExchangeRates');
  },
  
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  
  setViewMode({ commit }, mode) {
    commit('SET_VIEW_MODE', mode);
  },
  
  changeCurrency({ commit }, currency) {
    commit('SET_CURRENCY', currency);
  },
  
  changeLocale({ commit }, locale) {
    commit('SET_LOCALE', locale);
    
    // HTML etiketine dil bilgisini ekle
    document.querySelector('html').setAttribute('lang', locale);
  },
  
  async fetchExchangeRates({ commit }) {
    // Önce localStorage'dan kur verilerini kontrol et
    const savedRates = localStorage.getItem('exchange_rates');
    
    if (savedRates) {
      const { rates, timestamp } = JSON.parse(savedRates);
      const lastUpdate = new Date(timestamp);
      const now = new Date();
      
      // Son güncellemeden bu yana 24 saatten az süre geçtiyse, localStorage'dan oku
      if ((now - lastUpdate) < 24 * 60 * 60 * 1000) {
        commit('SET_EXCHANGE_RATES', rates);
        return;
      }
    }
    
    // API'den döviz kurlarını al
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      // TODO: Gerçek bir uygulama için API_KEY ve doğru bir API kullanılmalı
      // Test için sabit kurlar
      const mockRates = {
        TRY: 1,
        USD: 0.026,
        EUR: 0.024,
        GBP: 0.020
      };
      
      
      // Gerçek bir uygulamada aşağıdaki gibi bir API kullanılabilir
      // const response = await axios.get(`https://api.exchangeratesapi.io/latest?base=TRY&access_key=YOUR_API_KEY`);
      // commit('SET_EXCHANGE_RATES', response.data.rates);
      
      // Test için mock data kullan
      commit('SET_EXCHANGE_RATES', mockRates);
    } catch (error) {
      commit('SET_ERROR', 'Döviz kurları yüklenemedi.');
    } finally {
      commit('SET_LOADING', false);
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