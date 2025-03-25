const API_KEY = '0085fdeff331162ad700c78b';
export const currencyService = {

  async fetchRates() {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`);
      const data = await response.json();

      const currencies = ['USD', 'EUR', 'GBP'];
      const result = {};

      currencies.forEach((currency) => {
        if (data.conversion_rates[currency]) {
          result[currency] = data.conversion_rates[currency].toFixed(3);
        }
      });

      // Başarılı sonucu localStorage'a kaydet
      localStorage.setItem('lastCurrencyRates', JSON.stringify(result));
      localStorage.setItem('lastCurrencyUpdate', new Date().toISOString());

      return result;
    } catch (error) {
      
      // localStorage'dan son kaydedilen kurları kontrol et
      const lastRates = localStorage.getItem('lastCurrencyRates');
      if (lastRates) {
        return {
          rates: JSON.parse(lastRates),
          isFromCache: true,
          error: 'Güncel kurlar alınamadı, son kaydedilen kurlar gösteriliyor.'
        };
      }

      return {
        rates: null,
        isFromCache: false,
        error: 'Kur bilgileri alınamadı ve önbellekte kayıtlı kur bulunamadı.'
      };
    }
  },

  async checkRates(currentRates, lastUpdated) {
    try {
      if (!currentRates || !lastUpdated) {
        const result = await this.fetchRates();
        return { shouldUpdate: true, ...result };
      }

      const thirtyMinutesInMs = 30 * 60 * 1000;
      const now = new Date();
      const updateTime = new Date(lastUpdated);

      if (now - updateTime > thirtyMinutesInMs) {
        const result = await this.fetchRates();
        return { shouldUpdate: true, ...result };
      }

      return { shouldUpdate: false, rates: currentRates };
    } catch (error) {
      return {
        shouldUpdate: false,
        rates: currentRates,
        error: 'Kur kontrolü yapılamadı, mevcut kurlar kullanılıyor.'
      };
    }
  },

  async getCurrencies() {
    return [
      { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
      { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
    ];
  },
};
