<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <h1>Kitap Dünyası Pro'ya Hoşgeldiniz</h1>
        <p>En sevdiğiniz kitapları keşfedin, koleksiyonunuzu yönetin ve okuma deneyiminizi takip edin</p>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="debouncedSearch"
            placeholder="Kitap adı, yazar veya anahtar kelime ara.." 
            class="search-input"
          />
          <button class="search-button" @click="searchBooks">
            <i class="fas fa-search"></i> Ara
          </button>
        </div>
      </div>
    </section>
    
    <!-- Öne Çıkan Kitaplar Carousel -->
    <section class="featured-carousel" v-if="featuredBooks && featuredBooks.length > 0 && !activeSearch">
      <div>
        <h2>Öne Çıkan Kitaplar</h2>
        <BookCarousel 
          :books="featuredBooks" 
          :autoplay="true"
          :interval="5000"
        />
      </div>
    </section>
    
    <!-- Ana İçerik Bölümü -->
    <section class="main-content">
      <div class="container">
        <div class="content-header">
          <h2 v-if="activeSearch">{{ searchQuery + " için Arama Sonuçları" }}</h2>
          <h2 v-else>Tüm Kitaplar</h2>
          
          <div class="content-actions">
            <CurrencySelector 
              @currency-changed="handleCurrencyChange"
            />
            <div class="view-mode-toggle">
              <button 
                @click="changeViewMode('grid')"
                :class="{ 'active': viewMode === 'grid' }"
                title="Grid Görünümü"
              >
                <i class="fas fa-th"></i>
              </button>
              <button 
                @click="changeViewMode('list')"
                :class="{ 'active': viewMode === 'list' }"
                title="Liste Görünümü"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="content-with-sidebar">
          <!-- Filtre Sidebar -->
          <aside class="sidebar">
            <BookFilter 
              @filter-change="applyFilters"
              :key="filterKey"
            />
          </aside>
          
          <!-- Kitap Listesi/Grid -->
          <div class="book-list-container">
            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner"></div>
              <p>Kitaplar yükleniyor...</p>
            </div>
            
            <BookGrid 
              v-else
              :books="filteredBooks" 
              :viewMode="viewMode"
              :isLoading="isLoadingMore"
              @load-more="loadMoreBooks"
              @reset-filters="resetFilters"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import BookCarousel from '@/components/books/BookCarousel.vue';
import BookFilter from '@/components/books/BookFilter.vue';
import BookGrid from '@/components/books/BookGrid.vue';
import CurrencySelector from '@/components/books/CurrencySelector.vue';
import BookCard from '@/components/books/BookCard.vue';

