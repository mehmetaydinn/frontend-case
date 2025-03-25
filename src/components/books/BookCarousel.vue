<template>
  <div class="book-carousel">
    <div class="carousel-header">
      <h2 v-if="title" class="carousel-title">{{ title }}</h2>
      <div class="carousel-controls">
        <button 
          class="control-btn prev-btn" 
          @click="prevSlide"
          :disabled="isAnimating"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="carousel-indicators">
          <button 
            v-for="(_, index) in slides" 
            :key="index"
            class="indicator" 
            :class="{ 'active': activeIndex === index }"
            @click="goToSlide(index)"
          ></button>
        </div>
        <button 
          class="control-btn next-btn" 
          @click="nextSlide"
          :disabled="isAnimating"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <div 
      class="carousel-container" 
      ref="carouselContainer"
      @mouseenter="autoplayEnabled && pauseAutoplay()"
      @mouseleave="autoplayEnabled && resumeAutoplay()"
    >
      <div 
        class="carousel-track"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          class="carousel-slide"
          @click="navigateToDetails(slide.id)"
        >
          <div class="slide-content">
            <div class="slide-image">
              <img 
                :src="slide.coverImage || 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fbookstoreromanceday.org%2Fbook-cover-placeholder%2F&psig=AOvVaw035xbyCXp9aMOMHp3Z9Rwg&ust=1742594455747000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCKD7-qzUmYwDFQAAAAAdAAAAABAE'" 
                :alt="slide.title"
                loading="lazy"
              >
            </div>
            <div class="slide-info">
              <h3 class="slide-title">{{ slide.title }}</h3>
              <p class="slide-author">{{ slide.author }}</p>
              
              <div v-if="slide.description" class="slide-description">
                <p>{{ truncateText(slide.description, 200) }}</p>
              </div>
              
              <div class="slide-meta">
                <span v-if="slide.category" class="meta-item">
                  <i class="fas fa-bookmark"></i> {{ slide.category }}
                </span>
                <span v-if="slide.publishedYear" class="meta-item">
                  <i class="fas fa-calendar"></i> {{ slide.publishedYear }}
                </span>
                <span v-if="slide.pageCount" class="meta-item">
                  <i class="fas fa-book"></i> {{ slide.pageCount }} sayfa
                </span>
              </div>
              
              <div class="slide-actions">
                <p class="slide-price" v-if="!slide.isFree && slide.price">
                  <span v-currency="{ amount: slide.price.amount, currency: selectedCurrency || slide.price.currency }"></span>
                </p>
                <p class="slide-price free-text" v-else-if="slide.isFree">
                  Ücretsiz
                </p>
                
                <div class="slide-buttons">
                  <button 
                    class="btn-action favorite-btn" 
                    :class="{ 'is-favorited': isBookFavorited(slide.id) }"
                    @click="toggleFavorite(slide.id)"
                    v-if="isAuthenticated"
                  >
                    <i class="fas" :class="isBookFavorited(slide.id) ? 'fa-heart' : 'fa-heart'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'BookCarousel',
  props: {
    books: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    
    const carouselContainer = ref(null);
    const activeIndex = ref(0);
    const isAnimating = ref(false);
    const autoplayTimer = ref(null);
    const autoplayEnabled = ref(props.autoplay);
    
    // Slaytlar
    const slides = computed(() => props.books);
    
    // Kullanıcı durumu
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const currentUser = computed(() => store.getters['user/currentUser']);
    
    // Seçili para birimi
    const selectedCurrency = computed(() => store.getters['currency/selectedCurrency']);
    
    // Kitap favoride mi kontrolü
    const isBookFavorited = (bookId) => {
      if (!isAuthenticated.value || !currentUser.value) return false;
      return store.getters['favorites/isBookFavorited'](currentUser.value, bookId);
    };
    
    // Favorilere ekle/çıkar
    const toggleFavorite = async (bookId) => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        await store.dispatch('favorites/toggleFavorite', {
          userId: currentUser.value,
          bookId
        });
        
        // Bildirim göster
        const message = isBookFavorited(bookId) 
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
    const navigateToDetails = (bookId) => {
      router.push(`/books/${bookId}`);
    };
    
    // Slayt değiştirme fonksiyonları
    const goToSlide = (index) => {
      if (isAnimating.value) return;
      
      isAnimating.value = true;
      activeIndex.value = index;
      
      setTimeout(() => {
        isAnimating.value = false;
      }, 500); // Transition süresi kadar bekle
    };
    
    const nextSlide = () => {
      goToSlide((activeIndex.value + 1) % slides.value.length);
    };
    
    const prevSlide = () => {
      goToSlide((activeIndex.value - 1 + slides.value.length) % slides.value.length);
    };
    
    // Otomatik slayt değiştirme
    const startAutoplay = () => {
      if (!autoplayEnabled.value) return;
      
      autoplayTimer.value = setInterval(() => {
        nextSlide();
      }, props.interval);
    };
    
    const pauseAutoplay = () => {
      clearInterval(autoplayTimer.value);
    };
    
    const resumeAutoplay = () => {
      pauseAutoplay();
      startAutoplay();
    };
    
    // Metni kısaltma
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length <= maxLength 
        ? text 
        : `${text.substring(0, maxLength)}...`;
    };
    
    // Lifecycle hooks
    onMounted(() => {
      startAutoplay();
    });
    
    onUnmounted(() => {
      pauseAutoplay();
    });
    
    // autoplay prop değiştiğinde kontrolü güncelle
    watch(() => props.autoplay, (newValue) => {
      autoplayEnabled.value = newValue;
      pauseAutoplay();
      if (newValue) {
        startAutoplay();
      }
    });
    
    return {
      carouselContainer,
      activeIndex,
      isAnimating,
      slides,
      isAuthenticated,
      selectedCurrency,
      isBookFavorited,
      toggleFavorite,
      navigateToDetails,
      goToSlide,
      nextSlide,
      prevSlide,
      pauseAutoplay,
      resumeAutoplay,
      truncateText,
      autoplayEnabled
    };
  }
};
</script>

