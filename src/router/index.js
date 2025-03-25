import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// Route bileşenlerini lazy-loading ile import et
const Home = () => import('@/views/Home.vue');
const BookDetail = () => import('@/views/BookDetail.vue');
const BookForm = () => import('@/views/BookForm.vue');
const Login = () => import('@/views/Auth/Login.vue');
const Register = () => import('@/views/Auth/Register.vue');
const ForgotPassword = () => import('@/views/Auth/ForgotPassword.vue');
const UserProfile = () => import('@/views/Profile/UserProfile.vue');
const Favorites = () => import('@/views/Profile/Favorites.vue');
const NotFound = () => import('@/views/NotFound.vue');

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Anasayfa' }
  },
  {
    path: '/books/new',
    name: 'book-new',
    component: BookForm,
    meta: { requiresAuth: true, title: 'Yeni Kitap Ekle' }
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: BookDetail,
    props: true,
    meta: { title: 'Kitap Detayı' }
  },
  {
    path: '/books/:id/edit',
    name: 'book-edit',
    component: BookForm,
    props: true,
    meta: { requiresAuth: true, title: 'Kitap Düzenle' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { 
      guestOnly: true,
      title: 'Giriş Yap'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { 
      guestOnly: true,
      title: 'Kayıt Ol'
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { 
      guestOnly: true,
      title: 'Şifremi Unuttum'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { 
      requiresAuth: true,
      title: 'Profilim'
    }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: Favorites,
    meta: { 
      requiresAuth: true,
      title: 'Favorilerim'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: 'Sayfa Bulunamadı' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Sayfa değiştiğinde en üste scroll yap
    return { top: 0 };
  }
});

// Navigasyon koruması
router.beforeEach(async (to, from, next) => {
  // Kimlik doğrulama durumunu kontrol et
  await store.dispatch('user/checkAuth');
  const isAuthenticated = store.getters['user/isAuthenticated'];
  
  // Sayfa başlığını değiştir
  document.title = to.meta.title ? `${to.meta.title} | Kitap Dünyası Pro` : 'Kitap Dünyası Pro';
  
  // Kimlik doğrulama gerektiren rotalar
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }
  
  // Yalnızca misafirler için olan rotalar (giriş yapmış kullanıcılar erişemez)
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'home' });
  }
  
  next();
});

export default router; 