export default {
  name: 'HomePage',
  components: {
    BookCarousel,
    BookFilter,
    BookGrid,
    CurrencySelector,
    BookCard
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    // Durum değişkenleri
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const activeSearch = ref(false);
    const isLoadingMore = ref(false);
    const page = ref(1);
    const filterKey = ref(0); // Filtreleme bileşenini yenilemek için anahtar
    
    // Görünüm modu
    const viewMode = computed(() => store.getters['settings/viewMode'] || 'grid');
    
    // Filtreler
    const filters = reactive({
      search: '',
      category: '',
      language: '',
      yearFrom: null,
      yearTo: null,
      pagesFrom: null,
      pagesTo: null,
      priceFrom: null,
      priceTo: null,
      onlyFree: false,
      sortBy: 'date_desc'
    });
    
    // Store'dan verileri getir
    const isLoading = computed(() => store.getters['books/isLoading']);
    const error = computed(() => store.getters['books/error']);
    const allBooks = computed(() => store.getters['books/allBooks']);
    const featuredBooks = computed(() => store.getters['books/featuredBooks']);
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const selectedCurrency = computed(() => store.getters['settings/currentCurrency']);
    
    // Filtrelenmiş kitaplar
    const filteredBooks = computed(() => {
      let result = [...(activeSearch.value ? searchResults.value : allBooks.value)];
      
      // Kategori filtresi
      if (filters.category) {
        result = result.filter(book => book.category === filters.category);
      }
      
      // Dil filtresi
      if (filters.language) {
        result = result.filter(book => book.language === filters.language);
      }
      
      // Yıl aralığı filtresi
      if (filters.yearFrom) {
        result = result.filter(book => book.publishedYear >= filters.yearFrom);
      }
      if (filters.yearTo) {
        result = result.filter(book => book.publishedYear <= filters.yearTo);
      }
      
      // Sayfa sayısı filtresi
      if (filters.pagesFrom) {
        result = result.filter(book => book.pageCount >= filters.pagesFrom);
      }
      if (filters.pagesTo) {
        result = result.filter(book => book.pageCount <= filters.pagesTo);
      }
      
      // Fiyat aralığı filtresi
      if (filters.priceFrom) {
        result = result.filter(book => {
          if (!book.price || !book.price.amount) return false;
          const convertedPrice = store.getters['settings/convertPrice'](book.price.amount, book.price.currency);
          return convertedPrice >= filters.priceFrom;
        });
      }
      if (filters.priceTo) {
        result = result.filter(book => {
          if (!book.price || !book.price.amount) return false;
          const convertedPrice = store.getters['settings/convertPrice'](book.price.amount, book.price.currency);
          return convertedPrice <= filters.priceTo;
        });
      }
      
      // Ücretsiz içerik filtresi
      if (filters.onlyFree) {
        result = result.filter(book => book.isFree);
      }
      
      // Sıralama
      switch (filters.sortBy) {
        case 'date_desc':
          result.sort((a, b) => (b.publishedYear || 0) - (a.publishedYear || 0));
          break;
        case 'date_asc':
          result.sort((a, b) => (a.publishedYear || 0) - (b.publishedYear || 0));
          break;
        case 'title_asc':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title_desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'price_asc':
          result.sort((a, b) => {
            const priceA = a.isFree ? 0 : store.getters['settings/convertPrice'](a.price?.amount || 0, a.price?.currency);
            const priceB = b.isFree ? 0 : store.getters['settings/convertPrice'](b.price?.amount || 0, b.price?.currency);
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          result.sort((a, b) => {
            const priceA = a.isFree ? 0 : store.getters['settings/convertPrice'](a.price?.amount || 0, a.price?.currency);
            const priceB = b.isFree ? 0 : store.getters['settings/convertPrice'](b.price?.amount || 0, b.price?.currency);
            return priceB - priceA;
          });
          break;
      }
      
      return result;
    });
    
    // Sayfa yüklendiğinde verileri getir
    onMounted(async () => {
      
      try {
        // Ayarları başlat
        await store.dispatch('settings/initSettings');
        
        // Kitapları yükle
        await store.dispatch('books/initializeClassicBooks');
        
        const booksResult = await store.dispatch('books/fetchBooks', { 
          page: 1,
          limit: 50 
        });
        
        // URL'den kategori parametresini al
        const categoryParam = route.query.category;
        if (categoryParam) {
          filters.category = categoryParam;
        }
        
      } catch (error) {
      }
    });
    
    // Para birimi değiştiğinde filtrelenmiş kitapları yenile
    watch(selectedCurrency, () => {
      // Fiyat filtresini uygulayabilmek için filter key'i güncelle
      filterKey.value++;
    });
    
    // Arama işlemi
    const searchBooks = async () => {
      if (!searchQuery.value) {
        // Arama terimi yoksa tüm kitapları göster
        activeSearch.value = false;
        searchResults.value = [];
        return;
      }
      
      isSearching.value = true;
      try {
        const results = await store.dispatch('books/searchBooks', searchQuery.value);
        searchResults.value = results;
        activeSearch.value = true;
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Arama yapılırken bir hata oluştu',
          type: 'error'
        });
      } finally {
        isSearching.value = false;
      }
    };
    
    // Debounce fonksiyonu
    let searchTimeout;
    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (searchQuery.value.trim().length >= 2) {
          filters.search = searchQuery.value;
          searchBooks();
        } else if (searchQuery.value.trim().length === 0) {
          filters.search = '';
          activeSearch.value = false;
          searchResults.value = [];
        }
      }, 200); // 200ms debounce
    };
    
    // Daha fazla kitap yükle
    const loadMoreBooks = async () => {
      
      // Eğer zaten yükleniyorsa veya hiç kitap yoksa çık
      if (isLoadingMore.value || !allBooks.value.length) {
        return;
      }
      
      // Eğer aktif bir arama varsa, daha fazla kitap yüklemeye gerek yok
      if (activeSearch.value) {
        return;
      }
      
      
      // Daha fazla kitap yükleniyor durumunu ayarla
      isLoadingMore.value = true;
      
      try {
        // Sayfa numarasını artır
        page.value++;
        
        // Kitapları getir
        const newBooks = await store.dispatch('books/fetchBooks', { 
          page: page.value,
          limit: 12 // Her seferinde sabit sayıda kitap yükle
        });
        
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Daha fazla kitap yüklenirken hata oluştu',
          type: 'error'
        });
      } finally {
        // 1 saniye sonra yükleme durumunu kapat
        setTimeout(() => {
          isLoadingMore.value = false;
        }, 1000);
      }
    };
    
    // Filtreleri uygula
    const applyFilters = (newFilters) => {
      // Görünüm modunu güncelle
      if (newFilters.viewMode && newFilters.viewMode !== viewMode.value) {
        changeViewMode(newFilters.viewMode);
      }
      
      // Filtreleri güncelle
      Object.keys(filters).forEach(key => {
        if (key in newFilters) {
          filters[key] = newFilters[key];
        }
      });
    };
    
    // Filtreleri sıfırla
    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        if (key !== 'sortBy' && key !== 'viewMode') {
          filters[key] = key.includes('From') || key.includes('To') ? null : '';
        }
      });
      
      filters.onlyFree = false;
      filters.sortBy = 'date_desc';
      
      // Arama kutusunu temizle
      searchQuery.value = '';
      activeSearch.value = false;
      
      // Filter key'i güncelle
      filterKey.value++;
    };
    
    // Görünüm modunu değiştir
    const changeViewMode = (mode) => {
      store.dispatch('settings/changeViewMode', mode);
    };
    
    // Para birimi değiştiğinde
    const handleCurrencyChange = (currency) => {
      // Currency değiştikten sonra, bunu state'de tutuyoruz
      store.dispatch('settings/changeCurrency', currency);
    };
    
    // Kitap detaylarını görüntüleme
    const viewBook = (bookId) => {
      router.push(`/books/${bookId}`);
    };
    
    return {
      searchQuery,
      searchResults,
      isSearching,
      isLoading,
      isLoadingMore,
      error,
      allBooks,
      featuredBooks,
      filteredBooks,
      isAuthenticated,
      viewMode,
      filterKey,
      activeSearch,
      searchBooks,
      debouncedSearch,
      loadMoreBooks,
      applyFilters,
      resetFilters,
      changeViewMode,
      handleCurrencyChange,
      viewBook
    };
  }
};
</script>

