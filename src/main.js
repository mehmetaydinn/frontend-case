import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { registerDirectives } from './directives';
import currencyDirective from './plugins/currencyDirective';

// CSS dosyalarını import et (SCSS yerine)
import './styles/variables.css';
import './styles/global.css';

const app = createApp(App);

// Store'u kaydet
app.use(store);

// Router'ı kaydet
app.use(router);

// Directive'leri kaydet
registerDirectives(app);

// Currency directive'ini kaydet
app.directive('currency', currencyDirective);

// Döviz kurlarını yükle
store.dispatch('currency/initCurrency');

// Ayarları ve temayı başlat
store.dispatch('settings/initSettings');

app.mount('#app'); 