<template>
  <div class="profile-page">
    <div v-if="pageLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Profil bilgileriniz yükleniyor...</p>
    </div>
    
    <div v-else-if="pageError" class="profile-error">
      {{ pageError }}
      <button @click="reloadPage" class="retry-button">Tekrar Dene</button>
    </div>
    
    <div v-else class="profile-container">
      <h1 class="profile-title">Kullanıcı Profili</h1>
      
      <div v-if="error" class="profile-error">
        {{ error }}
      </div>
      
      <div v-if="success" class="profile-success">
        Profiliniz başarıyla güncellendi.
      </div>
      
      <!-- İstatistikler özeti -->
      <div class="user-stats-summary">
        <div class="avatar-container">
          <div class="avatar">
            {{ userInitials }}
          </div>
        </div>
        
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">{{ userBooks.length }}</span>
            <span class="stat-label">Kitaplarım</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ favorites.length }}</span>
            <span class="stat-label">Favorilerim</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ comments.length }}</span>
            <span class="stat-label">Yorumlarım</span>
          </div>
          
        </div>
      </div>
      
      <!-- Sekmeler -->
      <div class="profile-tabs">
        <div class="tabs-header">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-button"
            :class="{ 'active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Profil Bilgileri Sekmesi -->
          <div v-if="activeTab === 'profile'" class="profile-content">
            <form @submit.prevent="submitForm" class="profile-form">
              <div class="form-group">
                <label for="name">Ad Soyad</label>
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  placeholder="Ad ve soyadınız"
                  :class="{ 'error': v$.name.$error }"
                  @blur="v$.name.$touch()"
                />
                <div v-if="v$.name.$error" class="error-message">
                  {{ v$.name.$errors[0].$message }}
                </div>
              </div>
              
              <div class="form-group">
                <label for="email">E-posta</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  disabled
                />
                <div class="help-text">E-posta adresiniz değiştirilemez.</div>
              </div>
              
              <div class="form-actions">
                <button type="button" @click="showPasswordModal = true" class="secondary-button">
                  Şifre Değiştir
                </button>
                <button type="submit" class="primary-button" :disabled="isLoading || !formChanged">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Favoriler Sekmesi -->
          <div v-else-if="activeTab === 'favorites'" class="favorites-list">
            <h2>Favori Kitaplarım</h2>
            <div v-if="favorites.length === 0" class="empty-state">
              <p>Henüz favori kitabınız bulunmuyor.</p>
            </div>
            <div v-else class="books-grid">
              <BookCard
                v-for="book in favorites"
                :key="book.id"
                :book="book"
                viewMode="grid"
              />
            </div>
          </div>

          <!-- Kitaplarım Sekmesi -->
          <div v-else-if="activeTab === 'books'" class="my-books-list">
            <h2>Eklediğim Kitaplar</h2>
            <div v-if="userBooks.length === 0" class="empty-state">
              <p>Henüz eklediğiniz kitap bulunmuyor.</p>
            </div>
            <div v-else class="books-grid">
              <BookCard
                v-for="book in userBooks"
                :key="book.id"
                :book="book"
                viewMode="grid"
              />
            </div>
          </div>

          <!-- Yorumlarım Sekmesi -->
          <div v-else-if="activeTab === 'comments'" class="comments-list">
            <h2>Kitap Yorumlarım</h2>
            <div v-if="comments.length === 0" class="empty-state">
              <p>Henüz yorum yapmadınız.</p>
            </div>
            <div v-else>
              <div v-for="comment in comments" :key="comment.id" class="comment-card">
                <div class="comment-book">
                  <strong>{{ getBookTitle(comment.bookId) }}</strong>
                </div>
                <div class="comment-rating">
                  <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= comment.rating }">★</span>
                </div>
                <div class="comment-text">
                  {{ comment.text }}
                </div>
                <div class="comment-date">
                  {{ formatDate(comment.createdAt) }}
                </div>
                <div class="comment-actions">
                  <router-link :to="`/books/${comment.bookId}`" class="btn-view">Kitaba Git</router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- İstatistikler Sekmesi -->
          <div v-else-if="activeTab === 'stats'" class="user-statistics">
            <h2>Okuma İstatistiklerim</h2>
            
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Favori Kategorilerim</h3>
                <div v-if="favoriteCategories.length === 0" class="empty-state">
                  <p>Henüz kategori verisi bulunmuyor.</p>
                </div>
                <ul v-else class="category-list">
                  <li v-for="(category, index) in favoriteCategories" :key="index">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-count">{{ category.count }} kitap</span>
                  </li>
                </ul>
              </div>
              
              <div class="stat-card">
                <h3>Toplam Değerlendirmelerim</h3>
                <div class="total-ratings">
                  <div class="rating-summary">
                    <span class="rating-avg">{{ averageRating }}</span>
                    <div class="stars">
                      <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= Math.round(averageRating) }">★</span>
                    </div>
                    <span class="rating-count">{{ comments.length }} değerlendirme</span>
                  </div>
                </div>
              </div>

              <div class="stat-card">
                <h3>Kitap Kütüphanem</h3>
                <div class="interaction-stats">
                  <div class="interaction-item">
                    <span class="interaction-label">Toplam Kitap</span>
                    <span class="interaction-value">{{ userBooks.length }}</span>
                  </div>
                  <div class="interaction-item">
                    <span class="interaction-label">Favoriler</span>
                    <span class="interaction-value">{{ favorites.length }}</span>
                  </div>
                  <div class="interaction-item" v-if="userBooks.length > 0">
                    <span class="interaction-label">Favori Oranı</span>
                    <span class="interaction-value">%{{ Math.round((favorites.length / userBooks.length) * 100) }}</span>
                  </div>
                  <div class="interaction-item">
                    <span class="interaction-label">Son Eklenen</span>
                    <span class="interaction-value">{{ getLastAddedBookDate() }}</span>
                  </div>
                </div>
              </div>

              <div class="stat-card">
                <h3>Dil Dağılımı</h3>
                <div v-if="languageDistribution.length === 0" class="empty-state">
                  <p>Henüz dil verisi bulunmuyor.</p>
                </div>
                <ul v-else class="category-list">
                  <li v-for="(lang, index) in languageDistribution" :key="index">
                    <span class="category-name">{{ lang.name || 'Belirtilmemiş' }}</span>
                    <span class="category-count">{{ lang.count }} kitap</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Şifre değiştirme modal -->
      <div v-if="showPasswordModal" class="password-modal">
        <div class="modal-content">
          <h2>Şifre Değiştir</h2>
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label for="currentPassword">Mevcut Şifre</label>
              <input
                id="currentPassword"
                v-model="currentPassword"
                type="password"
                placeholder="Mevcut şifreniz"
                :class="{ 'error': passwordV$.currentPassword.$error }"
                @blur="passwordV$.currentPassword.$touch()"
              />
              <div v-if="passwordV$.currentPassword.$error" class="error-message">
                {{ passwordV$.currentPassword.$errors[0].$message }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="newPassword">Yeni Şifre</label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                placeholder="Yeni şifreniz"
                :class="{ 'error': passwordV$.newPassword.$error }"
                @blur="passwordV$.newPassword.$touch()"
              />
              <div v-if="passwordV$.newPassword.$error" class="error-message">
                {{ passwordV$.newPassword.$errors[0].$message }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
              <input
                id="confirmNewPassword"
                v-model="confirmNewPassword"
                type="password"
                placeholder="Yeni şifrenizi tekrar girin"
                :class="{ 'error': passwordV$.confirmNewPassword.$error }"
                @blur="passwordV$.confirmNewPassword.$touch()"
              />
              <div v-if="passwordV$.confirmNewPassword.$error" class="error-message">
                {{ passwordV$.confirmNewPassword.$errors[0].$message }}
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="showPasswordModal = false" class="secondary-button">
                İptal
              </button>
              <button type="submit" class="primary-button" :disabled="passwordIsLoading">
                {{ passwordIsLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, sameAs, helpers } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import BookCard from '@/components/books/BookCard.vue';

export default {
  name: 'UserProfilePage',
  components: {
    BookCard
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const pageLoading = ref(true);
    const pageError = ref(null);
    
    // Aktif sekme
    const activeTab = ref('profile');
    const tabs = [
      { id: 'profile', label: 'Profil Bilgilerim' },
      { id: 'favorites', label: 'Favorilerim' },
      { id: 'books', label: 'Kitaplarım' },
      { id: 'comments', label: 'Yorumlarım' },
      { id: 'stats', label: 'İstatistiklerim' }
    ];
    
    // Kullanıcı bilgileri
    const user = computed(() => store.getters['user/currentUser']);
    const userBooks = computed(() => store.getters['books/userBooks'] || []);
    const favorites = computed(() => {
      const currentUser = store.getters['user/currentUser'];
      if (!currentUser) return [];
      
      return store.getters['favorites/getFavoriteBooks'](currentUser) || [];
    });
    const comments = computed(() => {
      const currentUser = store.getters['user/currentUser'];
      if (!currentUser) return [];
      
      // Tüm yorumları al
      const allComments = Object.values(store.state.comments.comments).flat();
      
      // Kullanıcının yorumlarını filtrele
      // userid bir string veya obje olabilir, her iki durumu da kontrol et
      const userComments = allComments.filter(comment => {
        if (!comment || !comment.userId) return false;
        
        // Eğer userId bir obje ise (kullanıcı objesi)
        if (typeof comment.userId === 'object' && comment.userId.id) {
          return comment.userId.id === currentUser.id;
        }
        
        // Direkt ID karşılaştırması (string veya number olabilir)
        return String(comment.userId) === String(currentUser.id);
      });
      
      
      return userComments;
    });
    
    // Form verileri
    const name = ref('');
    const email = ref('');
    const success = ref(false);
    const originalName = ref('');
    
    // Şifre değiştirme modalı
    const showPasswordModal = ref(false);
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmNewPassword = ref('');
    const passwordIsLoading = ref(false);
    
    // Form değişikliği kontrolü
    const formChanged = computed(() => {
      return name.value !== originalName.value;
    });
    
    // Durum
    const isLoading = computed(() => store.getters['user/isLoading']);
    const error = computed(() => store.getters['user/error']);
    const userInitials = computed(() => {
      if (!name.value) return '';
      
      return name.value
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    });
    
    // Kitabın başlığını getir
    const getBookTitle = (bookId) => {
      const book = store.getters['books/bookById'](bookId);
      return book ? book.title : 'Bilinmeyen Kitap';
    };
    
    // Tarih formatlama
    const formatDate = (dateString) => {
      if (!dateString) return 'Belirtilmemiş';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    };
    
    // Favori kategorileri hesapla
    const favoriteCategories = computed(() => {
      const books = [...userBooks.value, ...favorites.value];
      
      // Kategori sayılarını hesapla
      const categoryCounts = {};
      books.forEach(book => {
        if (book.category) {
          categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
        }
      });
      
      // Kategori adı ve sayısı içeren diziye dönüştür
      return Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count) // En çok kitabı olan kategoriler başta
        .slice(0, 5); // İlk 5 kategori
    });
    
    // Dil dağılımını hesapla 
    const languageDistribution = computed(() => {
      const books = [...userBooks.value, ...favorites.value];
      
      // Dil sayılarını hesapla
      const languageCounts = {};
      books.forEach(book => {
        if (book.language) {
          languageCounts[book.language] = (languageCounts[book.language] || 0) + 1;
        } else {
          languageCounts['Belirtilmemiş'] = (languageCounts['Belirtilmemiş'] || 0) + 1;
        }
      });
      
      // Dil adı ve sayısı içeren diziye dönüştür
      return Object.entries(languageCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count); // En çok kullanılan diller başta
    });
    
    // Son eklenen kitabın tarihini getir
    const getLastAddedBookDate = () => {
      if (userBooks.value.length === 0) return 'Henüz kitap eklenmemiş';
      
      // Kitapları ekleme tarihine göre sırala (en yeni en başta)
      const sortedBooks = [...userBooks.value].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      
      // En son eklenen kitabın tarihini formatla
      if (sortedBooks[0] && sortedBooks[0].createdAt) {
        return formatDate(sortedBooks[0].createdAt);
      }
      
      return 'Tarih bilgisi yok';
    };
    
    // Ortalama derecelendirme
    const averageRating = computed(() => {
      if (comments.value.length === 0) return 0;
      
      const totalRating = comments.value.reduce((sum, comment) => sum + comment.rating, 0);
      return (totalRating / comments.value.length).toFixed(1);
    });
    
    // Sayfa yüklendiğinde verileri doldur
    onMounted(async () => {
      try {
        pageLoading.value = true;
        
        // Kullanıcı oturum açmış mı kontrol et
        const isLoggedIn = store.getters['user/isAuthenticated'];
        
        if (!isLoggedIn) {
          // Oturum açılmamışsa, giriş sayfasına yönlendir
          router.push('/login?redirect=/profile');
          return;
        }
        
        // Kullanıcının tüm verilerini getir
        await Promise.all([
          store.dispatch('user/fetchCurrentUser'),
          store.dispatch('books/fetchBooks'), // Tüm kitapları yükle
          store.dispatch('favorites/fetchFavorites')
        ]);
        
        // Kullanıcı bilgileri geldiğinde kitaplarını ve yorumlarını yükle
        if (user.value) {
          name.value = user.value.name;
          email.value = user.value.email;
          originalName.value = user.value.name;
          
          // Kullanıcının kitaplarını yükle
          await store.dispatch('user/fetchUserBooks', user.value.id);
          
          // Tüm kitapların yorumlarını yükle ki kullanıcının yorumlarını bulabilelim
          const allBooks = store.getters['books/allBooks'];
          const loadCommentPromises = allBooks.map(book => 
            store.dispatch('comments/fetchBookComments', book.id)
          );
          
          await Promise.all(loadCommentPromises);
        }
      } catch (err) {
        pageError.value = 'Profil bilgileriniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      } finally {
        pageLoading.value = false;
      }
    });
    
    // Form doğrulama
    const rules = {
      name: { required: helpers.withMessage('Ad Soyad alanı zorunludur', required) },
      email: { 
        required: helpers.withMessage('E-posta alanı zorunludur', required), 
        email: helpers.withMessage('Geçerli bir e-posta adresi giriniz', email) 
      }
    };
    
    const v$ = useVuelidate(rules, { name, email });
    
    // Şifre formu doğrulama
    const passwordRules = {
      currentPassword: { 
        required: helpers.withMessage('Mevcut şifre zorunludur', required) 
      },
      newPassword: { 
        required: helpers.withMessage('Yeni şifre zorunludur', required),
        minLength: helpers.withMessage('Şifre en az 6 karakter olmalıdır', minLength(6))
      },
      confirmNewPassword: { 
        required: helpers.withMessage('Şifre tekrarı zorunludur', required),
        sameAsPassword: helpers.withMessage('Şifreler eşleşmiyor', sameAs(newPassword))
      }
    };
    
    const passwordV$ = useVuelidate(passwordRules, { currentPassword, newPassword, confirmNewPassword });
    
    // Profil formunu gönderme
    const submitForm = async () => {
      const isFormValid = await v$.value.$validate();
      
      if (isFormValid) {
        try {
          // API çağrısı simülasyonu
          success.value = false;
          
          await store.dispatch('user/updateProfile', {
            id: user.value.id,
            name: name.value
          });
          
          success.value = true;
          originalName.value = name.value;
          
          // Bildirim göster
          store.dispatch('ui/showNotification', {
            message: 'Profiliniz başarıyla güncellendi',
            type: 'success'
          });
          
          // 3 saniye sonra başarı mesajını gizle
          setTimeout(() => {
            success.value = false;
          }, 3000);
        } catch (err) {
        }
      }
    };
    
    // Şifre değiştirme
    const changePassword = async () => {
      const isFormValid = await passwordV$.value.$validate();
      
      if (isFormValid) {
        try {
          passwordIsLoading.value = true;
          
          // Simüle edilmiş şifre doğrulama
          if (currentPassword.value !== 'password123') {
            store.dispatch('ui/showNotification', {
              message: 'Mevcut şifreniz yanlış',
              type: 'error'
            });
            passwordIsLoading.value = false;
            return;
          }
          
          // Gerçek bir API çağrısı yerine simülasyon
          setTimeout(() => {
            passwordIsLoading.value = false;
            showPasswordModal.value = false;
            
            // Form temizleme
            currentPassword.value = '';
            newPassword.value = '';
            confirmNewPassword.value = '';
            
            // Bildirim göster
            store.dispatch('ui/showNotification', {
              message: 'Şifreniz başarıyla değiştirildi',
              type: 'success'
            });
          }, 1500);
        } catch (err) {
          passwordIsLoading.value = false;
        }
      }
    };
    
    const reloadPage = () => {
      window.location.reload();
    };
    
    return {
      user,
      userBooks,
      favorites,
      comments,
      name,
      email,
      success,
      isLoading,
      error,
      userInitials,
      formChanged,
      v$,
      submitForm,
      showPasswordModal,
      currentPassword,
      newPassword,
      confirmNewPassword,
      passwordIsLoading,
      passwordV$,
      changePassword,
      pageLoading,
      pageError,
      reloadPage,
      activeTab,
      tabs,
      favoriteCategories,
      averageRating,
      getBookTitle,
      formatDate,
      getLastAddedBookDate,
      languageDistribution
    };
  }
};
</script>

<style scoped>
.profile-page {
  padding: var(--spacing-lg) 0;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-md);
  padding: var(--spacing-xl);
}

.profile-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary);
}