<style scoped>
.home {
  padding-bottom: 40px;
}

.hero {
  background: linear-gradient(to right, #3498db, #5aafec);
  color: #fff;
  padding: 60px 0;
  text-align: center;
  margin: 30px 0px;
}

.hero h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 18px;
  max-width: 800px;
  margin: 0 auto 30px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  display: flex;
}

.search-input {
  padding: 16px 20px;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  border: none;
  flex-grow: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-button {
  background: #27ae60;
  border: none;
  color: #fff;
  border-radius: 0 8px 8px 0;
  padding: 12px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background-color: #219653;
}

.featured-carousel {
  margin-bottom: 30px;
}

.main-content {
  background-color: var(--bg-color);
  padding: 30px 0px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.view-mode-toggle {
  display: flex;
  gap: 2px;
  border-radius: 4px;
  overflow: hidden;
}

.view-mode-toggle button {
  padding: 8px 16px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color);
}

.view-mode-toggle button:hover {
  background-color: var(--hover-color);
}

.view-mode-toggle button.active {
  background-color: #3498db;
  color: #fff;
  border-color: #3498db;
}

.content-with-sidebar {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

@media (max-width: 992px) {
  .content-with-sidebar {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    margin-bottom: 20px;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-container p {
  color: #666;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.user-books-section {
  background-color: var(--bg-color);
  padding: 40px 0;
  margin-bottom: 30px;
}

.user-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 28px;
  }
  
  .hero p {
    font-size: 16px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 