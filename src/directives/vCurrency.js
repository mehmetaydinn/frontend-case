/**
 * vCurrency direktifi - Para birimini formatlar ve dönüştürür
 * 
 * Kullanım örnekleri:
 * <span v-currency="100">100</span> <!-- Varsayılan para birimi ile formatlar (TRY) -->
 * <span v-currency="{ amount: 100, currency: 'USD' }">100</span> <!-- Belirtilen para birimi ile formatlar -->
 */

import store from '@/store'; // Store'un import edildiği yol projenize göre değişebilir

export const vCurrency = {
  mounted(el, binding, vnode) {
    if (!binding.value) return;
    
    // Binding değerine göre miktar ve para birimi belirle
    const amount = typeof binding.value === 'number' 
      ? binding.value 
      : binding.value.amount;
      
    const currency = typeof binding.value === 'number' 
      ? store.getters['currency/selectedCurrency'] 
      : binding.value.currency || store.getters['currency/selectedCurrency'];
    
    // Para birimini formatla
    const formattedValue = store.getters['currency/formatCurrency'](amount, currency);
    el.innerHTML = formattedValue;
    
    // Orijinal değeri saklayalım
    el._originalAmount = amount;
    el._originalCurrency = currency;
  },
  
  updated(el, binding) {
    if (!binding.value) return;
    
    // Binding değerine göre miktar ve para birimi belirle
    const amount = typeof binding.value === 'number' 
      ? binding.value 
      : binding.value.amount;
      
    const currency = typeof binding.value === 'number' 
      ? store.getters['currency/selectedCurrency'] 
      : binding.value.currency || store.getters['currency/selectedCurrency'];
    
    // Eğer miktar veya para birimi değiştiyse güncelle
    if (el._originalAmount !== amount || el._originalCurrency !== currency) {
      // Para birimini formatla
      const formattedValue = store.getters['currency/formatCurrency'](amount, currency);
      el.innerHTML = formattedValue;
      
      // Orijinal değeri güncelle
      el._originalAmount = amount;
      el._originalCurrency = currency;
    }
  }
}; 