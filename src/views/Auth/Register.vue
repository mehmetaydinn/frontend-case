<template>
  <div class="register-page">
    <div class="auth-container">
      <h1 class="auth-title">Kayıt Ol</h1>
      
      <div v-if="error" class="auth-error">
        {{ error }}
      </div>
      
      <form @submit.prevent="submitForm" class="auth-form">
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
            placeholder="E-posta adresiniz"
            :class="{ 'error': v$.email.$error }"
            @blur="v$.email.$touch()"
          />
          <div v-if="v$.email.$error" class="error-message">
            {{ v$.email.$errors[0].$message }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Şifre</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Şifreniz (en az 6 karakter)"
            :class="{ 'error': v$.password.$error }"
            @blur="v$.password.$touch()"
          />
          <div v-if="v$.password.$error" class="error-message">
            {{ v$.password.$errors[0].$message }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Şifre Tekrar</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Şifrenizi tekrar girin"
            :class="{ 'error': v$.confirmPassword.$error }"
            @blur="v$.confirmPassword.$touch()"
          />
          <div v-if="v$.confirmPassword.$error" class="error-message">
            {{ v$.confirmPassword.$errors[0].$message }}
          </div>
        </div>
        
        <div class="form-group terms">
          <input
            id="terms"
            v-model="terms"
            type="checkbox"
            :class="{ 'error': v$.terms.$error }"
            @blur="v$.terms.$touch()"
          />
          <label for="terms">
            <span>Kullanım şartlarını ve gizlilik politikasını kabul ediyorum</span>
          </label>
          <div v-if="v$.terms.$error" class="error-message">
            {{ v$.terms.$errors[0].$message }}
          </div>
        </div>
        
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
        </button>
      </form>
      
      <div class="auth-links">
        Zaten bir hesabınız var mı?
        <router-link to="/login" class="login-link">
          Giriş Yap
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, sameAs, helpers } from '@vuelidate/validators';

export default {
  name: 'RegisterPage',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Sayfa yüklendiğinde önceki bildirimleri temizle
    onMounted(() => {
      store.dispatch('ui/clearNotifications');
    });
    
    // Form verileri
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const terms = ref(false);
    
    // Durum
    const isLoading = computed(() => store.getters['user/isLoading']);
    const error = computed(() => store.getters['user/error']);
    
    // Form doğrulama
    const rules = {
      name: { required: helpers.withMessage('Ad Soyad alanı zorunludur', required) },
      email: { 
        required: helpers.withMessage('E-posta alanı zorunludur', required), 
        email: helpers.withMessage('Geçerli bir e-posta adresi giriniz', email) 
      },
      password: { 
        required: helpers.withMessage('Şifre alanı zorunludur', required), 
        minLength: helpers.withMessage('Şifre en az 6 karakter olmalıdır', minLength(6)) 
      },
      confirmPassword: { 
        required: helpers.withMessage('Şifre tekrar alanı zorunludur', required), 
        sameAsPassword: helpers.withMessage('Şifreler eşleşmiyor', sameAs(password)) 
      },
      terms: { 
        sameAs: helpers.withMessage('Kullanım şartlarını kabul etmelisiniz', sameAs(true)) 
      }
    };
    
    const v$ = useVuelidate(rules, { name, email, password, confirmPassword, terms });
    
    // Form gönderme
    const submitForm = async () => {
      const isFormValid = await v$.value.$validate();
      
      if (isFormValid) {
        try {
          const registerResult = await store.dispatch('user/register', {
            name: name.value,
            email: email.value,
            password: password.value
          });
          
          // Başarılı kayıt sonrası yönlendirme
          if (registerResult) {
            router.push('/');
            
            // Bildirim göster
            store.dispatch('ui/showNotification', {
              message: 'Başarıyla kayıt oldunuz',
              type: 'success'
            });
          }
        } catch (err) {
          // Hata durumunda bildirim göster
          store.dispatch('ui/showNotification', {
            message: 'Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.',
            type: 'error'
          });
        }
      }
    };
    
    return {
      name,
      email,
      password,
      confirmPassword,
      terms,
      isLoading,
      error,
      v$,
      submitForm
    };
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: var(--spacing-md);
}

.auth-container {
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-md);
  width: 100%;
  max-width: 450px;
  padding: var(--spacing-xl);
}

.auth-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary);
}

.auth-error {
  background-color: var(--color-danger);
  color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.auth-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
}

.form-group input.error {
  border-color: var(--color-danger);
}

.form-group.terms {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.form-group.terms input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.form-group.terms label {
  margin: 0;
  font-weight: normal;
  font-size: var(--font-size-base);
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-small);
  margin-top: var(--spacing-xs);
}

.auth-button {
  width: 100%;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.auth-button:hover:not(:disabled) {
  background-color: #2980b9; /* 10% daha koyu */
}

.auth-button:disabled {
  background-color: var(--color-grey);
  cursor: not-allowed;
}

.auth-links {
  text-align: center;
  font-size: var(--font-size-base);
}

.login-link {
  color: var(--color-primary);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-container {
    padding: var(--spacing-lg);
  }
}
</style> 