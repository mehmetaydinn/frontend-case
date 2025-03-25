/**
 * vHighlight direktifi - Metindeki belirli kısımları vurgular
 * 
 * Kullanım örnekleri:
 * <p v-highlight="'aranacak kelime'">Metin içerisinde aranacak kelime var.</p>
 * <p v-highlight="{ term: 'aranacak kelime', color: '#ffff00' }">Metin içerisinde aranacak kelime var.</p>
 */

export const vHighlight = {
  mounted(el, binding) {
    if (!binding.value) return;
    
    // Binding değerine göre arama terimi ve renk belirle
    const term = typeof binding.value === 'string' 
      ? binding.value 
      : binding.value.term;
      
    const color = typeof binding.value === 'string' 
      ? '#ffff00' // Varsayılan sarı renk
      : binding.value.color || '#ffff00';
    
    if (!term.trim()) return;
    
    // Metnin orijinal halini sakla
    const originalText = el.innerHTML;
    
    // Arama terimini vurgula (case-insensitive)
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    el.innerHTML = originalText.replace(regex, `<span style="background-color: ${color}; padding: 0 2px; border-radius: 2px;">$1</span>`);
  },
  
  updated(el, binding) {
    if (!binding.value) return;
    
    // Binding değerine göre arama terimi ve renk belirle
    const term = typeof binding.value === 'string' 
      ? binding.value 
      : binding.value.term;
      
    const color = typeof binding.value === 'string' 
      ? '#ffff00' // Varsayılan sarı renk
      : binding.value.color || '#ffff00';
    
    if (!term.trim()) return;
    
    // Metnin orijinal halini sakla (eğer varsa highlight'lardan temizle)
    const originalText = el.innerHTML.replace(/<span style="background-color: .*?">(.+?)<\/span>/g, '$1');
    
    // Arama terimini vurgula (case-insensitive)
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    el.innerHTML = originalText.replace(regex, `<span style="background-color: ${color}; padding: 0 2px; border-radius: 2px;">$1</span>`);
  }
}; 