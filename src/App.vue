<template>
  <div class="app" :class="themeClass">
    <Notification
      v-if="notification"
      :message="notification.message"
      :type="notification.type"
    />
    <header class="header">
      <div class="container">
        <div class="header__content">
          <router-link to="/" class="header__logo">Kitap Dünyası Pro</router-link>
          
          <button class="header__menu-toggle" @click="toggleMenu" aria-label="Menüyü aç/kapa">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="header__nav" :class="{ 'header__nav--active': isMenuOpen }">
            <div class="header__nav-links">
              <router-link to="/">Ana Sayfa</router-link>
              <router-link to="/favorites" v-if="isAuthenticated">Favorilerim</router-link>
              <router-link to="/books/new" v-if="isAuthenticated">Kitap Ekle</router-link>
              <template v-if="isAuthenticated">
                <router-link to="/profile">{{ currentUser?.name || 'Profilim' }}</router-link>
                <a href="#" @click.prevent="logout">Çıkış</a>
              </template>
              <template v-else>
                <router-link to="/login">Giriş</router-link>
                <router-link to="/register">Kayıt Ol</router-link>
              </template>
            </div>

            <div class="header__settings">
              
              <button 
                class="theme-toggle" 
                @click="toggleTheme" 
                :aria-label="selectedTheme === 'dark' ? 'Koyu Tema' : 'Açık Tema'"
              >
                <svg v-if="selectedTheme === 'dark'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              <div class="currency-selector">
                <select v-model="selectedCurrency" @change="changeCurrency" class="currency-select">
                  <option value="TRY">₺ TRY</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
                <div class="currency-button">
                  <span class="currency-icon">
                    {{ getCurrencySymbol(selectedCurrency) }}
                  </span>
                  <span class="currency-name">{{ selectedCurrency }}</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="container">
      <div 
        v-if="isRouteChanging" 
        class="route-loading"
      >
        <div class="loading-spinner"></div>
        <p>Sayfa Yükleniyor...</p>
      </div>
      <router-view v-else v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
      
      <div 
        v-if="isLoading" 
        class="global-loading-overlay"
      >
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    </main>
    
    <footer>
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Kitap Dünyası Pro. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Notification from '@/components/common/Notification.vue';

export default {
  name: 'App',
  components: {
    Notification,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const isMenuOpen = ref(false);
    
    const notification = computed(() => store.state.ui.notification);
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const currentUser = computed(() => store.getters['user/currentUser']);
    const selectedCurrency = ref(store.getters['settings/currentCurrency']);
    const selectedTheme = ref(store.getters['settings/currentTheme'] || 'light');
    const isDarkTheme = computed(() => selectedTheme.value === 'dark');
    const isLoading = computed(() => store.state.ui.isLoading);
    const isRouteChanging = ref(false);
    
    const themeClass = computed(() => ({
      'dark-theme': isDarkTheme.value
    }));

    // Tema değişikliğini izle ve uygula
    watch(selectedTheme, (newTheme) => {
      document.documentElement.classList.toggle('dark-theme', newTheme === 'dark');
    }, { immediate: true });

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    // Sayfa değiştiğinde menüyü kapat
    router.beforeEach((to, from, next) => {
      isMenuOpen.value = false;
      isRouteChanging.value = true;
      next();
    });
    
    router.afterEach(() => {
      setTimeout(() => {
        isRouteChanging.value = false;
      }, 500);
    });
    
    // Tema değiştirme
    const toggleTheme = () => {
      const newTheme = selectedTheme.value === 'dark' ? 'light' : 'dark';
      selectedTheme.value = newTheme;
      store.dispatch('settings/setTheme', newTheme);
    };
    
    // Para birimi değiştirme
    const changeCurrency = () => {
      store.dispatch('settings/changeCurrency', selectedCurrency.value);
    };
    
    // Çıkış yap
    const logout = async () => {
      await store.dispatch('user/logout');
      router.push('/login');
    };
    
    const getCurrencySymbol = (currency) => {
      const symbols = {
        TRY: '₺',
        USD: '$',
        EUR: '€',
        GBP: '£'
      };
      return symbols[currency] || currency;
    };

    return {
      notification,
      isAuthenticated,
      currentUser,
      selectedCurrency,
      selectedTheme,
      themeClass,
      isDarkTheme,
      isLoading,
      isRouteChanging,
      changeCurrency,
      logout,
      isMenuOpen,
      toggleMenu,
      toggleTheme,
      getCurrencySymbol
    };
  }
};
</script>