.profile-error {
  background-color: var(--color-danger);
  color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.profile-success {
  background-color: var(--color-secondary);
  color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

/* İstatistik özeti bölümü */
.user-stats-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-light-grey);
}

.avatar-container {
  margin-bottom: var(--spacing-md);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: bold;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-grey);
}

/* Sekme bölümü */
.profile-tabs {
  margin-top: var(--spacing-lg);
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--color-light-grey);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--color-primary);
}

.tab-button.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.dark-theme .tab-button.active {
  color: var(--color-white);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 3px 3px 0 0;
}

.tab-content {
  min-height: 300px;
}

/* Form stilleri */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.profile-form {
  margin-top: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.form-group input:disabled {
  background-color: var(--bg-color);
  opacity: 0.7;
}

.form-group input.error {
  border-color: var(--color-danger);
}

.help-text {
  font-size: var(--font-size-small);
  color: var(--color-grey);
  margin-top: var(--spacing-xs);
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-small);
  margin-top: var(--spacing-xs);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

/* Kitap kartları stilleri */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

/* Eski kitap kartı stillerini kaldır */
/* .book-card, .book-cover, .book-info vb. stilleri kaldır */

/* Yorum kartları stilleri */
.comments-list {
  margin-top: var(--spacing-md);
}

.comment-card {
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.comment-book {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xs);
  color: var(--color-primary);
}

.comment-rating {
  margin-bottom: var(--spacing-xs);
}

.star {
  color: #e0e0e0;
  font-size: 18px;
}

.star.filled {
  color: #FFD700;
}

.comment-text {
  font-size: var(--font-size-base);
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.comment-date {
  font-size: var(--font-size-small);
  color: var(--color-grey);
  margin-bottom: var(--spacing-sm);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-view {
  background-color: var(--color-light-grey);
  color: var(--color-dark);
}

.btn-view:hover {
  background-color: var(--color-grey);
  color: var(--color-white);
}

/* İstatistikler stilleri */
.user-statistics h2 {
  margin-bottom: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  box-shadow: var(--box-shadow-sm);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.stat-card h3 {
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-size: var(--font-size-md);
  border-bottom: 1px solid var(--color-light-grey);
  padding-bottom: var(--spacing-xs);
}

.category-list {
  list-style: none;
  padding: 0;
}

.category-list li {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--border-color);
}

.category-list li:last-child {
  border-bottom: none;
}

.category-name {
  font-weight: 500;
}

.category-count {
  color: var(--color-primary);
  font-weight: 500;
}

.total-ratings {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.rating-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-avg {
  font-size: var(--font-size-xxl);
  font-weight: bold;
  color: var(--color-primary);
}

.rating-count {
  font-size: var(--font-size-small);
  color: var(--color-grey);
  margin-top: var(--spacing-xs);
}

.interaction-stats {
  padding: var(--spacing-xs) 0;
}

.interaction-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--border-color);
}

.interaction-item:last-child {
  border-bottom: none;
}

.interaction-label {
  font-weight: 500;
}

.interaction-value {
  color: var(--color-primary);
  font-weight: 500;
}

/* Boş durum mesajı */
.empty-state {
  padding: var(--spacing-lg);
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
  text-align: center;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

/* Modal stilleri */
.password-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-lg);
  width: 90%;
  max-width: 500px;
  padding: var(--spacing-lg);
  color: var(--text-color);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.primary-button, .secondary-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.primary-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.primary-button:hover:not(:disabled) {
  background-color: #2980b9; /* 10% daha koyu */
}

.primary-button:disabled {
  background-color: var(--color-grey);
  cursor: not-allowed;
}

.secondary-button {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.secondary-button:hover {
  background-color: var(--color-light-grey);
}

/* Yükleme animasyonu */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Duyarlı tasarım */
@media (min-width: 768px) {
  .user-stats-summary {
    flex-direction: row;
    justify-content: center;
  }
  
  .avatar-container {
    margin-right: var(--spacing-lg);
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--spacing-md);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .password-modal {
    width: 95%;
    padding: var(--spacing-md);
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .user-stats {
    gap: var(--spacing-md);
  }
  
  .stat-item {
    min-width: 70px;
  }
}
</style> 