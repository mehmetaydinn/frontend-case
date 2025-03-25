import { vHighlight } from './vHighlight';
import { vCurrency } from './vCurrency';

// Vue uygulamasına direktifleri kaydetmek için kullanılacak fonksiyon
export function registerDirectives(app) {
  app.directive('highlight', vHighlight);
  app.directive('currency', vCurrency);
}