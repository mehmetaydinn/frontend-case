<template>
  <div class="login-page">
    <div class="auth-container">
      <h1 class="auth-title">Giriş Yap</h1>
      
      <div v-if="error" class="auth-error">
        {{ error }}
      </div>
      
      <form @submit.prevent="submitForm" class="auth-form">
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
            placeholder="Şifreniz"
            :class="{ 'error': v$.password.$error }"
            @blur="v$.password.$touch()"
          />
          <div v-if="v$.password.$error" class="error-message">
            {{ v$.password.$errors[0].$message }}
          </div>
        </div>
        
        <div class="form-options">
          <router-link to="/forgot-password" class="forgot-password">
            Şifremi Unuttum
          </router-link>
        </div>
        
        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>
      
      <div class="auth-links">
        Hesabınız yok mu?
        <router-link to="/register" class="register-link">
          Kayıt Ol
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength } from '@vuelidate/validators';

export default {
  name: 'LoginPage',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    // Form verileri
    const email = ref('');
    const password = ref('');
    
    // Durum
    const isLoading = computed(() => store.getters['user/isLoading']);
    const error = computed(() => store.getters['user/error']);
    
    // Form doğrulama
    const rules = {
      email: { required, email },
      password: { required, minLength: minLength(6) }
    };
    
    const v$ = useVuelidate(rules, { email, password });
    
    // Form gönderme
    const submitForm = async () => {
      const isFormValid = await v$.value.$validate();
      
      if (isFormValid) {
        try {
          await store.dispatch('user/login', {
            email: email.value,
            password: password.value
          });
          
          // Başarılı giriş sonrası yönlendirme
          const redirectPath = route.query.redirect || '/';
          router.push(redirectPath);
          
          // Bildirim göster
          store.dispatch('ui/showNotification', {
            message: 'Başarıyla giriş yaptınız',
            type: 'success'
          });
        } catch (err) {
        }
      }
    };
    
    return {
      email,
      password,
      isLoading,
      error,
      v$,
      submitForm
    };
  }
};
</script>

<style scoped>
.login-page {
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

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
}

.forgot-password {
  color: var(--color-primary);
  font-size: var(--font-size-small);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
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

.register-link {
  color: var(--color-primary);
  font-weight: 500;
  margin-left: var(--spacing-xs);
}

.register-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-container {
    padding: var(--spacing-lg);
  }
}
</style> 