<style>
/* Dark tema için global değişkenler */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --color-primary: #3498db;
  --header-bg: #3498db;
  --border-color: #ddd;
  --hover-bg: rgba(255, 255, 255, 0.1);
}

:root.dark-theme {
  --bg-color: #121212;
  --text-color: #f0f0f0;
  --header-bg: #1e1e1e;
  --color-primary: #f0f0f0;
  --border-color: rgba(255, 255, 255, 0.2);
  --hover-bg: rgba(255, 255, 255, 0.1);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  --header-height: 70px;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.header {
  background-color: var(--header-bg);
  height: var(--header-height);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header > .container{
  height: 100%;
}

.header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header__logo {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-white);
  text-decoration: none;
  z-index: 1001;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header__nav-links {
  display: flex;
  gap: var(--spacing-md);
}

.header__settings {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header__nav a {
  color: var(--color-white);
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.3s ease;
}

.header__nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.header__nav a.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.theme-icon {
  width: 24px;
  height: 24px;
}

.currency-selector {
  position: relative;
  display: inline-block;
}

.currency-button {
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  padding: 0.4rem 0.8rem;
  color: var(--color-white);
  font-weight: 500;
}

.currency-icon {
  margin-right: 5px;
}

.currency-select {
  appearance: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 1.8rem 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  min-width: 120px;
}

.currency-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
}

.currency-select option {
  color: var(--text-color);
  background-color: var(--bg-color);
  padding: 8px;
}

.app.dark-theme .currency-select option {
  background-color: #1e1e1e;
  color: #f0f0f0;
}

.app:not(.dark-theme) .currency-select option {
  background-color: #ffffff;
  color: #333333;
}

.currency-selector::after {
  content: '▼';
  font-size: 0.7rem;
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-white);
}

.header__menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.header__menu-toggle span {
  width: 100%;
  height: 2px;
  background-color: var(--color-white);
  transition: transform 0.3s ease;
}

main {
  margin-top: var(--header-height) !important;
  flex: 1;
  padding: var(--spacing-xl) 0;
}

@media (max-width: 1024px) {
  .header__nav {
    gap: var(--spacing-sm);
  }
  
  .header__settings {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .header__menu-toggle {
    display: flex;
  }

  .header__nav {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-primary);
    flex-direction: column;
    padding: var(--spacing-lg);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }

  .header__nav--active {
    transform: translateX(0);
  }

  .header__nav-links {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .header__settings {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-top: var(--spacing-lg);
  }

  .header__nav a {
    width: 100%;
    padding: var(--spacing-sm);
  }

  .theme-toggle,
  .currency-selector {
    width: 100%;
  }

  .theme-toggle,
  .currency-selector select {
    width: 100%;
    padding: var(--spacing-sm);
  }

  .currency-select {
    width: 100%;
    min-width: 100%;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  width: 100%;
}

.user-menu {
  position: relative;
}

.user-menu-toggle {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-medium);
  display: flex;
  align-items: center;
}

.arrow-down {
  font-size: 10px;
  margin-left: 6px;
}

.user-menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--color-white);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow-md);
  padding: var(--spacing-xs) 0;
  z-index: 100;
  min-width: 180px;
}

.menu-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text);
  text-decoration: none;
  transition: background-color var(--transition-fast);
  text-align: left;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--font-size-medium);
}

.menu-item:hover {
  background-color: var(--color-light-grey);
}

.route-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.app.yellow-theme main a {
  color: #8a5a00;
}

.app.green-theme main a {
  color: #1b522a;
}

.app.yellow-theme main a:hover {
  color: #c87800;
}

.app.green-theme main a:hover {
  color: #2b7a3e;
}
</style> 