<template>
  <div class="book-form-page">
    <div class="container">
      <h1 class="page-title">{{ isEditing ? 'Kitap Düzenle' : 'Yeni Kitap Ekle' }}</h1>

      <div v-if="error" class="form-error">
        {{ error }}
      </div>

      <!-- Wizard Adım Göstergesi -->
      <div class="wizard-steps">
        <div class="progress-line" :style="{ transform: `scaleX(${(currentStep - 1) / (steps.length - 1)})` }"></div>
        <div v-for="(step, index) in steps" :key="index" class="step-container">
          <div 
            class="step" 
            :class="{ 
              'active': currentStep === index + 1,
              'completed': currentStep > index + 1 
            }"
          >
            {{ index + 1 }}
          </div>
          <div class="step-label">{{ step }}</div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="book-form">
        <!-- Adım 1: Kitap Bilgileri -->
        <div v-if="currentStep === 1" class="form-step">
          <h2 class="step-title">{{ steps[0] }}</h2>
          <div class="form-group">
            <label for="title">Kitap Başlığı *</label>
            <input
              id="title"
              v-model="book.title"
              type="text"
              placeholder="Kitap başlığını girin..."
              :class="{ 'error': v$.book.title.$error }"
              @blur="v$.book.title.$touch()"
            />
            <div v-if="v$.book.title.$error" class="error-message">
              {{ v$.book.title.$errors[0].$message }}
            </div>
          </div>

          <div class="form-group">
            <label for="author">Yazar *</label>
            <input
              id="author"
              v-model="book.author"
              type="text"
              placeholder="Yazarınızı girin..."
              :class="{ 'error': v$.book.author.$error }"
              @blur="v$.book.author.$touch()"
            />
            <div v-if="v$.book.author.$error" class="error-message">
              {{ v$.book.author.$errors[0].$message }}
            </div>
          </div>

          <div class="form-group">
            <label for="description">Açıklama *</label>
            <QuillEditor
              id="description"
              v-model:content="book.description"
              content-type="html"
              placeholder="Açıklama girin..."
              :class="{ 'error': v$.book.description.$error, 'description-editor': true }"
              @blur="handleEditorBlur"
            />
            <div v-if="v$.book.description.$error" class="error-message">
              {{ v$.book.description.$errors[0].$message }}
            </div>
          </div>

          <div class="form-group image-upload">
            <label>Kitap Kapağı</label>
            <div class="upload-container">
              <div class="preview" v-if="imagePreview">
                <img :src="imagePreview" alt="Kitap Kapağı" />
                <button type="button" class="remove-image" @click="removeImage">×</button>
              </div>
              <div v-else class="upload-button">
                <input
                  type="file"
                  id="coverImage"
                  @change="onImageSelected"
                  accept="image/*"
                />
                <label for="coverImage">
                  <span class="icon">+</span>
                  <span>Kapak Resmi Yükle</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Adım 2: Kitap Detayları -->
        <div v-if="currentStep === 2" class="form-step">
          <h2 class="step-title">{{ steps[1] }}</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="category">Kategori *</label>
              <select
                id="category"
                v-model="book.category"
                :class="{ 'error': v$.book.category.$error }"
                @blur="v$.book.category.$touch()"
              >
                <option value="" disabled>Kategori seçin</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div v-if="v$.book.category.$error" class="error-message">
                {{ v$.book.category.$errors[0].$message }}
              </div>
            </div>

            <div class="form-group">
              <label for="language">Dil *</label>
              <select
                id="language"
                v-model="book.language"
                :class="{ 'error': v$.book.language.$error }"
                @blur="v$.book.language.$touch()"
              >
                <option value="" disabled>Dil seçin</option>
                <option value="tr">Türkçe</option>
                <option value="en">İngilizce</option>
                <option value="fr">Fransızca</option>
                <option value="de">Almanca</option>
                <option value="es">İspanyolca</option>
              </select>
              <div v-if="v$.book.language.$error" class="error-message">
                {{ v$.book.language.$errors[0].$message }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="publishedYear">Yayın Yılı</label>
              <input
                id="publishedYear"
                v-model.number="book.publishedYear"
                type="number"
                placeholder="Yayın yılını girin..."
                min="1500"
                :max="currentYear"
                :class="{ 'error': v$.book.publishedYear.$error }"
                @blur="v$.book.publishedYear.$touch()"
              />
              <div v-if="v$.book.publishedYear.$error" class="error-message">
                {{ v$.book.publishedYear.$errors[0].$message }}
              </div>
            </div>

            <div class="form-group">
              <label for="pageCount">Sayfa Sayısı</label>
              <input
                id="pageCount"
                v-model.number="book.pageCount"
                type="number"
                placeholder="Sayfa sayısını girin..."
                min="1"
                :class="{ 'error': v$.book.pageCount.$error }"
                @blur="v$.book.pageCount.$touch()"
              />
              <div v-if="v$.book.pageCount.$error" class="error-message">
                {{ v$.book.pageCount.$errors[0].$message }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="isbn">ISBN</label>
            <input
              id="isbn"
              v-model="book.isbn"
              type="text"
              placeholder="ISBN numarasını girin..."
              :class="{ 'error': v$.book.isbn.$error }"
              @blur="v$.book.isbn.$touch()"
            />
            <div v-if="v$.book.isbn.$error" class="error-message">
              {{ v$.book.isbn.$errors[0].$message }}
            </div>
          </div>
        </div>

        <!-- Adım 3: Fiyat ve Etiketler -->
        <div v-if="currentStep === 3" class="form-step">
          <h2 class="step-title">{{ steps[2] }}</h2>
          <div class="form-row">
            <div class="form-group price-group" v-if="!book.isFree">
              <label for="price">Fiyat *</label>
              <div class="price-input">
                <input
                  id="price"
                  v-model.number="book.price.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Fiyatınızı girin..."
                  :class="{ 'error': v$.book.price.amount.$error }"
                  @blur="v$.book.price.amount.$touch()"
                />
                <select v-model="book.price.currency" @change="onCurrencyChange">
                  <option value="TRY">TL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div v-if="v$.book.price.amount.$error" class="error-message">
                {{ v$.book.price.amount.$errors[0].$message }}
              </div>
              
              <!-- Diğer para birimlerinde fiyat gösterimi -->
              <div class="price-conversions" v-if="book.price.amount > 0">
                <p>Yaklaşık diğer para birimlerinde:</p>
                <ul>
                  <li v-for="currency in filteredCurrencies" :key="currency.code">
                    {{ convertPrice(book.price.amount, book.price.currency, currency.code).toFixed(2) }} {{ currency.symbol }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-group free-checkbox">
              <label class="checkbox-container">
                <input type="checkbox" v-model="book.isFree" @change="toggleFree" />
                <span class="checkmark"></span>
                Bu kitap ücretsiz
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="tags">Etiketler</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="Etiketleri girin..."
              @keydown.enter.prevent="addTag"
              @blur="addTagFromInput"
            />
            <small class="form-hint">Etiketleri girin ve Enter tuşuna basın</small>
            <div class="tags-container" v-if="book.tags.length > 0">
              <span v-for="(tag, index) in book.tags" :key="index" class="tag">
                {{ tag }}
                <button type="button" @click="removeTag(index)" class="remove-tag">×</button>
              </span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            v-if="currentStep > 1"
            type="button"
            class="btn-secondary"
            @click="prevStep"
          >
            Geri
          </button>
          
          <button
            v-if="currentStep < steps.length"
            type="button"
            class="btn-primary"
            @click="nextStep"
          >
            İleri
          </button>
          
          <button
            v-if="currentStep === steps.length"
            type="button"
            class="btn-primary"
            :disabled="isSubmitting"
            @click="submitForm"
          >
            {{ isSubmitting 
               ? 'Kaydediliyor...' 
               : (isEditing ? 'Güncelle' : 'Kaydet') 
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, minValue, maxValue, numeric, helpers } from '@vuelidate/validators';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
  name: 'BookForm',
  components: {
    QuillEditor
  },
  props: {
    id: {
      type: String,
      required: false,
      default: null
    }
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    // Wizard adımları
    const steps = [
      'Kitap Bilgileri',
      'Kitap Detayları',
      'Fiyat ve Etiketler'
    ];
    const currentStep = ref(1);
    
    // Durum değişkenleri
    const isLoading = ref(false);
    const isSubmitting = ref(false);
    const error = ref(null);
    const tagsInput = ref('');
    const imagePreview = ref(null);

    // Lokal kategoriler oluşturalım
    const dummyCategories = [
      { id: '1', name: 'Roman' },
      { id: '2', name: 'Bilim Kurgu' },
      { id: '3', name: 'Fantastik' },
      { id: '4', name: 'Tarih' },
      { id: '5', name: 'Biyografi' },
      { id: '6', name: 'Kişisel Gelişim' },
      { id: '7', name: 'Bilim' },
      { id: '8', name: 'Felsefe' },
      { id: '9', name: 'Psikoloji' },
      { id: '10', name: 'Çocuk Kitapları' }
    ];
    
    // Store'dan kategorileri al, yoksa dummy kategorileri kullan
    const categories = computed(() => {
      const storeCategories = store.getters['books/categories'];
      return storeCategories && storeCategories.length > 0 ? storeCategories : dummyCategories;
    });
    
    const currentYear = new Date().getFullYear();
    const isEditing = computed(() => !!props.id);

    // Kitap verisi
    const book = reactive({
      title: '',
      author: '',
      description: '',
      coverImage: null,
      category: '',
      language: '',
      publishedYear: null,
      pageCount: null,
      isbn: '',
      price: {
        amount: 0,
        currency: 'TRY'
      },
      isFree: false,
      tags: []
    });

    // Form doğrulama
    const rules = {
      book: {
        title: { required: helpers.withMessage('Kitap başlığı zorunludur', required) },
        author: { required: helpers.withMessage('Yazar adı zorunludur', required) },
        description: { 
          required: helpers.withMessage('Açıklama zorunludur', required),
          minLength: helpers.withMessage('Açıklama en az 10 karakter olmalıdır', minLength(10)) 
        },
        category: { required: helpers.withMessage('Kategori seçimi zorunludur', required) },
        language: { required: helpers.withMessage('Dil seçimi zorunludur', required) },
        publishedYear: { 
          numeric: helpers.withMessage('Yayın yılı sayı olmalıdır', numeric),
          minValue: helpers.withMessage('Yayın yılı 1500\'den büyük olmalıdır', minValue(1500)),
          maxValue: helpers.withMessage(`Yayın yılı ${currentYear}'den büyük olamaz`, maxValue(currentYear))
        },
        pageCount: { 
          numeric: helpers.withMessage('Sayfa sayısı sayı olmalıdır', numeric),
          minValue: helpers.withMessage('Sayfa sayısı 1\'den büyük olmalıdır', minValue(1)) 
        },
        isbn: {},
        price: {
          amount: {
            required: helpers.withMessage('Fiyat zorunludur', function() {
              return !book.isFree;
            }),
            minValue: helpers.withMessage('Fiyat 0\'dan büyük olmalıdır', minValue(0))
          }
        }
      }
    };

    const v$ = useVuelidate(rules, { book });

    // İzleyiciler ve Hesaplanmış Özellikler
    watch(() => currentStep.value, () => {
      // Form doğrulama hatalarını sıfırla
      v$.value.$reset();
      
      // Form durumunu localStorage'a kaydet
      saveDraftToLocalStorage();
    });
    
    // Kitap verisi değişikliklerini izle ve taslağı güncelle
    watch(() => book, () => {
      saveDraftToLocalStorage();
    }, { deep: true });

    // Form adımları arasında gezinme
    const nextStep = () => {
      if (currentStep.value < steps.length) {
        currentStep.value++;
      }
    };

    // Önceki adıma dön
    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    // Mevcut kitabı getir (düzenleme modu için)
    onMounted(async () => {
      try {
        // Kategori yüklemeyi deneyin, hata olursa yakala
        await store.dispatch('books/fetchCategories');
      } catch (error) {
        // Hata durumunda bildirim göster
        store.dispatch('ui/showNotification', {
          message: 'Kategoriler yüklenemedi, varsayılan kategoriler kullanılıyor',
          type: 'warning'
        });
      }
      
      // Kategori çekme işlemi başarılı veya başarısız olsun, devam et
      if (isEditing.value) {
        try {
          await store.dispatch('books/fetchBookById', props.id);
          const existingBook = store.getters['books/selectedBook'];
          
          if (existingBook) {
            book.title = existingBook.title;
            book.author = existingBook.author;
            book.description = existingBook.description;
            book.coverImage = existingBook.coverImage;
            book.category = existingBook.category;
            book.language = existingBook.language;
            book.publishedYear = existingBook.publishedYear;
            book.pageCount = existingBook.pageCount;
            book.isbn = existingBook.isbn;
            book.isFree = existingBook.isFree;
            
            if (!existingBook.isFree && existingBook.price) {
              book.price.amount = existingBook.price.amount;
              book.price.currency = existingBook.price.currency;
            }
            
            book.tags = existingBook.tags ? [...existingBook.tags] : [];
            
            if (existingBook.coverImage) {
              imagePreview.value = existingBook.coverImage;
            }
          } else {
            router.push('/');
            store.dispatch('ui/showNotification', {
              message: 'Düzenlenecek kitap bulunamadı',
              type: 'error'
            });
          }
        } catch (error) {
          store.dispatch('ui/showNotification', {
            message: 'Kitap detayları yüklenemedi',
            type: 'error'
          });
          router.push('/');
        }
      } else {
        // Düzenleme modu değilse taslağı yükle
        loadDraftFromLocalStorage();
      }
    });

    // Resim yükleme işlevi
    const onImageSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Dosya boyutu kontrolü - 2MB'dan büyük olmamalı
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        store.dispatch('ui/showNotification', {
          message: 'Görsel boyutu 2MB\'ı geçemez',
          type: 'error'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Base64 formatında görsel verisi
        const base64Image = e.target.result;
        imagePreview.value = base64Image;
        book.coverImage = base64Image;
        
        // Düzenleme modunda değilse, taslak olarak localStorage'a kaydet
        if (!isEditing.value) {
          try {
            const draftKey = 'book_form_draft';
            const draftData = localStorage.getItem(draftKey) ? 
                            JSON.parse(localStorage.getItem(draftKey)) : {};
            
            draftData.coverImage = base64Image;
            localStorage.setItem(draftKey, JSON.stringify(draftData));
          } catch (error) {
          }
        }
      };
      reader.onerror = (error) => {
        store.dispatch('ui/showNotification', {
          message: 'Görsel yüklenirken bir hata oluştu',
          type: 'error'
        });
      };
      reader.readAsDataURL(file);
    };

    // Resmi kaldır
    const removeImage = () => {
      imagePreview.value = null;
      book.coverImage = null;
      const fileInput = document.getElementById('coverImage');
      if (fileInput) fileInput.value = '';
      
      // Düzenleme modunda değilse, taslaktan resmi kaldır
      if (!isEditing.value) {
        try {
          const draftKey = 'book_form_draft';
          const draftData = localStorage.getItem(draftKey) ? 
                          JSON.parse(localStorage.getItem(draftKey)) : {};
          
          delete draftData.coverImage;
          localStorage.setItem(draftKey, JSON.stringify(draftData));
        } catch (error) {
        }
      }
    };

    // Ücretsiz/Ücretli toggle
    const toggleFree = () => {
      if (book.isFree) {
        book.price.amount = 0;
      }
    };

    // Etiket ekleme
    const addTag = (event) => {
      event.preventDefault();
      addTagFromInput();
    };

    // Input'tan etiket ekleme
    const addTagFromInput = () => {
      const tag = tagsInput.value.trim();
      if (tag && !book.tags.includes(tag)) {
        book.tags.push(tag);
        tagsInput.value = '';
      }
    };

    // Etiket silme
    const removeTag = (index) => {
      book.tags.splice(index, 1);
    };

    // Para birimleri listesi
    const currencies = [
      { code: 'TRY', symbol: 'TL', rate: 1 },
      { code: 'USD', symbol: '$', rate: 0.031 }, // 1 TL = 0.031 USD
      { code: 'EUR', symbol: '€', rate: 0.029 }  // 1 TL = 0.029 EUR
    ];
    
    // Filtrelenmiş para birimleri (şu anki seçili olmayan)
    const filteredCurrencies = computed(() => {
      return currencies.filter(currency => currency.code !== book.price.currency);
    });
    
    // Para birimi değiştiğinde fiyatı otomatik çevir
    const onCurrencyChange = () => {
      // Eski para birimi ve değeri
      const oldCurrency = book.price.currency;
      const oldAmount = book.price.amount;
      
      // Yeni para birimine göre değeri güncelle
      if (oldAmount > 0) {
        // TL'ye çevir, sonra hedef para birimine
        let amountInTRY = oldAmount;
        
        // Önce TL'ye çevir (eğer TL değilse)
        if (oldCurrency !== 'TRY') {
          const oldRate = currencies.find(c => c.code === oldCurrency)?.rate || 1;
          amountInTRY = oldAmount / oldRate;
        }
        
        // Sonra hedef para birimine çevir
        if (book.price.currency !== 'TRY') {
          const newRate = currencies.find(c => c.code === book.price.currency)?.rate || 1;
          book.price.amount = parseFloat((amountInTRY * newRate).toFixed(2));
        } else {
          book.price.amount = parseFloat(amountInTRY.toFixed(2));
        }
      }
    };
    
    // Para birimi çevirme fonksiyonu
    const convertPrice = (amount, fromCurrency, toCurrency) => {
      // Para birimlerini bul
      const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
      const toCurrencyData = currencies.find(c => c.code === toCurrency);
      
      if (!fromCurrencyData || !toCurrencyData) return amount;
      
      // Önce TL'ye çevir
      let amountInTRY = amount;
      if (fromCurrency !== 'TRY') {
        amountInTRY = amount / fromCurrencyData.rate;
      }
      
      // Sonra hedef para birimine çevir
      if (toCurrency !== 'TRY') {
        return amountInTRY * toCurrencyData.rate;
      }
      
      return amountInTRY;
    };

    // Editör blur olduğunda doğrulama yap
    const handleEditorBlur = () => {
      v$.value.book.description.$touch();
      // Taslağa anında kaydet
      saveDraftToLocalStorage();
    };

    // Form durumunu localStorage'a kaydet
    const saveDraftToLocalStorage = () => {
      if (isEditing.value) return; // Düzenleme modunda taslak kaydetmeye gerek yok
      
      try {
        const draftKey = 'book_form_draft';
        const draftData = {
          title: book.title,
          author: book.author,
          description: book.description,
          category: book.category,
          language: book.language,
          publishedYear: book.publishedYear,
          pageCount: book.pageCount,
          isbn: book.isbn,
          isFree: book.isFree,
          price: book.price,
          tags: book.tags,
          coverImage: book.coverImage,
          step: currentStep.value
        };
        
        // LocalStorage'a kaydet
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      } catch (error) {
      }
    };
    
    // Form taslağını localStorage'dan yükle
    const loadDraftFromLocalStorage = () => {
      if (isEditing.value) return; // Düzenleme modunda taslak yüklemeye gerek yok
      
      try {
        const draftKey = 'book_form_draft';
        const draftDataStr = localStorage.getItem(draftKey);
        
        if (draftDataStr) {
          const draftData = JSON.parse(draftDataStr);
          
          // Form alanlarını doldur
          if (draftData.title) book.title = draftData.title;
          if (draftData.author) book.author = draftData.author;
          if (draftData.description) book.description = draftData.description;
          if (draftData.category) book.category = draftData.category;
          if (draftData.language) book.language = draftData.language;
          if (draftData.publishedYear) book.publishedYear = draftData.publishedYear;
          if (draftData.pageCount) book.pageCount = draftData.pageCount;
          if (draftData.isbn) book.isbn = draftData.isbn;
          if (draftData.isFree !== undefined) book.isFree = draftData.isFree;
          if (draftData.price) book.price = draftData.price;
          if (draftData.tags) book.tags = draftData.tags;
          if (draftData.coverImage) {
            book.coverImage = draftData.coverImage;
            imagePreview.value = draftData.coverImage;
          }
          
          // Adımı da yükle
          if (draftData.step) currentStep.value = draftData.step;
          
          
          // Bildirim göster
          store.dispatch('ui/showNotification', {
            message: 'Taslak form yüklendi. Kaldığınız yerden devam edebilirsiniz.',
            type: 'info'
          });
        }
      } catch (error) {
      }
    };
    
    // Form taslağını localStorage'dan temizle
    const clearDraftFromLocalStorage = () => {
      try {
        const draftKey = 'book_form_draft';
        localStorage.removeItem(draftKey);
      } catch (error) {
      }
    };

    // Form gönderme
    const submitForm = async () => {
      
      const isValid = await v$.value.$validate();

      if (!isValid) {
        return;
      }

      isSubmitting.value = true;
      
      try {
        const bookData = {
          ...book,
          // Eğer ücretsizse fiyat bilgisini 0 olarak ayarla
          price: book.isFree ? { amount: 0, currency: 'TRY' } : book.price,
        };
        

        if (isEditing.value) {
          // ID ekleyerek güncelleme yapalım
          await store.dispatch('books/updateBook', { 
            id: props.id, 
            ...bookData,
            // Eğer kitap ID bir başka kullanıcıya aitse, o kullanıcı ID'sini koru
            addedBy: store.getters['books/bookById'] ? 
                     store.getters['books/bookById'](props.id)?.addedBy : null
          });
          
          store.dispatch('ui/showNotification', {
            message: 'Kitap başarıyla güncellendi',
            type: 'success'
          });
        } else {
          try {
            const result = await store.dispatch('books/addBook', bookData);
            
            store.dispatch('ui/showNotification', {
              message: 'Kitap başarıyla eklendi',
              type: 'success'
            });
            
            // Kitap başarıyla eklendiğinde taslağı temizle
            clearDraftFromLocalStorage();
          } catch (addError) {
            throw addError;
          }
        }
        
        // Liste verilerini yenile
        try {
          await store.dispatch('books/fetchBooks');
        } catch (err) {
        }
        
        router.push('/');
      } catch (error) {
        store.dispatch('ui/showNotification', {
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
          type: 'error'
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      steps,
      currentStep,
      book,
      v$,
      isLoading,
      isSubmitting,
      error,
      categories,
      currentYear,
      isEditing,
      tagsInput,
      imagePreview,
      nextStep,
      prevStep,
      toggleFree,
      addTag,
      addTagFromInput,
      removeTag,
      onImageSelected,
      removeImage,
      submitForm,
      saveDraftToLocalStorage,
      loadDraftFromLocalStorage,
      clearDraftFromLocalStorage,
      filteredCurrencies,
      onCurrencyChange,
      convertPrice,
      handleEditorBlur
    };
  }
};
</script>

<style>
.book-form-page {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-color);
}

.page-title {
  color: var(--color-primary);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.form-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.1);
}

.book-form {
  background-color: var(--bg-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--box-shadow-md);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

/* Wizard Adım Göstergesi Stilleri */
.wizard-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: var(--spacing-xl);
  padding: 0 var(--spacing-xl);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;
  position: relative;
  z-index: 2;
}

.step {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
  border: 2px solid #e0e0e0;
  transition: all 0.5s ease;
  font-size: 1.1rem;
  color: #333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.step.active {
  background-color: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(52, 152, 219, 0.2);
}

.step.completed {
  background-color: var(--color-success);
  color: #000000;
  border-color: #e0e0e0;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  box-shadow: 0 3px 6px rgba(40, 167, 69, 0.3);
}

.step-label {
  font-size: 0.95rem;
  text-align: center;
  color: var(--color-dark);
  font-weight: 500;
  max-width: 120px;
  line-height: 1.3;
}

.dark-theme .step-label {
  color: var(--text-color);
}

.progress-line {
  position: absolute;
  height: 4px;
  background-color: #f0f0f0;
  top: 25px;
  left: 120px;
  right: 120px;
  z-index: 1;
  border-radius: 4px;
}

.progress-line::before {
  content: '';
  position: absolute;
  height: 100%;
  background-color: var(--color-success);
  width: 0%;
  transition: width 0.5s ease;
  border-radius: 4px;
}

.wizard-steps[data-step="1"] .progress-line::before {
  width: 0%;
}

.wizard-steps[data-step="2"] .progress-line::before {
  width: 50%;
}

.wizard-steps[data-step="3"] .progress-line::before {
  width: 100%;
}

.form-step {
  animation: fadeIn 0.5s ease-in-out;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.step-title {
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  font-size: 1.4rem;
  text-align: center;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--color-dark);
}

input, select, textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  background-color: #ffffff;
}

.form-hint {
  display: block;
  color: var(--color-grey);
  margin-top: var(--spacing-xs);
  font-size: 0.85rem;
}

.error {
  border-color: var(--color-error) !important;
}

.error-message {
  color: var(--color-error);
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
}

.price-input {
  display: flex;
  gap: var(--spacing-sm);
}

.price-input input {
  flex: 2;
}

.price-input select {
  flex: 1;
  min-width: 80px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: normal;
}

.checkbox-container input {
  margin-right: var(--spacing-sm);
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-md);
}

.checkbox-label {
  margin-left: var(--spacing-sm);
  margin-bottom: 0;
}

.image-upload {
  margin-bottom: var(--spacing-lg);
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.preview img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.preview:hover img {
  transform: scale(1.03);
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  background-color: var(--color-error);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  opacity: 0.9;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.remove-image:hover {
  opacity: 1;
  transform: scale(1.1);
}

.upload-button {
  width: 100%;
  max-width: 300px;
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background-color: #fafafa;
}

.upload-button:hover {
  border-color: var(--color-primary);
  background-color: rgba(52, 152, 219, 0.05);
}

.upload-button input[type="file"] {
  display: none;
}

.upload-button label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
}

.upload-button .icon {
  font-size: 32px;
  margin-bottom: var(--spacing-sm);
  color: var(--color-primary);
  transition: transform 0.3s ease;
}

.upload-button:hover .icon {
  transform: translateY(-5px);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.tag {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.tag:hover {
  background-color: rgba(52, 152, 219, 0.1);
  transform: translateY(-2px);
}

.remove-tag {
  background: none;
  border: none;
  color: var(--color-grey);
  cursor: pointer;
  margin-left: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-tag:hover {
  color: var(--color-error);
  transform: scale(1.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid #f0f0f0;
}

.btn-primary {
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
}

.btn-secondary {
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
  background-color: #b3b3b3;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #ebebeb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-secondary:disabled {
  background-color: var(--color-grey);
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .book-form {
    padding: var(--spacing-md);
  }
  
  .wizard-steps {
    padding: 0;
  }
  
  .step-container {
    width: auto;
  }
  
  .step {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
  
  .progress-line {
    left: 70px;
    right: 70px;
    top: 20px;
  }
  
  .btn-primary, .btn-secondary {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.9rem;
  }
}

.description-editor {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.description-editor .ql-editor {
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 150px;
  max-height: 300px;
  font-family: inherit;
}

/* QuillEditor içinde gereksiz input'u gizle */
.description-editor > div:last-child {
  display: none !important;
}

.price-conversions {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
}

.price-conversions p {
  margin-bottom: var(--spacing-xs);
  color: var(--color-dark);
  font-weight: 500;
}

.price-conversions ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.price-conversions li {
  padding: 2px 0;
  color: var(--color-grey-dark);
}
</style> 