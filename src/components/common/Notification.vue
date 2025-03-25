<template>
  <div class="notification" :class="notificationType">
    <p>{{ message }}</p>
    <button @click="close" class="close-btn">×</button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Notification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    }
  },
  setup(props) {
    const store = useStore();
    
    const notificationType = computed(() => `notification-${props.type}`);
    
    const close = () => {
      store.commit('ui/CLEAR_NOTIFICATION');
    };
    
    return {
      notificationType,
      close
    };
  }
};
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slide-in 0.3s ease-out;
}

.notification p {
  margin: 0;
  font-size: var(--font-size-base);
}

.notification .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  margin-left: var(--spacing-md);
  opacity: 0.7;
}

.notification .close-btn:hover {
  opacity: 1;
}

.notification.notification-info {
  background-color: var(--color-info);
  color: var(--color-white);
}

.notification.notification-success {
  background-color: var(--color-secondary);
  color: var(--color-white);
}

.notification.notification-warning {
  background-color: var(--color-warning);
  color: var(--color-dark);
}

.notification.notification-warning .close-btn {
  color: var(--color-dark);
}

.notification.notification-error {
  background-color: var(--color-danger);
  color: var(--color-white);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 