<template>
  <div class="forgot-password-page">
    <div class="auth-container">
      <h1 class="auth-title">Şifre Sıfırlama</h1>
      
      <div v-if="error" class="auth-error">
        {{ error }}
      </div>
      
      <div v-if="success" class="auth-success">
        Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.
      </div>
      
      <form v-if="!success" @submit.prevent="submitForm" class="auth-form">
        <div class="info-text">
          Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama bağlantısı içeren bir e-posta göndereceğiz.
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
        
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder' }}
        </button>
      </form>
      
      <div class="auth-links">
        <router-link to="/login" class="back-to-login">
          Giriş sayfasına dön
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';

export default {
  name: 'ForgotPasswordPage',
  setup() {
    const store = useStore();
    
    // Form verileri
    const email = ref('');
    const success = ref(false);
    
    // Durum
    const isLoading = computed(() => store.getters['user/isLoading']);
    const error = computed(() => store.getters['user/error']);
    
    // Form doğrulama
    const rules = {
      email: { 
        required: helpers.withMessage('E-posta alanı zorunludur', required), 
        email: helpers.withMessage('Geçerli bir e-posta adresi giriniz', email) 
      }
    };
    
    const v$ = useVuelidate(rules, { email });
    
    // Form gönderme
    const submitForm = async () => {
      const isFormValid = await v$.value.$validate();
      
      if (isFormValid) {
        try {
          // Gerçek bir API çağrısı yapılacak olsaydı:
          // await store.dispatch('user/forgotPassword', email.value);
          
          // Şimdilik simüle ediyoruz
          isLoading.value = true;
          
          setTimeout(() => {
            success.value = true;
            isLoading.value = false;
            
            // Bildirim göster
            store.dispatch('ui/showNotification', {
              message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
              type: 'success'
            });
          }, 1500);
        } catch (err) {
        }
      }
    };
    
    return {
      email,
      success,
      isLoading,
      error,
      v$,
      submitForm
    };
  }
};
</script>

<style scoped>
.forgot-password-page {
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

.auth-success {
  background-color: var(--color-secondary);
  color: var(--color-white);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
  line-height: 1.5;
}

.auth-form {
  margin-bottom: var(--spacing-lg);
}

.info-text {
  margin-bottom: var(--spacing-md);
  color: var(--color-grey);
  font-size: var(--font-size-small);
  line-height: 1.5;
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
  border: 1px solid var(--color-grey);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
}

.form-group input.error {
  border-color: var(--color-danger);
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
  margin-top: var(--spacing-md);
}

.back-to-login {
  color: var(--color-primary);
  text-decoration: none;
}

.back-to-login:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-container {
    padding: var(--spacing-lg);
  }
}
</style> 