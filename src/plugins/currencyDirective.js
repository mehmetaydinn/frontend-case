import store from '@/store';

export default {
  mounted(el, binding) {
    updateElement(el, binding);
    
    // Store'daki para birimi ve kur değişikliklerini takip et
    const unwatchCurrency = store.watch(
      (state, getters) => getters['settings/currentCurrency'],
      () => updateElement(el, binding)
    );
    
    const unwatchRates = store.watch(
      (state, getters) => getters['settings/exchangeRates'],
      () => updateElement(el, binding)
    );
    
    // Element kaldırıldığında takibi durdur
    el._unwatchCurrency = unwatchCurrency;
    el._unwatchRates = unwatchRates;
  },
  updated(el, binding) {
    updateElement(el, binding);
  },
  unmounted(el) {
    // Takipleri temizle
    if (el._unwatchCurrency) {
      el._unwatchCurrency();
    }
    if (el._unwatchRates) {
      el._unwatchRates();
    }
  }
};

function updateElement(el, binding) {
  const { amount, currency = 'TRY' } = binding.value || {};
  
  if (amount === undefined || amount === null) {
    el.textContent = '';
    return;
  }
  
  try {
    // Vuex store'dan seçili para birimine erişim
    const selectedCurrency = store.getters['settings/currentCurrency'] || currency;
    const exchangeRates = store.getters['settings/exchangeRates'];
    
    
    
    if (!exchangeRates) {
      el.textContent = formatCurrency(amount, currency);
      return;
    }
    
    // Para birimi dönüşümü
    let convertedAmount = amount;
    if (currency !== selectedCurrency) {
      // TRY'ye dönüşüm (eğer orijinal para birimi TRY değilse)
      let amountInTRY = amount;
      if (currency !== 'TRY') {
        amountInTRY = amount / exchangeRates[currency];
      }
      
      // TRY'den seçilen para birimine dönüşüm
      if (selectedCurrency === 'TRY') {
        convertedAmount = amountInTRY;
      } else {
        convertedAmount = amountInTRY * exchangeRates[selectedCurrency];
      }
      
      
    }
    
    // Biçimlendirilmiş fiyatı göster
    const formattedPrice = formatCurrency(convertedAmount, selectedCurrency);
    el.textContent = formattedPrice;
  } catch (error) {
    el.textContent = `${amount} ${currency}`;
  }
}

function formatCurrency(amount, currency) {
  if (!amount && amount !== 0) return '';
  
  try {
    const formatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    
    // Türkiye için locale kullanımı
    return new Intl.NumberFormat('tr-TR', formatOptions).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
} 