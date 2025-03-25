import localStorageService from '@/services/localStorage/localStorageService';
import { currencyService } from '@/services/currency/currencyService';

const CURRENCY_RATES_KEY = 'currency_rates';
const SELECTED_CURRENCY_KEY = 'selected_currency';

export default {
  namespaced: true,
  
  state: () => ({
    rates: {},
    baseCurrency: 'TRY',
    selectedCurrency: 'TRY',
    lastUpdated: null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    rates: state => state.rates,
    baseCurrency: state => state.baseCurrency,
    selectedCurrency: state => state.selectedCurrency,
    lastUpdated: state => state.lastUpdated,
    isLoading: state => state.isLoading,
    error: state => state.error,
    
    // Seçili para birimine dönüştürme fonksiyonu
    convertAmount: (state) => (amount, fromCurrency) => {
      if (!amount) return 0;
      
      // Para birimi zaten seçili para birimi ise doğrudan dön
      if (fromCurrency === state.selectedCurrency) {
        return amount;
      }
      
      // TRY'ye dönüşüm (eğer seçilen para birimi TRY değilse)
      let amountInTRY = amount;
      if (fromCurrency !== 'TRY') {
        amountInTRY = amount / state.rates[fromCurrency];
      }
      
      // TRY'den seçilen para birimine dönüşüm
      if (state.selectedCurrency === 'TRY') {
        return amountInTRY;
      }
      
      return amountInTRY * state.rates[state.selectedCurrency];
    },
    
    // Biçimlendirilmiş para tutarı
    formatCurrency: (state) => (amount, currency = state.selectedCurrency) => {
      if (!amount && amount !== 0) return '';
      
      const currencySymbols = {
        TRY: '₺',
        USD: '$',
        EUR: '€',
        GBP: '£'
      };
      
      const symbol = currencySymbols[currency] || currency;
      const formattedAmount = Number(amount).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      return `${symbol}${formattedAmount}`;
    }
  },
  
  mutations: {
    SET_RATES(state, { rates, lastUpdated }) {
      state.rates = rates;
      state.lastUpdated = lastUpdated;
    },
    SET_SELECTED_CURRENCY(state, currency) {
      state.selectedCurrency = currency;
    },
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  
  actions: {
    async initCurrency({ commit, dispatch }) {
      commit('SET_LOADING', true);
      try {
        // Kaydedilmiş para birimini al
        const savedCurrency = await localStorageService.getItem(SELECTED_CURRENCY_KEY);
        if (savedCurrency) {
          commit('SET_SELECTED_CURRENCY', savedCurrency);
        }
        
        // Döviz kurlarını yükle
        await dispatch('fetchRates');
        
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchRates({ commit, state }) {
      commit('SET_LOADING', true);
      try {
        // Önce localStorage'dan kurları al
        const savedRates = await localStorageService.getItem(CURRENCY_RATES_KEY);
        
        // localStorage'dan alınan kurların son güncellenme zamanını kontrol et
        const needsUpdate = !savedRates || 
          !savedRates.lastUpdated || 
          (new Date() - new Date(savedRates.lastUpdated)) > 30 * 60 * 1000; // 30 dakika
        
        if (needsUpdate) {
          // API'den yeni kurları al
          const rates = await currencyService.fetchRates();
          const currentTime = new Date().toISOString();
          
          // LocalStorage'a kaydet
          await localStorageService.setItem(CURRENCY_RATES_KEY, {
            base: 'TRY',
            rates,
            lastUpdated: currentTime
          });
          
          commit('SET_RATES', { rates, lastUpdated: currentTime });
        } else {
          // Kaydedilmiş kurları kullan
          commit('SET_RATES', { 
            rates: savedRates.rates, 
            lastUpdated: savedRates.lastUpdated 
          });
        }
        
        return state.rates;
      } catch (error) {
        commit('SET_ERROR', error.message);
        
        // Hata durumunda eski kurları kullan
        const savedRates = await localStorageService.getItem(CURRENCY_RATES_KEY);
        if (savedRates) {
          commit('SET_RATES', { 
            rates: savedRates.rates, 
            lastUpdated: savedRates.lastUpdated 
          });
        }
        
        return state.rates;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async selectCurrency({ commit }, currency) {
      try {
        await localStorageService.setItem(SELECTED_CURRENCY_KEY, currency);
        commit('SET_SELECTED_CURRENCY', currency);
        return true;
      } catch (error) {
        commit('SET_ERROR', error.message);
        return false;
      }
    }
  }
}; 