<style scoped>
.book-carousel {
  position: relative;
  margin-bottom: 30px;
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.carousel-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.carousel-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: var(--box-shadow-sm);
}

.control-btn:hover {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-indicators {
  display: flex;
  gap: 8px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator:hover {
  background-color: #bdbdbd;
}

.indicator.active {
  background-color: #3498db;
  transform: scale(1.2);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: var(--box-shadow-md);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  max-width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.carousel-slide:hover {
  transform: scale(1.01);
}

.slide-content {
  display: flex;
  height: 400px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.slide-image {
  flex: 0 0 40%;
  max-width: 40%;
  position: relative;
}

.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-info {
  flex: 0 0 60%;
  max-width: 60%;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.slide-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text-color);
}

.slide-author {
  font-size: 18px;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 20px;
}

.slide-description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: var(--text-color);
  opacity: 0.9;
  flex-grow: 1;
}

.slide-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  opacity: 0.8;
  font-size: 14px;
}

.slide-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.slide-price {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.free-text {
  color: #27ae60;
}

.slide-buttons {
  display: flex;
  gap: 16px;
}

.btn-action {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.details-btn {
  background-color: #3498db;
  color: #fff;
  border: none;
}

.details-btn:hover {
  background-color: #2980b9;
}

.favorite-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  color: #e74c3c;
  border: 1px solid var(--border-color);
  font-size: 18px;
}

.favorite-btn:hover {
  background-color: var(--hover-color);
  box-shadow: var(--box-shadow-sm);
}

.favorite-btn.is-favorited {
  background-color: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}

@media (max-width: 992px) {
  .slide-content {
    flex-direction: column;
    height: auto;
  }
  
  .slide-image, .slide-info {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .slide-image {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .carousel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .slide-info {
    padding: 20px;
  }
  
  .slide-title {
    font-size: 22px;
  }
  
  .slide-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 576px) {
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .slide-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 