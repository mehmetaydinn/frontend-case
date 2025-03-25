<template>
  <div class="currency-selector">
    <div class="selector-label" @click="toggleDropdown">
      <span class="current-currency">{{ currentCurrency }}</span>
      <i class="dropdown-icon" :class="{ 'open': isOpen }"></i>
    </div>
    
    <div v-if="isOpen" class="currency-dropdown">
      <div 
        v-for="currency in availableCurrencies" 
        :key="currency.code"
        class="currency-option"
        :class="{ 'active': currency.code === currentCurrency }"
        @click="selectCurrency(currency.code)"
      >
        <span class="currency-code">{{ currency.code }}</span>
        <span class="currency-name">{{ currency.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'CurrencySelector',
  props: {
    initialCurrency: {
      type: String,
      default: 'TRY'
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const isOpen = ref(false);
    const currentCurrency = ref(props.initialCurrency);
    
    // Kullanılabilir para birimleri
    const availableCurrencies = [
      { code: 'TRY', name: 'Türk Lirası' },
      { code: 'USD', name: 'Amerikan Doları' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'İngiliz Sterlini' }
    ];
    
    // Dropdown menüyü aç/kapat
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };
    
    // Para birimi seçimi
    const selectCurrency = (currencyCode) => {
      currentCurrency.value = currencyCode;
      store.dispatch('settings/changeCurrency', currencyCode);
      isOpen.value = false;
      emit('currency-changed', currencyCode);
    };
    
    // Dışarı tıklandığında dropdown'ı kapat
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.currency-selector')) {
        isOpen.value = false;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
      
      // Store'dan mevcut para birimini al
      const storeCurrency = store.state.settings?.currency;
      if (storeCurrency) {
        currentCurrency.value = storeCurrency;
      }
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
    
    return {
      isOpen,
      currentCurrency,
      availableCurrencies,
      toggleDropdown,
      selectCurrency
    };
  }
};
</script>

<style scoped>
.currency-selector {
  position: relative;
  display: inline-block;
  user-select: none;
}

.selector-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.selector-label:hover {
  border-color: #3498db;
}

.current-currency {
  font-weight: 500;
  margin-right: 8px;
}

.dropdown-icon {
  position: relative;
  width: 10px;
  height: 10px;
}

.dropdown-icon:before, 
.dropdown-icon:after {
  content: '';
  position: absolute;
  background-color: #333;
  height: 2px;
  width: 7px;
  border-radius: 1px;
  top: 5px;
  transition: all 0.3s ease;
}

.dropdown-icon:before {
  left: 0;
  transform: rotate(45deg);
}

.dropdown-icon:after {
  right: 0;
  transform: rotate(-45deg);
}

.dropdown-icon.open:before {
  transform: rotate(-45deg);
}

.dropdown-icon.open:after {
  transform: rotate(45deg);
}

.currency-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 200px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.currency-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.currency-option:hover {
  background-color: #f5f5f5;
}

.currency-option.active {
  background-color: #e3f2fd;
  color: #3498db;
  font-weight: 500;
}

.currency-code {
  font-weight: 500;
}

.currency-name {
  font-size: 0.9em;
  color: #666;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 576px) {
  .currency-dropdown {
    width: 150px;
  }
  
  .currency-option {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .currency-name {
    font-size: 0.8em;
  }
}
</style> 