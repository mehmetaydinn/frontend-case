<template>
  <div class="book-detail" v-if="book">
    <div class="container">
      <div class="book-header">
        <div class="book-cover">
          <img :src="book.coverImage || 'https://dummyimage.com/200x300/e0e0e0/ffffff&text=Kitap+Kapağı'" :alt="book.title">
          <span v-if="book.isFree" class="free-badge">Ücretsiz</span>
        </div>
        <div class="book-info">
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author">{{ book.author }}</p>
          
          <div class="book-meta">
            <div class="meta-item">
              <span class="label">Kategori:</span>
              <span class="value">{{ book.category || 'Belirtilmemiş' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Dil:</span>
              <span class="value">{{ book.language || 'Belirtilmemiş' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Yayın Yılı:</span>
              <span class="value">{{ book.publishedYear || 'Belirtilmemiş' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Sayfa Sayısı:</span>
              <span class="value">{{ book.pageCount || 'Belirtilmemiş' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">ISBN:</span>
              <span class="value">{{ book.isbn || 'Belirtilmemiş' }}</span>
            </div>
          </div>
          
          <div class="book-price" v-if="!book.isFree">
            <span class="price" v-currency="{ amount: book.price.amount, currency: book.price.currency }"></span>
            <span class="original-currency">({{ book.price.currency }})</span>
          </div>
          
          <div class="book-actions">
            <button 
              @click="toggleFavorite" 
              class="btn-favorite" 
              :class="{ 'is-favorited': isFavorited }"
              v-if="isAuthenticated"
            >
              <i class="fas" :class="isFavorited ? 'fa-heart' : 'fa-heart'"></i>
              <span>{{ isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle' }}</span>
            </button>
            
            <router-link 
              :to="`/books/${book.id}/edit`" 
              class="btn-edit" 
              v-if="isAuthenticated && isOwner"
            >
              <i class="fas fa-edit"></i>
              <span>Düzenle</span>
            </router-link>
            
            <button 
              @click="confirmDelete" 
              class="btn-delete" 
              v-if="isAuthenticated && isOwner"
            >
              <i class="fas fa-trash"></i>
              <span>Sil</span>
            </button>
          </div>
          
          <div class="social-share">
            <h3>Paylaş</h3>
            <div class="share-buttons">
              <button @click="shareOnFacebook" class="share-btn facebook">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button @click="shareOnTwitter" class="share-btn twitter">
                <i class="fab fa-twitter"></i>
              </button>
              <button @click="shareOnLinkedIn" class="share-btn linkedin">
                <i class="fab fa-linkedin-in"></i>
              </button>
              <button @click="shareOnWhatsApp" class="share-btn whatsapp">
                <i class="fab fa-whatsapp"></i>
              </button>
              <button @click="copyLink" class="share-btn copy-link">
                <i class="fas fa-link"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="book-content">
        <div class="book-description">
          <h2>Açıklama</h2>
          <div v-if="book.description" v-html="book.description" class="description-content"></div>
          <p v-else class="no-data">Açıklama bulunamadı</p>
        </div>
        
        <div class="book-tags" v-if="book.tags && book.tags.length > 0">
          <h2>Etiketler</h2>
          <div class="tags-list">
            <span v-for="(tag, index) in book.tags" :key="index" class="tag">
              <i class="fas fa-tag"></i>
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- İlgili Kitaplar Bölümü -->
      <div class="related-books" v-if="relatedBooks.length > 0">
        <h2>İlgili Kitaplar</h2>
        <div class="related-books-grid">
          <BookCard
            v-for="book in relatedBooks"
            :key="book.id"
            :book="book"
            viewMode="grid"
          />
        </div>
      </div>
      
      <!-- Yorum Bölümü -->
      <div class="comments-section">
        <h2>Yorumlar</h2>
        
        <!-- Yorum Ekleme Formu -->
        <div class="add-comment" v-if="isAuthenticated">
          <h3>Yorum Ekle</h3>
          <div class="comment-form">
            <div class="rating-input">
              <span>Puanınız:</span>
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star"
                  :class="{ 
                    'filled': star <= newRating, 
                    'hover': star <= hoverRating && star > newRating 
                  }"
                  @click="setRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >★</span>
              </div>
              <span class="rating-text" v-if="newRating">{{ newRating }} / 5</span>
            </div>
            <textarea 
              v-model="newComment" 
              placeholder="Yorumunuzu girin..." 
              rows="4"
            ></textarea>
            <div class="comment-actions">
              <button v-if="isEditing" @click="cancelEdit" class="btn-cancel">
                <i class="fas fa-times"></i>
                İptal
              </button>
              <button 
                @click="submitComment" 
                class="btn-submit-comment" 
                :disabled="!newComment || !newRating"
              >
                <i class="fas" :class="isEditing ? 'fa-check' : 'fa-paper-plane'"></i>
                {{ isEditing ? 'Güncelle' : 'Gönder' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Filtreleme Bölümü -->
        <div class="comment-filters" v-if="comments && comments.length > 0">
          <div class="filter-row">
            <div class="filter-group">
              <label for="rating-filter">Puanlama:</label>
              <select id="rating-filter" v-model="filterRating" class="filter-select">
                <option value="0">Tümü</option>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız ve üzeri</option>
                <option value="3">3 Yıldız ve üzeri</option>
                <option value="2">2 Yıldız ve üzeri</option>
                <option value="1">1 Yıldız ve üzeri</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="sort-filter">Sıralama:</label>
              <select id="sort-filter" v-model="sortBy" class="filter-select">
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="highest">En Yüksek Puan</option>
                <option value="lowest">En Düşük Puan</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="author-filter">Yazar Ara:</label>
              <input 
                type="text" 
                id="author-filter" 
                v-model="authorFilter" 
                placeholder="Yazar adı girin..." 
                class="filter-input"
              >
            </div>
          </div>
        </div>
        
        <div v-if="!comments || !comments.length || filteredComments.length === 0" class="no-comments">
          <p>{{ !comments || !comments.length ? 'Yorum bulunamadı.' : 'Filtreye uygun yorum bulunamadı.' }}</p>
        </div>
        
        <div v-else class="comments-list">
          <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-user">
                <div class="user-avatar">{{ comment.userName.charAt(0) }}</div>
                <span class="comment-author">{{ comment.userName }}</span>
              </div>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="comment-rating">
              <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= comment.rating }">★</span>
            </div>
            <div class="comment-body">
              <p>{{ comment.text }}</p>
            </div>
            <div class="comment-actions" v-if="isAuthenticated && (isAdmin || comment.userId === currentUser?.id)">
              <button @click="editComment(comment)" class="btn-edit-comment">
                <i class="fas fa-edit"></i>
                Düzenle
              </button>
              <button @click="deleteComment(comment.id)" class="btn-delete-comment">
                <i class="fas fa-trash"></i>
                Sil
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="!isAuthenticated" class="login-prompt">
          <p>Yorum yapmak için giriş yapın.</p>
          <router-link to="/login" class="btn-login">
            <i class="fas fa-sign-in-alt"></i>
            Giriş
          </router-link>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <p>Yükleniyor...</p>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import BookCard from '@/components/books/BookCard.vue';

export default {
  name: 'BookDetail',
  components: {
    BookCard
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    
    // Kitap verisi
    const book = computed(() => store.getters['books/selectedBook']);
    
    // Kullanıcı durumu
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const currentUser = computed(() => store.getters['user/currentUser']);
    
    // Yükleme durumu
    const isLoading = computed(() => 
      store.getters['books/isLoading'] || 
      store.getters['comments/isLoading'] || 
      store.getters['favorites/isLoading']
    );
    
    // Hata durumu
    const error = computed(() => 
      store.getters['books/error'] || 
      store.getters['comments/error'] || 
      store.getters['favorites/error']
    );
    
    // Favori durumu
    const isFavorited = computed(() => {
      if (!isAuthenticated.value || !currentUser.value) return false;
      return store.getters['favorites/isBookFavorited'](currentUser.value, props.id);
    });
    
    // Kitabın sahibi mi?
    const isOwner = computed(() => {
      if (!isAuthenticated.value || !currentUser.value || !book.value) return false;
      
      
      // Kitap addedBy null ise veya tanımsızsa
      if (!book.value.addedBy) {
        return false;
      }
      
      // Karşılaştırma yaparken stringe çevir (tip güvenliği için)
      return String(book.value.addedBy) === String(currentUser.value.id);
    });
    
    // İlgili kitaplar
    const relatedBooks = computed(() => {
      if (!book.value) return [];
      return store.getters['books/relatedBooks'](props.id);
    });
    
    // Yorumlar
    const comments = computed(() => store.getters['comments/bookComments'](props.id));
    const newComment = ref('');
    const newRating = ref(0);
    const isEditing = ref(false);
    const editingCommentId = ref(null);
    const hoverRating = ref(0);
    const filterRating = ref(0);
    const sortBy = ref('newest');
    const authorFilter = ref('');
    
    // Sayfa yüklendiğinde verileri getir
    onMounted(async () => {
      // Kitap bilgilerini getir
      await store.dispatch('books/fetchBookById', props.id);
      
      // Yorumları getir
      await store.dispatch('comments/fetchBookComments', props.id);
      
      // Favori durumunu kontrol et
      if (isAuthenticated.value && currentUser.value) {
        await store.dispatch('favorites/fetchUserFavorites', currentUser.value);
      }
    });
    
    // Favorilere ekle/çıkar
    const toggleFavorite = async () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      try {
        await store.dispatch('favorites/toggleFavorite', {
          userId: currentUser.value,
          bookId: props.id
        });
        
        store.dispatch('ui/showNotification', {
          message: isFavorited.value 
          ? 'Kitap favorilere eklendi'
          : 'Kitap favorilerden çıkarıldı',
          type: 'success'
        });
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'İşlem sırasında bir hata oluştu',
          type: 'error'
        });
      }
    };
    
    // Kitabı sil
    const confirmDelete = () => {
      if (confirm('Bu kitabı silmek istediğinize emin misiniz?')) {
        deleteBook();
      }
    };
    
    const deleteBook = async () => {
      try {
        await store.dispatch('books/deleteBook', props.id);
        
        store.dispatch('ui/showNotification', {
          message: 'Kitap başarıyla silindi',
          type: 'success'
        });
        
        router.push('/');
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Kitap silinirken bir hata oluştu',
          type: 'error'
        });
      }
    };
    
    // Yorum gönder/güncelle
    const submitComment = async () => {
      if (!newComment.value || !newRating.value) return;
      
      try {
        if (isEditing.value && editingCommentId.value) {
          // Yorumu güncelle
          await store.dispatch('comments/updateComment', {
            bookId: props.id,
            commentId: editingCommentId.value,
            text: newComment.value,
            rating: newRating.value
          });
          
          store.dispatch('ui/showNotification', {
            message: 'Yorumunuz güncellendi',
            type: 'success'
          });
        } else {
          // Yeni yorum ekle
          await store.dispatch('comments/addComment', {
            bookId: props.id,
            userId: currentUser.value.id,
            userName: currentUser.value.name,
            text: newComment.value,
            rating: newRating.value
          });
          
          store.dispatch('ui/showNotification', {
            message: 'Yorumunuz eklendi',
            type: 'success'
          });
        }
        
        // Form alanlarını temizle
        newComment.value = '';
        newRating.value = 0;
        isEditing.value = false;
        editingCommentId.value = null;
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Yorum eklenirken bir hata oluştu',
          type: 'error'
        });
      }
    };
    
    // Yorumu düzenle
    const editComment = (comment) => {
      newComment.value = comment.text;
      newRating.value = comment.rating;
      isEditing.value = true;
      editingCommentId.value = comment.id;
    };
    
    // Düzenlemeyi iptal et
    const cancelEdit = () => {
      newComment.value = '';
      newRating.value = 0;
      isEditing.value = false;
      editingCommentId.value = null;
    };
    
    // Yorumu sil
    const deleteComment = async (commentId) => {
      if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
        try {
          await store.dispatch('comments/deleteComment', {
            bookId: props.id,
            commentId
          });
          
          store.dispatch('ui/showNotification', {
            message: 'Yorum silindi',
            type: 'success'
          });
        } catch (error) {
          store.dispatch('ui/showNotification', {
            message: 'Yorum silinirken bir hata oluştu',
            type: 'error'
          });
        }
      }
    };
    
    // Yorum sahibi mi?
    const isCommentOwner = (comment) => {
      if (!isAuthenticated.value || !currentUser.value) return false;
      
      // userId string, obje veya başka bir format olabilir
      if (typeof comment.userId === 'object' && comment.userId.id) {
        return String(comment.userId.id) === String(currentUser.value.id);
      }
      
      return String(comment.userId) === String(currentUser.value.id);
    };
    
    // Tarih formatla
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Sosyal medya paylaşım fonksiyonları
    const shareOnFacebook = () => {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(book.value.title);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, '_blank');
    };
    
    const shareOnTwitter = () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${book.value.title} - ${book.value.author}`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };
    
    const shareOnLinkedIn = () => {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(book.value.title);
      const summary = encodeURIComponent(book.value.description?.substring(0, 250) || '');
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, '_blank');
    };
    
    const shareOnWhatsApp = () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${book.value.title} - ${book.value.author}\n${window.location.href}`)}`, '_blank');
    };
    
    const copyLink = () => {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          store.dispatch('ui/showNotification', {
            message: 'Bağlantı kopyalandı',
            type: 'success'
          });
        })
        .catch(err => {
          store.dispatch('ui/showNotification', {
            message: 'Bağlantı kopyalanırken bir hata oluştu',
            type: 'error'
          });
        });
    };
    
    // İlgili kitaba git
    const navigateToBook = (bookId) => {
      // Eğer mevcut kitapsa, sayfayı yeniden yükleme
      if (bookId === props.id) return;
      
      router.push(`/books/${bookId}`);
    };
    
    // Yıldızın tıklanması
    const setRating = (rating) => {
      newRating.value = rating;
    };
    
    // Filtered comments
    const filteredComments = computed(() => {
      // Yorumlar henüz yüklenmemiş, null veya undefined ise boş dizi döndür
      if (!comments.value) {
        return [];
      }
      
      
      // Filtreleme işlemini yaparken güvenli kopya oluştur
      let filtered = [...comments.value];
      
      // Yıldız filtresi
      if (filterRating.value > 0) {
        filtered = filtered.filter(c => c.rating >= filterRating.value);
      }
      
      // Yazar ismi filtresi
      if (authorFilter.value && authorFilter.value.trim() !== '') {
        filtered = filtered.filter(c => c.userName && c.userName.toLowerCase().includes(authorFilter.value.toLowerCase()));
      }
      
      // Sıralama işlemi
      if (filtered.length > 0) {
        if (sortBy.value === 'newest') {
          filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy.value === 'oldest') {
          filtered = filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy.value === 'highest') {
          filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy.value === 'lowest') {
          filtered = filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        }
      }
      
      return filtered;
    });
    
    return {
      book,
      isLoading,
      error,
      isAuthenticated,
      currentUser,
      isFavorited,
      isOwner,
      relatedBooks,
      comments,
      newComment,
      newRating,
      isEditing,
      hoverRating,
      toggleFavorite,
      confirmDelete,
      submitComment,
      editComment,
      cancelEdit,
      deleteComment,
      isCommentOwner,
      formatDate,
      shareOnFacebook,
      shareOnTwitter,
      shareOnLinkedIn,
      shareOnWhatsApp,
      copyLink,
      navigateToBook,
      setRating,
      filteredComments,
      filterRating,
      sortBy,
      authorFilter
    };
  }
};
</script>

<style scoped>
.book-detail {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-color);
  min-height: calc(100vh - var(--header-height));
}

.book-detail .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.book-detail .book-header {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  background-color: var(--bg-color-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--box-shadow-md);
}

.book-detail .book-cover {
  position: relative;
  width: 300px;
  flex-shrink: 0;
}

.book-detail .book-cover img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-lg);
}

.book-detail .free-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background-color: var(--color-success);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-small);
  font-weight: 500;
}

.book-detail .book-info {
  flex: 1;
}

.book-detail .book-title {
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
}

.book-detail .book-author {
  font-size: var(--font-size-lg);
  color: var(--text-color-light);
  margin-bottom: var(--spacing-md);
}

.book-detail .book-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
}

.book-detail .meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.book-detail .meta-item .label {
  font-size: var(--font-size-small);
  color: var(--text-color-light);
}

.book-detail .meta-item .value {
  font-weight: 500;
  color: var(--text-color);
}

.book-detail .book-price {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

.book-detail .book-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.book-detail .btn-favorite {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-detail .btn-favorite i {
  font-size: var(--font-size-lg);
  color: #ff4757;
  transition: transform 0.3s ease;
}

.book-detail .btn-favorite:hover i {
  transform: scale(1.1);
}

.book-detail .btn-favorite.is-favorited {
  background-color: #ff4757;
  color: var(--color-white);
}

.book-detail .btn-favorite.is-favorited i {
  color: var(--color-white);
}

.book-detail .btn-edit,
.book-detail .btn-delete {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
}

.book-detail .btn-edit {
  background-color: var(--color-warning);
  color: var(--color-dark);
  border: none;
}

.book-detail .btn-delete {
  background-color: var(--color-danger);
  color: var(--color-white);
  border: none;
}

.book-detail .book-content {
  margin-bottom: var(--spacing-xl);
}

.book-detail .book-description {
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
}

.book-detail .book-description h2 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.book-detail .description-content {
  color: var(--text-color);
  line-height: 1.6;
}

.book-detail .book-tags {
  margin-bottom: var(--spacing-xl);
}

.book-detail .book-tags h2 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.book-detail .tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.book-detail .tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-full);
  color: var(--text-color);
  font-size: var(--font-size-small);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: default;
}

.book-detail .tag i {
  color: var(--color-primary);
  font-size: var(--font-size-small);
}

.book-detail .related-books {
  margin-bottom: var(--spacing-xl);
}

.book-detail .related-books h2 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.book-detail .related-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.book-detail .comments-section {
  background-color: var(--bg-color);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-detail .comments-section h2 {
  font-size: var(--font-size-xl);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
}

.book-detail .add-comment {
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-xl);
}

.book-detail .add-comment h3 {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.book-detail .comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.book-detail .rating-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background-color: var(--bg-color-secondary);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
}

.book-detail .stars {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
}

.book-detail .star {
  font-size: var(--font-size-xl);
  color: var(--color-grey);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 2px;
}

.book-detail .star.filled {
  color: #ffd700;
}

.book-detail .star:hover {
  transform: scale(1.1);
}

.book-detail textarea {
  width: 100%;
  min-height: 120px;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: var(--font-size-base);
  resize: vertical;
  transition: all 0.3s ease;
}

.book-detail textarea:focus {
  border-color: var(--color-primary);
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  outline: none;
}

.book-detail .comment-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.book-detail .btn-submit-comment,
.book-detail .btn-cancel {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
}

.book-detail .btn-submit-comment {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.book-detail .btn-submit-comment:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.2);
}

.book-detail .btn-submit-comment:disabled {
  background-color: var(--color-grey);
  cursor: not-allowed;
  opacity: 0.7;
}

.book-detail .btn-cancel {
  background-color: var(--color-light-grey);
  color: var(--text-color);
  border: none;
}

.book-detail .btn-cancel:hover {
  background-color: var(--color-grey);
  color: var(--color-white);
}

.book-detail .comment-filters {
  background-color: var(--bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  border: 2px solid var(--border-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.book-detail .filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.book-detail .filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.book-detail .filter-group label {
  font-size: var(--font-size-small);
  color: var(--text-color-light);
}

.book-detail .filter-select,
.book-detail .filter-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.book-detail .filter-select:focus,
.book-detail .filter-input:focus {
  border-color: var(--color-primary);
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
  outline: none;
}

.book-detail .comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.book-detail .comment-item {
  background-color: var(--bg-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-detail .comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.book-detail .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.book-detail .comment-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.book-detail .user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-base);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-detail .comment-author {
  font-weight: 500;
  color: var(--text-color);
}

.book-detail .comment-date {
  font-size: var(--font-size-small);
  color: var(--text-color-light);
}

.book-detail .comment-rating {
  margin: var(--spacing-sm) 0;
}

.book-detail .comment-rating .star {
  color: var(--color-grey);
  font-size: var(--font-size-lg);
}

.book-detail .comment-rating .star.filled {
  color: #ffd700;
}

.book-detail .comment-body {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.book-detail .btn-edit-comment,
.book-detail .btn-delete-comment {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.book-detail .btn-edit-comment {
  background-color: var(--color-warning);
  color: var(--color-dark);
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
}

.book-detail .btn-edit-comment:hover {
  background-color: #ffc107;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.book-detail .btn-delete-comment {
  background-color: var(--color-danger);
  color: var(--color-white);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
}

.book-detail .btn-delete-comment:hover {
  background-color: #dc3545;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

.book-detail .login-prompt {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
}

.book-detail .btn-login {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  margin-top: var(--spacing-md);
  transition: all 0.3s ease;
}

.book-detail .social-share {
  margin-top: var(--spacing-lg);
}

.book-detail .social-share h3 {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.book-detail .share-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.book-detail .share-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-base);
}

.book-detail .share-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.book-detail .share-btn.facebook {
  background-color: #1877f2;
}

.book-detail .share-btn.twitter {
  background-color: #1da1f2;
}

.book-detail .share-btn.linkedin {
  background-color: #0a66c2;
}

.book-detail .share-btn.whatsapp {
  background-color: #25d366;
}

.book-detail .share-btn.copy-link {
  background-color: var(--color-primary);
}

@media (max-width: 768px) {
  .book-detail .book-header {
    flex-direction: column;
  }

  .book-detail .book-cover {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .book-detail .book-actions {
    flex-wrap: wrap;
  }

  .book-detail .btn-favorite,
  .book-detail .btn-edit,
  .book-detail .btn-delete {
    width: 100%;
    justify-content: center;
  }

  .book-detail .rating-input {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .book-detail .container {
    padding: 0 var(--spacing-md);
  }

  .book-detail .book-meta {
    grid-template-columns: 1fr;
  }

  .book-detail .comments-section {
    padding: var(--spacing-md);
  }
}
</style> 