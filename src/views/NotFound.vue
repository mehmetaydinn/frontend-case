<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Sayfa bulunamadı</h1>
        <p class="error-description">
          Bu sayfa bulunamadı. Lütfen tekrar deneyin.
        </p>
        <div class="action-buttons">
          <router-link to="/" class="btn-primary">
            Ana Sayfa
          </router-link>
          <button class="btn-secondary" @click="goBack">
            Geri
          </button>
        </div>
        <div class="suggestions">
          <h2>Ne yapabilirsiniz?</h2>
          <ul>
            <li>Ana sayfaya dönün</li>
            <li>Arama yapın</li>
            <li>Filtreleri sıfırlayın</li>
            <li>Yeni bir arama yapın</li>
            <li>Filtreleri sıfırlayın</li>
            <li>Yeni bir arama yapın</li>
            <li>Filtreleri sıfırlayın</li>
            <li>Yeni bir arama yapın</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.go(-1);
    };

    return {
      goBack
    };
  }
};
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: var(--spacing-xl) 0;
}

.not-found-content {
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-md);
  padding: var(--spacing-xl);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--spacing-md);
  text-shadow: 2px 2px 0 rgba(0,0,0,0.1);
}

.error-title {
  font-size: 2rem;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.error-description {
  font-size: 1.2rem;
  color: var(--color-grey);
  margin-bottom: var(--spacing-lg);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.btn-primary {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-light);
  color: var(--color-dark);
  border: 1px solid var(--color-grey);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.suggestions {
  text-align: left;
  margin-top: var(--spacing-lg);
  border-top: 1px solid var(--color-light);
  padding-top: var(--spacing-lg);
}

.suggestions h2 {
  font-size: 1.2rem;
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.suggestions ul {
  padding-left: var(--spacing-lg);
}

.suggestions li {
  margin-bottom: var(--spacing-sm);
  color: var(--color-grey);
}

.suggestions li a {
  color: var(--color-primary);
  text-decoration: none;
}

.suggestions li a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .not-found-content {
    padding: var(--spacing-lg);
  }
}
</style> 