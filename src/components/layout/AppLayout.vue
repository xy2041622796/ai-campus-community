<template>
  <div class="app-layout">
    <AppNavbar />
    <div class="app-body">
      <AppSidebar />
      <main class="app-content">
        <div class="content-inner"><router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view></div>
      </main>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import AppNavbar from './AppNavbar.vue'
import AppSidebar from './AppSidebar.vue'
import BottomNav from './BottomNav.vue'
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $color-surface;
  overflow: hidden;
}

.app-body {
  display: flex;
  width: 100%;
  flex: 1;
  position: relative;
}

.app-content {
  margin-left: $sidebar-width;
  flex: 1;
  height: calc(100vh - $navbar-height);
  overflow-y: auto;
  padding: 28px 32px;
}

.content-inner {
  width: 100%;
  max-width: $content-max;
  margin: 0 auto;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 1024px) {
  .app-content { margin-left: 0; padding: 20px 20px; }
  .content-inner { max-width: 100%; }
}

@media (max-width: 768px) {
  .app-content { padding: 12px 12px; padding-bottom: calc(64px + 16px); }
}
</style>
