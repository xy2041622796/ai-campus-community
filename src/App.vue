<template>
  <div id="app-root">
    <template v-if="!route.meta.layout || route.meta.layout === 'default'">
      <AppLayout />
    </template>
    <div v-else class="auth-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="auth-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

onMounted(() => { authStore.initSession()
  notifStore.fetchNotifications() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

#app-root { height: 100%; }

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0F5F0 50%, #FEF3E8 100%);
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.auth-fade-enter-from { opacity: 0; transform: scale(0.96); }
.auth-fade-leave-to { opacity: 0; transform: scale(0.96); }
</style>


