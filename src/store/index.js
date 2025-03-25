import { createStore } from 'vuex';
import books from './modules/books';
import user from './modules/user';
import favorites from './modules/favorites';
import comments from './modules/comments';
import ui from './modules/ui';
import currency from './modules/currency';
import settings from './modules/settings';

export default createStore({
  modules: {
    books,
    user,
    favorites,
    comments,
    ui,
    currency,
    settings
  },
  strict: process.env.NODE_ENV !== 'production'
}); 