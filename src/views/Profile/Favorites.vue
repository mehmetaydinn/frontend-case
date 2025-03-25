<template>
  <div class="favorites-page">
    <h1 class="page-title">Favorilerim</h1>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Favorileriniz yükleniyor...</p>
    </div>
    
    <div v-else-if="favorites.length === 0" class="empty-state">
      <div class="empty-image">
      </div>
      <h2>Henüz favori kitabınız yok</h2>
      <p>Kitapları keşfetmeye başlayın ve favorilerinize ekleyin.</p>
      <router-link to="/" class="btn-primary">Kitapları Keşfet</router-link>
    </div>
    
    <div v-else class="favorites-content">
      <div class="favorites-filter">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Favori kitaplarınızda arayın..."
          class="search-input"
        />
        
        <div class="sort-container">
          <label for="sort">Sıralama:</label>
          <select v-model="sortBy" id="sort" class="sort-select">
            <option value="title-asc">Ada Göre (A-Z)</option>
            <option value="title-desc">Ada Göre (Z-A)</option>
            <option value="date-desc">Eklenme Tarihi (Yeni-Eski)</option>
            <option value="date-asc">Eklenme Tarihi (Eski-Yeni)</option>
            <option value="price-asc">Fiyata Göre (Düşük-Yüksek)</option>
            <option value="price-desc">Fiyata Göre (Yüksek-Düşük)</option>
          </select>
        </div>
      </div>
      
      <div class="books-grid">
        <div v-for="book in filteredAndSortedFavorites" :key="book.id" class="book-card">
          <div class="favorite-actions">
            <button @click="removeFromFavorites(book.id)" class="remove-btn" title="Favorilerden Çıkar">
              ❌
            </button>
          </div>
          
          <router-link :to="`/books/${book.id}`" class="book-link">
            <div class="book-cover">
              <img :src="typeof book === 'object' && book.coverImage ? book.coverImage : 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fbookstoreromanceday.org%2Fbook-cover-placeholder%2F&psig=AOvVaw035xbyCXp9aMOMHp3Z9Rwg&ust=1742594455747000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKD7-qzUmYwDFQAAAAAdAAAAABAE'" :alt="typeof book === 'object' ? book.title || 'Kitap' : 'Kitap'">
              <span v-if="typeof book === 'object' && book.isFree" class="free-badge">Ücretsiz</span>
            </div>
            <div class="book-info">
              <h3 class="book-title">{{ typeof book === 'object' ? book.title || 'İsimsiz Kitap' : book }}</h3>
              <p class="book-author">{{ typeof book === 'object' && book.author ? book.author : 'Bilgi yok' }}</p>
              <p class="book-price" v-if="typeof book === 'object' && !book.isFree && book.price && book.price.amount">
                <span v-currency="{ amount: book.price.amount, currency: book.price.currency }"></span>
              </p>
              <div class="book-category">{{ typeof book === 'object' && book.category ? book.category : 'Kategorisiz' }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'FavoritesPage',
  setup() {
    const store = useStore();
    
    // State
    const searchTerm = ref('');
    const sortBy = ref('date-desc');
    
    // Getters
    const isLoading = computed(() => store.getters['favorites/isLoading']);
    const favorites = computed(() => {
      const currentUser = store.getters['user/currentUser'];
      if (!currentUser) return [];
      
      return store.getters['favorites/getFavoriteBooks'](currentUser) || [];
    });
    const selectedCurrency = computed(() => store.getters['currency/selectedCurrency']);
    
    // Filtre ve sıralama ile favori kitapları getir
    const filteredAndSortedFavorites = computed(() => {
      // Önce arama terimine göre filtrele
      let result = favorites.value;
      
      // Eğer result tanımsız veya null ise boş dizi döndür
      if (!result || !Array.isArray(result)) {
        console.warn('Favoriler dizisi beklendiği gibi gelmedi:', result);
        return [];
      }
      
      // Arama terimine göre filtrele
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        result = result.filter(
          book => 
            typeof book === 'object' && book && (
              (book.title && book.title.toLowerCase().includes(term)) || 
              (book.author && book.author.toLowerCase().includes(term)) ||
              (book.category && book.category.toLowerCase().includes(term))
            )
        );
      }
      
      // Sonra sıralama seçeneğine göre sırala
      switch (sortBy.value) {
        case 'title-asc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || typeof b !== 'object') return 0;
            return a.title?.localeCompare(b.title || '') || 0;
          });
        case 'title-desc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || typeof b !== 'object') return 0;
            return b.title?.localeCompare(a.title || '') || 0;
          });
        case 'date-desc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || !a.addedToFavoritesAt) return 1;
            if (typeof b !== 'object' || !b.addedToFavoritesAt) return -1;
            return new Date(b.addedToFavoritesAt) - new Date(a.addedToFavoritesAt);
          });
        case 'date-asc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || !a.addedToFavoritesAt) return -1;
            if (typeof b !== 'object' || !b.addedToFavoritesAt) return 1;
            return new Date(a.addedToFavoritesAt) - new Date(b.addedToFavoritesAt);
          });
        case 'price-asc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || typeof b !== 'object') return 0;
            if (a.isFree) return -1;
            if (b.isFree) return 1;
            return ((a.price?.amount || 0) - (b.price?.amount || 0));
          });
        case 'price-desc':
          return [...result].sort((a, b) => {
            if (typeof a !== 'object' || typeof b !== 'object') return 0;
            if (a.isFree) return 1;
            if (b.isFree) return -1;
            return ((b.price?.amount || 0) - (a.price?.amount || 0));
          });
        default:
          return result;
      }
    });
    
    // Favorileri yükle
    onMounted(async () => {
      try {
        await store.dispatch('favorites/fetchFavorites');
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Favoriler yüklenirken bir hata oluştu',
          type: 'error'
        });
      }
    });
    
    // Favorilerden çıkar
    const removeFromFavorites = async (bookId) => {
      const currentUser = store.getters['user/currentUser'];
      if (!currentUser) return;
      
      try {
        await store.dispatch('favorites/toggleFavorite', {
          userId: currentUser,
          bookId: bookId
        });
        
        // Bildirim göster
        store.dispatch('ui/showNotification', {
          message: 'Kitap favorilerden çıkarıldı',
          type: 'success'
        });
      } catch (error) {
        
        store.dispatch('ui/showNotification', {
          message: 'Kitap favorilerden çıkarılırken bir hata oluştu',
          type: 'error'
        });
      }
    };
    
    return {
      isLoading,
      favorites,
      searchTerm,
      sortBy,
      filteredAndSortedFavorites,
      selectedCurrency,
      removeFromFavorites
    };
  }
};
</script>

