<template>
  <div class="book-filter">
    <div class="filter-header">
      <h3>Filtreleme Seçenekleri</h3>
      <button class="btn-toggle" @click="toggleFiltersVisibility">
        <i :class="isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
      </button>
    </div>
    
    <div class="filter-body" :class="{ 'collapsed': isCollapsed }">
      <!-- Arama bölümü kaldırıldı -->
      
      <!-- Kategori -->
      <div class="filter-group">
        <label for="category" class="filter-label">Kategori</label>
        <select 
          id="category" 
          v-model="filters.category" 
          class="filter-select"
          @change="emitChange"
        >
          <option value="">Tüm Kategoriler</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <!-- Dil -->
      <div class="filter-group">
        <label for="language" class="filter-label">Dil</label>
        <select 
          id="language" 
          v-model="filters.language" 
          class="filter-select"
          @change="emitChange"
        >
          <option value="">Tüm Diller</option>
          <option v-for="language in languages" :key="language" :value="language">
            {{ language }}
          </option>
        </select>
      </div>
      
      <!-- Yayın Yılı -->
      <div class="filter-group">
        <label class="filter-label">Yayın Yılı</label>
        <div class="range-inputs">
          <div class="range-input">
            <input 
              type="number" 
              v-model.number="filters.yearFrom" 
              placeholder="Min Yıl"
              class="filter-number"
              @change="validateYearRange"
            />
          </div>
          <span class="range-separator">-</span>
          <div class="range-input">
            <input 
              type="number" 
              v-model.number="filters.yearTo" 
              placeholder="Max Yıl"
              class="filter-number"
              @change="validateYearRange"
            />
          </div>
        </div>
      </div>
      
      <!-- Sayfa Sayısı -->
      <div class="filter-group">
        <label class="filter-label">Sayfa Sayısı</label>
        <div class="range-inputs">
          <div class="range-input">
            <input 
              type="number" 
              v-model.number="filters.pagesFrom" 
              placeholder="Min Sayfa"
              class="filter-number"
              @change="validatePageRange"
            />
          </div>
          <span class="range-separator">-</span>
          <div class="range-input">
            <input 
              type="number" 
              v-model.number="filters.pagesTo" 
              placeholder="Max Sayfa"
              class="filter-number"
              @change="validatePageRange"
            />
          </div>
        </div>
      </div>
      
      <!-- Fiyat Aralığı -->
      <div class="filter-group">
        <label class="filter-label">Fiyat Aralığı</label>
        <div class="price-filter">
          <div class="range-inputs">
            <div class="range-input">
              <input 
                type="number" 
                v-model.number="filters.priceFrom" 
                placeholder="Min Fiyat"
                class="filter-number"
                @change="validatePriceRange"
              />
            </div>
            <span class="range-separator">-</span>
            <div class="range-input">
              <input 
                type="number" 
                v-model.number="filters.priceTo" 
                placeholder="Max Fiyat"
                class="filter-number"
                @change="validatePriceRange"
              />
            </div>
          </div>
          <div class="currency-display">{{ currency }}</div>
        </div>
        
        <div class="form-group terms">
          <input 
            type="checkbox" 
            id="onlyFree"
            v-model="filters.onlyFree" 
            @change="emitChange"
          />
          <label for="onlyFree">
            Sadece Ücretsiz Kitaplar
          </label>
        </div>
      </div>
      
      <!-- Sıralama -->
      <div class="filter-group">
        <label for="sortBy" class="filter-label">Sıralama</label>
        <select 
          id="sortBy" 
          v-model="filters.sortBy" 
          class="filter-select"
          @change="emitChange"
        >
          <option value="date_desc">En Yeni</option>
          <option value="date_asc">En Eski</option>
          <option value="title_asc">İsim (A-Z)</option>
          <option value="title_desc">İsim (Z-A)</option>
          <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
          <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
        </select>
      </div>
      
      <!-- Filtreleri Temizle -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilters">
          Filtreleri Sıfırla
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'BookFilter',
  emits: ['filter-change'],
  setup(props, { emit }) {
    const store = useStore();
    
    // Kolaps durumu
    const isCollapsed = ref(window.innerWidth < 768);
    
    // Filtre değerleri
    const filters = reactive({
      category: '',
      language: '',
      yearFrom: null,
      yearTo: null,
      pagesFrom: null,
      pagesTo: null,
      priceFrom: null,
      priceTo: null,
      onlyFree: false,
      sortBy: 'date_desc',
      viewMode: 'grid'
    });
    
    // Debounce timer
    let debounceTimer;
    
    // Kategori listesi - Kategorileri direkt değer olarak kullan
    const categories = ref([
      'Roman',
      'Bilim Kurgu',
      'Fantastik',
      'Tarih',
      'Biyografi',
      'Kişisel Gelişim',
      'Bilim',
      'Felsefe',
      'Psikoloji',
      'Çocuk Kitapları',
      'Tiyatro'
    ]);
    
    // Dil listesi
    const languages = ref(['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'İtalyanca', 'Rusça']);
    
    // Seçili para birimi
    const selectedCurrency = computed(() => store.getters['currency/selectedCurrency']);
    
    // Filtreleri değiştirme fonksiyonu
    const emitChange = () => {
      emit('filter-change', { ...filters });
    };
    
    // Debounce fonksiyonu
    const debounce = (fn, wait) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fn, wait);
    };
    
    // Görünüm modu değiştirme
    const setViewMode = (mode) => {
      filters.viewMode = mode;
      emitChange();
    };
    
    // Yıl aralığı doğrulama
    const validateYearRange = () => {
      if (filters.yearFrom && filters.yearTo && filters.yearFrom > filters.yearTo) {
        filters.yearTo = filters.yearFrom;
      }
      emitChange();
    };
    
    // Sayfa aralığı doğrulama
    const validatePageRange = () => {
      if (filters.pagesFrom && filters.pagesTo && filters.pagesFrom > filters.pagesTo) {
        filters.pagesTo = filters.pagesFrom;
      }
      emitChange();
    };
    
    // Fiyat aralığı doğrulama
    const validatePriceRange = () => {
      if (filters.priceFrom && filters.priceTo && filters.priceFrom > filters.priceTo) {
        filters.priceTo = filters.priceFrom;
      }
      emitChange();
    };
    
    // Filtreleri sıfırla
    const resetFilters = () => {
      filters.category = '';
      filters.language = '';
      filters.yearFrom = null;
      filters.yearTo = null;
      filters.pagesFrom = null;
      filters.pagesTo = null;
      filters.priceFrom = null;
      filters.priceTo = null;
      filters.onlyFree = false;
      filters.sortBy = 'date_desc';
      
      emitChange();
    };
    
    // Filtrelerin görünürlüğünü değiştirme
    const toggleFiltersVisibility = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    
    // Para birimi değişikliğini izle
    watch(selectedCurrency, () => {
      // Para birimi değiştiğinde fiyat filtresini uygula
      emitChange();
    });
    
    // Pencere boyutu değişimini izleme
    onMounted(() => {
      window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
          isCollapsed.value = true;
        }
      });
    });
    
    return {
      isCollapsed,
      filters,
      categories,
      languages,
      selectedCurrency,
      emitChange,
      debounce,
      setViewMode,
      validateYearRange,
      validatePageRange,
      validatePriceRange,
      resetFilters,
      toggleFiltersVisibility
    };
  }
};
</script>

