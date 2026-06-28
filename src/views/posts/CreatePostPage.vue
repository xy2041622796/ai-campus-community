<template>
  <div class="create-page">
    <div class="create-header">
      <h1 class="create-title">发布新帖子</h1>
      <p class="create-desc">分享校园生活的点滴</p>
    </div>

    <div class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="给你的帖子起个标题..." size="large" maxlength="30" show-word-limit />
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="分享你的校园故事、问题或想法..." maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = $event" />
        </el-form-item>

        <el-form-item label="标签">
          <TagSelector :tags="form.tags" @update:modelValue="form.tags = $event" />
        </el-form-item>

        <el-form-item>
          <div class="form-ai-actions">
            <div class="ai-tip">
              <el-button size="small" class="ai-polish-btn" :loading="polishLoading" :disabled="!form.content.trim()" @click="handlePolish">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                AI 涝色
              </el-button>
              <span class="ai-hint">让你优化表辑表辑又达达</span>
            </div>
          </div>
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              发布帖子
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePostStore } from '@/stores/post'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelector from '@/components/common/TagSelector.vue'
import { useAIStore } from '@/stores/ai'

const router = useRouter()
const postStore = usePostStore()
const formRef = ref(null)
const submitting = ref(false)
const aiStore = useAIStore()
const polishLoading = computed(() => aiStore.polishing)
const charCount = computed(() => form.content.length)
const form = reactive({ title: '', content: '', images: [], tags: [] })
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
}

async function handlePolish() {
  if (!form.content.trim()) return
  const result = await aiStore.polishContent(form.content)
  if (result) form.content = result
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await postStore.createPost({ title: form.title, content: form.content, images: form.images, tags: form.tags })
    ElMessage.success('发布成功！')
    router.push('/')
  } catch (e) { ElMessage.error(e.message || '发布失败') }
  finally { submitting.value = false }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.create-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.create-header { margin-bottom: 24px; }
.create-title { font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; margin-bottom: 4px; }
.create-desc { font-size: $font-size-sm; color: $color-text-tertiary; }

.create-card {
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-xl;
  padding: 32px;
}

.create-card :deep(.el-form-item__label) {
  font-weight: 600;
  font-size: $font-size-sm;
  color: $color-text-primary;
  padding-bottom: 6px;
}

.create-card :deep(.el-input__wrapper) { border-radius: $radius-md; }
.create-card :deep(.el-textarea__inner) { border-radius: $radius-md; min-height: 140px; }

.form-ai-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.04), rgba(94, 196, 172, 0.04));
  border: 1px solid rgba(74, 108, 247, 0.08);
  border-radius: $radius-md;
}

.ai-tip { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.ai-polish-btn {
  background: linear-gradient(135deg, #4A6CF7, #5EC4AC) !important;
  border: none !important;
  color: white !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2) !important;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74, 108, 247, 0.35) !important; }
  &:active { transform: translateY(0) !important; }
  svg { stroke: currentColor; }
}

.ai-hint { font-size: $font-size-xs; color: $color-text-tertiary; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
</style>