<style scoped>
.favorites-page {
  padding: var(--spacing-lg) 0;
}

.page-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--color-primary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-light-grey);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
  text-align: center;
}

.empty-image {
  max-width: 200px;
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  margin-bottom: var(--spacing-md);
  color: var(--color-dark);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  color: var(--color-grey);
  max-width: 400px;
}

.btn-primary {
  display: inline-block;
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: #2980b9; /* 10% daha koyu */
}

.favorites-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.favorites-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.sort-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-container label {
  color: var(--color-dark);
  font-weight: 500;
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.book-card {
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--box-shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  position: relative;
  border: 1px solid var(--border-color);
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-md);
}

.favorite-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 10;
}

.remove-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
  color: var(--text-color);
}

.remove-btn:hover {
  opacity: 1;
}

.book-link {
  color: var(--color-dark);
  text-decoration: none;
  display: block;
}

.book-cover {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.free-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  background-color: var(--color-secondary);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-small);
  font-weight: bold;
}

.book-info {
  padding: var(--spacing-md);
}

.book-title {
  font-size: var(--font-size-medium);
  margin-bottom: var(--spacing-xs);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color);
}

.book-author {
  color: var(--color-grey);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-small);
}

.book-price {
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.book-category {
  display: inline-block;
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-small);
  border: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .favorites-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .sort-container {
    width: 100%;
    justify-content: space-between;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style> 