<style scoped>
.book-filter {
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: var(--box-shadow-sm);
  overflow: hidden;
  position: sticky;
  top: 10px;
  border: 1px solid var(--border-color);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.filter-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.btn-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-toggle:hover {
  background-color: var(--hover-color);
}

.filter-body {
  padding: 16px;
  max-height: 850px;
  overflow-y: auto;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.filter-body.collapsed {
  max-height: 0;
  padding: 0 16px;
  overflow: hidden;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.filter-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.filter-input::placeholder {
  color: var(--text-color);
  opacity: 0.6;
}

.search-input-container {
  position: relative;
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #bdbdbd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  color: #e74c3c;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.range-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: #666;
  font-weight: 500;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-filter input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-filter label {
  cursor: pointer;
  user-select: none;
  color: #333;
}

.view-mode-buttons {
  display: flex;
  gap: 2px;
  border-radius: 4px;
  overflow: hidden;
}

.view-mode-btn {
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.view-mode-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.view-mode-btn:last-child {
  border-radius: 0 4px 4px 0;
}

.view-mode-btn:hover {
  background-color: #f5f5f5;
}

.view-mode-btn.active {
  background-color: #3498db;
  color: #fff;
  border-color: #3498db;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-reset {
  flex: 1;
  padding: 10px 16px;
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background-color: var(--hover-color);
  border-color: var(--border-color);
}

.btn-apply {
  flex: 1;
  padding: 10px 16px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-apply:hover {
  background-color: #2980b9;
}

@media (max-width: 992px) {
  .filter-body {
    max-height: 600px;
  }
  
  .filter-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 768px) {
  .filter-body {
    padding: 12px;
  }
  
  .filter-body.collapsed {
    padding: 0 12px;
  }
  
  .filter-group {
    margin-bottom: 16px;
  }
}

@media (max-width: 576px) {
  .range-inputs {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .range-separator {
    display: none;
  }
  
  .range-input::after {
    content: attr(data-label);
    display: block;
    font-size: 12px;
    color: #bdbdbd;
    margin-top: 4px;
  }
}

.form-group.terms {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.form-group.terms input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.form-group.terms label {
  margin: 0;
  font-weight: normal;
  font-size: var(--font-size-base);
  cursor: pointer;
  user-select: none;
  flex: 1;
  color: var(--text-color);
}
</style>