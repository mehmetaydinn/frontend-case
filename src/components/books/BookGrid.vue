<template>
  <div class="book-grid">
    <div 
      class="grid-container" 
      :class="{ 'list-view': viewMode === 'list' }"
      ref="gridContainer"
    >
      <div 
        v-for="book in displayedBooks" 
        :key="book.id" 
        class="grid-item"
      >
        <BookCard 
          :book="book" 
          :viewMode="viewMode"
        />
      </div>
      
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
      
      <div v-if="!isLoading && displayedBooks.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-book-open"></i>
        </div>
        <h3>Kitap bulunamadı</h3>
        <p>Filtreleri sıfırlayın veya yeni bir arama yapın.</p>
        <button @click="resetFilters" class="btn-reset-filters">
          Filtreleri Sıfırla
        </button>
      </div>
    </div>
    
    <div v-if="hasMoreToLoad && !isLoading" class="load-more">
      <button 
        @click="loadMore" 
        class="btn-load-more"
      >
        Daha Fazla Yükle
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import BookCard from './BookCard.vue';

export default {
  name: 'BookGrid',
  components: {
    BookCard
  },
  props: {
    books: {
      type: Array,
      required: true
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: (value) => ['grid', 'list'].includes(value)
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    infiniteScroll: {
      type: Boolean,
      default: true
    },
    itemsPerPage: {
      type: Number,
      default: 12
    }
  },
  emits: ['load-more', 'reset-filters'],
  setup(props, { emit }) {
    
    const gridContainer = ref(null);
    const currentPage = ref(1);
    const isIntersecting = ref(false);
    // İstek limitleyici değişken
    const loadLock = ref(false);
    
    // Görüntülenecek kitaplar
    const displayedBooks = computed(() => {

      if (!props.books || props.books.length === 0) {
        return [];
      }
      
      const endIndex = props.infiniteScroll 
        ? currentPage.value * props.itemsPerPage 
        : props.books.length;
        
      const result = props.books.slice(0, endIndex);
      return result;
    });
    
    // Daha fazla yüklenecek kitap var mı?
    const hasMoreToLoad = computed(() => {
      return displayedBooks.value.length < props.books.length;
    });
    
    // Daha fazla kitap yükle
    const loadMore = () => {

      // İstek kilidi aktifse çık
      if (loadLock.value || !hasMoreToLoad.value || props.isLoading) {
        return;
      }
      
      // Kilidi aktif et
      loadLock.value = true;
      
      // Sayfa numarasını artır
      currentPage.value++;
      
      // Ebeveyn bileşene bildir
      emit('load-more');
      
      // 1 saniye sonra istek kilidini kaldır
      setTimeout(() => {
        loadLock.value = false;
      }, 1000);
    };
    
    // Filtreleri sıfırla
    const resetFilters = () => {
      emit('reset-filters');
    };
    
    // Sonsuz kaydırma için IntersectionObserver
    let observer;
    
    const setupIntersectionObserver = () => {
      if (!props.infiniteScroll) return;
      
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          isIntersecting.value = entry.isIntersecting;
          
          if (isIntersecting.value && hasMoreToLoad.value && !props.isLoading && !loadLock.value) {
            loadMore();
          }
        },
        {
          root: null,
          rootMargin: '0px 0px 300px 0px', // Daha küçük bir rootMargin
          threshold: 0.1
        }
      );
      
      if (gridContainer.value) {
        observer.observe(gridContainer.value);
      }
    };
    
    // Kitaplar değiştiğinde sayfayı sıfırla
    watch(() => props.books, (newBooks, oldBooks) => {
      // Sadece kitap sayısı değiştiğinde sıfırla
      if (newBooks?.length !== oldBooks?.length) {
        currentPage.value = 1;
        loadLock.value = false;
      }
    }, { deep: false });
    
    // Lifecycle hooks
    onMounted(() => {
      setupIntersectionObserver();
    });
    
    onUnmounted(() => {
      if (observer) {
        observer.disconnect();
      }
    });
    
    return {
      gridContainer,
      displayedBooks,
      hasMoreToLoad,
      loadMore,
      resetFilters
    };
  }
};
</script>

<style scoped>
.book-grid {
  margin-bottom: 2rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  transition: all 0.3s ease;
}

.grid-container.list-view {
  grid-template-columns: 1fr;
}

.grid-item {
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

.grid-item:nth-child(1) { animation-delay: 0.05s; }
.grid-item:nth-child(2) { animation-delay: 0.1s; }
.grid-item:nth-child(3) { animation-delay: 0.15s; }
.grid-item:nth-child(4) { animation-delay: 0.2s; }
.grid-item:nth-child(5) { animation-delay: 0.25s; }
.grid-item:nth-child(6) { animation-delay: 0.3s; }
.grid-item:nth-child(7) { animation-delay: 0.35s; }
.grid-item:nth-child(8) { animation-delay: 0.4s; }
.grid-item:nth-child(9) { animation-delay: 0.45s; }
.grid-item:nth-child(10) { animation-delay: 0.5s; }
.grid-item:nth-child(11) { animation-delay: 0.55s; }
.grid-item:nth-child(12) { animation-delay: 0.6s; }

.loading-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.loading-container p {
  color: #666;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-state p {
  margin-bottom: 1rem;
  color: #666;
}

.btn-reset-filters {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-reset-filters:hover {
  background-color: #2980b9;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-load-more {
  padding: 0.5rem 2rem;
  border-radius: 4px;
  background-color: white;
  color: #3498db;
  border: 1px solid #3498db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-load-more:hover {
  background-color: #3498db;
  color: white;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive ayarlar */
@media (max-width: 992px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 576px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 