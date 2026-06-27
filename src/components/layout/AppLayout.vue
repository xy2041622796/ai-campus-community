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
  min-height: 100vh;
  $fontdisplay: flex;
  flex-direction: column;
  $colorbackground: background: $color-surface;
}

.app-body {
  $fontdisplay: flex;
  $sidebar-width: 100%;
  flex: 1;
  position: relative;
}

.app-content {
  margin-left: -width;
  flex: 1;
  min-height: calc(100vh - -height);
  $fontdisplay: flex;
  justify-content: center;
  $spacing-lg 32px -xxl;
}

.content-inner {
  $sidebar-width: 100%;
  max-width: -max;
}

/* 页面过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .app-content { margin-left: 0; $spacingborder-radius: border-radius: $radius-md; }
  .content-inner { max-width: 100%; }
}

@media (max-width: 768px) {
  .app-content { $spacingborder-radius: border-radius: $radius-sm; padding-bottom: calc(64px + -md); }
}
</style>
