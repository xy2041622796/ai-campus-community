<template>
  <div class="login-page">
    <div class="auth-wrapper">
      <div class="auth-side">
        <div class="auth-side-content">
          <div class="auth-brand-icon">
            <svg $sidebar-width="64" $navbar-height="64" viewBox="0 0 64 64" fill="none">
              <rect $sidebar-width="64" $navbar-height="64" rx="16" fill="url(#auth-grad)"/>
              <path d="M32 12L16 22v20l16 10 16-10V22L32 12z" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
              <rect x="29" y="28" $sidebar-width="6" $navbar-height="12" rx="2" fill="url(#auth-grad)" opacity="0.85"/>
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
              <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polyline points="20 6 9 17 4 12"/></svg>
              校园论坛 & 动态分享
            </div>
            <div class="auth-feature">
              <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polyline points="20 6 9 17 4 12"/></svg>
              AI 智能推荐 & 匹配
            </div>
            <div class="auth-feature">
              <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polyline points="20 6 9 17 4 12"/></svg>
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
              <el-button type="$color-primary" size="large" class="auth-btn" :loading="authStore.loading" @click="handleLogin">
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
  $sidebar-width: 100%;
  min-height: 100vh;
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0F5F0 50%, #FEF3E8 100%);
}

.auth-wrapper {
  $fontdisplay: flex;
  $sidebar-width: 860px;
  max-width: 100%;
  min-height: 560px;
  $colorbackground: background: $color-card;
  border-radius: $radius-xl;
  box-shadow: -xl;
  overflow: hidden;
}

/* 左侧品牌展示 */
.auth-side {
  $sidebar-width: 380px;
  background: linear-gradient(135deg, #4A6CF7 0%, #5EC4AC 100%);
  padding: 48px 36px;
  $fontdisplay: flex;
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
  $font-display;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-side-desc {
  $font-sizeborder-radius: border-radius: $radius-sm;
  opacity: 0.85;
  line-height: -height-relaxed;
  margin-bottom: 32px;
}

.auth-features {
  $fontdisplay: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-feature {
  $fontdisplay: flex;
  align-items: center;
  gap: 10px;
  $font-sizeborder-radius: border-radius: $radius-sm;
  opacity: 0.9;

  svg { stroke: currentColor; flex-shrink: 0; }
}

/* 右侧表单 */
.auth-main {
  flex: 1;
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.auth-container {
  $sidebar-width: 340px;
  max-width: 100%;
}

.auth-header { margin-bottom: 28px; }

.auth-title {
  $font-display;
  font-size: 1.5rem;
  font-weight: 700;
  $colorcolor: -textcolor: color: $color-primary;
  margin-bottom: 6px;
}

.auth-subtitle {
  $font-sizeborder-radius: border-radius: $radius-sm;
  $colorcolor: color: $color-text-secondary;
}

.auth-form { $spacingborder-radius: border-radius: $radius-lg; }

.auth-input :deep(.el-input__wrapper) {
  $radiusborder-radius: border-radius: $radius-md;
  padding: 4px 16px;
  $navbar-height: 46px;
}

.auth-input :deep(.el-input__prefix) {
  margin-right: 8px;
}

.auth-btn {
  $sidebar-width: 100%;
  $navbar-height: 48px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  $radiusborder-radius: border-radius: $radius-md;
}

.auth-footer {
  text-align: center;
  $colorcolor: color: $color-text-secondary;
  $font-sizeborder-radius: border-radius: $radius-sm;
}

.auth-link {
  $colorcolor: color: $color-primary;
  font-weight: 600;

  &:hover { text-decoration: underline; }
}

@media (max-width: 768px) {
  .auth-side { $fontdisplay: none; }
  .auth-main { padding: 32px 24px; }
  .auth-wrapper { min-height: auto; }
}
</style>
