<template>
  <div 
    class="book-card" 
    :class="{ 'is-horizontal': viewMode === 'list' }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="navigateToDetails"
  >
    <div class="book-cover">
      <img 
        :src="imageSource" 
        :alt="book.title"
        loading="lazy"
        @error="handleImageError"
        class="cover-image"
      >
      <span v-if="book.isFree" class="badge free-badge">Ücretsiz</span>
      
      <div class="book-actions" :class="{ 'show': isHovered }">
        <button 
          class="action-btn favorite-btn" 
          :class="{ 'is-favorited': isFavorited }"
          @click.stop="toggleFavorite"
          v-if="isAuthenticated"
        >
          <i class="fas fa-heart"></i>
        </button>
      </div>
      
      <transition name="fade">
        <div v-if="isHovered" class="hover-info">
          <div class="book-categories" v-if="book.category">
            <span class="category">{{ book.category }}</span>
          </div>
          
          <div class="book-meta">
            <span v-if="book.pageCount" class="meta-item">
              <i class="fas fa-book"></i> {{ book.pageCount }} sayfa
            </span>
            
            <span v-if="book.publishedYear" class="meta-item">
              <i class="fas fa-calendar"></i> {{ book.publishedYear }}
            </span>
          </div>
        </div>
      </transition>
    </div>
    
    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      
      <p class="book-price" v-if="!book.isFree && book.price">
        <span v-currency="{ amount: book.price.amount, currency: book.price.currency }"></span>
        
      </p>
      
      <p class="book-price free-text" v-else-if="book.isFree">
        Ücretsiz
      </p>
      
      <div class="book-description" v-if="viewMode === 'list' && book.description">
        <p>{{ truncateDescription(book.description, 150) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: (value) => ['grid', 'list'].includes(value)
    }
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const { book } = toRefs(props);
    
    const isHovered = ref(false);
    const imageError = ref(false);
    const placeholderImage = 'https://dummyimage.com/200x300/e0e0e0/ffffff&text=Kitap+Kapağı';
    
    // Görüntü kaynağı hesaplama
    const imageSource = computed(() => {
      if (imageError.value) {
        return placeholderImage;
      }
      return book.value.coverImage || placeholderImage;
    });
    
    // Kullanıcı oturum durumu
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const currentUser = computed(() => store.getters['user/currentUser']);
    
    // Seçili para birimi
    const currentCurrency = computed(() => store.getters['settings/currentCurrency']);
    
    // Favori durumu
    const isFavorited = computed(() => {
      if (!isAuthenticated.value || !currentUser.value) return false;
      return store.getters['favorites/isBookFavorited'](currentUser.value, book.value.id);
    });
    
    // Resim yükleme hatası için
    const handleImageError = () => {
      imageError.value = true;
    };
    
    // Favorilere ekle/çıkar
    const toggleFavorite = async (event) => {
      event.stopPropagation();
      
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        await store.dispatch('favorites/toggleFavorite', {
          userId: currentUser.value,
          bookId: book.value.id
        });
        
        // Bildirim göster
        const message = isFavorited.value 
        ? 'Kitap favorilere eklendi'
        : 'Kitap favorilerden çıkarıldı' ;
          
        store.dispatch('ui/showNotification', {
          message,
          type: 'success'
        });
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'İşlem sırasında bir hata oluştu',
          type: 'error'
        });
      }
    };
    
    // Detay sayfasına git
    const navigateToDetails = () => {
      router.push(`/books/${book.value.id}`);
    };
    
    // Açıklama metni kısaltma
    const truncateDescription = (text, maxLength) => {
      if (!text) return '';
      return text.length <= maxLength 
        ? text 
        : `${text.substring(0, maxLength)}...`;
    };
    
    return {
      isHovered,
      imageSource,
      isFavorited,
      isAuthenticated,
      currentCurrency,
      handleImageError,
      toggleFavorite,
      navigateToDetails,
      truncateDescription
    };
  }
};
</script>

<style scoped>
.book-card {
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.book-card.is-horizontal {
  flex-direction: row;
}

.book-card.is-horizontal .book-cover {
  width: 180px;
  min-width: 180px;
  height: 240px;
}

.book-card.is-horizontal .book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.book-cover:hover img {
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.free-badge {
  background-color: #27ae60;
  color: #fff;
}

.book-info {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-author {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
  margin-top: auto;
}


.free-text {
  color: #27ae60;
}

.book-description {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.book-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.book-actions.show {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
}

.action-btn:hover {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.favorite-btn {
  color: #e74c3c;
  background-color: rgba(255, 255, 255, 0.9);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.favorite-btn.is-favorited {
  background-color: #e74c3c;
  color: #fff;
}

.favorite-btn i {
  font-size: 16px;
}

.details-btn {
  color: #3498db;
}

.hover-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
  padding: 16px;
}

.book-categories {
  margin-bottom: 8px;
}

.category {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}

.book-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .book-card.is-horizontal {
    flex-direction: column;
  }
  
  .book-card.is-horizontal .book-cover {
    width: 100%;
    height: 200px;
  }
}
</style> 