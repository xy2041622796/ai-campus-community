<template>
  <div class="login-page">
    <div class="auth-wrapper">
      <div class="auth-side">
        <div class="auth-side-content">
          <div class="auth-brand-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="url(#auth-grad)"/>
              <path d="M32 12L16 22v20l16 10 16-10V22L32 12z" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
              <rect x="29" y="28" width="6" height="12" rx="2" fill="url(#auth-grad)" opacity="0.85"/>
              <defs>
                <linearGradient id="auth-grad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stop-color="#4A6CF7"/>
                  <stop offset="100%" stop-color="#5EC4AC"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="auth-side-title">校园社区</h1>
          <p class="auth-side-desc">AI 智能化校园交流平台 · 连接每一个校园人</p>
          <div class="auth-features">
            <div class="auth-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              校园论坛 & 动态分享
            </div>
            <div class="auth-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              AI 智能推荐 & 匹配
            </div>
            <div class="auth-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              社团活动 & 搭子匹配
            </div>
          </div>
        </div>
      </div>

      <div class="auth-main">
        <div class="auth-container">
          <div class="auth-header">
            <h2 class="auth-title">欢迎回来</h2>
            <p class="auth-subtitle">登录你的校园账号</p>
          </div>
          <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @keyup.enter="handleLogin">
            <el-form-item prop="student_id">
              <el-input v-model="form.student_id" placeholder="学号" :prefix-icon="User" size="large" class="auth-input" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" size="large" class="auth-input" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" class="auth-btn" :loading="authStore.loading" @click="handleLogin">
                <span v-if="!authStore.loading">登录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>
          <div class="auth-footer">
            <span class="auth-footer-text">还没有账号？</span>
            <router-link to="/register" class="auth-link">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const form = reactive({ student_id: '', password: '' })
const rules = {
  student_id: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try { await authStore.login(form.student_id, form.password); ElMessage.success('登录成功'); router.push('/') }
  catch (e) { ElMessage.error(e.message || '登录失败') }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.login-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0F5F0 50%, #FEF3E8 100%);
}

.auth-wrapper {
  display: flex;
  width: 860px;
  max-width: 100%;
  min-height: 560px;
  background: $color-card;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

/* 左侧品牌展示 */
.auth-side {
  width: 380px;
  background: linear-gradient(135deg, #4A6CF7 0%, #5EC4AC 100%);
  padding: 48px 36px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.06;
    background-image:
      radial-gradient(circle at 30% 20%, white 2px, transparent 2px),
      radial-gradient(circle at 70% 80%, white 1.5px, transparent 1.5px);
    background-size: 40px 40px, 60px 60px;
  }
}

.auth-side-content { position: relative; z-index: 1; color: white; }

.auth-brand-icon { margin-bottom: 20px; }

.auth-side-title {

  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-side-desc {
   border-radius: $radius-sm;
  opacity: 0.85;
  line-height: $line-height-relaxed;
  margin-bottom: 32px;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-feature {
  display: flex;
  align-items: center;
  gap: 10px;
   border-radius: $radius-sm;
  opacity: 0.9;

  svg { stroke: currentColor; flex-shrink: 0; }
}

/* 右侧表单 */
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.auth-container {
  width: 340px;
  max-width: 100%;
}

.auth-header { margin-bottom: 28px; }

.auth-title {

  font-size: 1.5rem;
  font-weight: 700;
  color: $color-primary;
  margin-bottom: 6px;
}

.auth-subtitle {
   border-radius: $radius-sm;
  color: $color-text-secondary;
}

.auth-form { border-radius: $radius-lg; }

.auth-input :deep(.el-input__wrapper) {
  border-radius: $radius-md;
  padding: 4px 16px;
  height: 46px;
}

.auth-input :deep(.el-input__prefix) {
  margin-right: 8px;
}

.auth-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: $radius-md;
}

.auth-footer {
  text-align: center;
  color: $color-text-secondary;
   border-radius: $radius-sm;
}

.auth-link {
  color: $color-primary;
  font-weight: 600;

  &:hover { text-decoration: underline; }
}

@media (max-width: 768px) {
  .auth-side { display: none; }
  .auth-main { padding: 32px 24px; }
  .auth-wrapper { min-height: auto; }
}
</style>
