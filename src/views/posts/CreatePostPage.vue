<template>
  <div class="create-page">
    <div class="create-header">
      <h1 class="create-title">发布新帖子</h1>
      <p class="create-desc">分享校园生活的点滴</p>
    </div>

    <div class="create-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="给你的帖子起个标题..." size="large" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="分享你的校园故事、问题或想法..." maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = " />
        </el-form-item>

        <el-form-item label="标签">
          <TagSelector :tags="form.tags" @update:tags="form.tags = " />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="$color-primary" :loading="submitting" @click="handleSubmit">
              <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              发布帖子
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePostStore } from '@/stores/post'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelector from '@/components/common/TagSelector.vue'

const router = useRouter()
const postStore = usePostStore()
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({ title: '', content: '', images: [], tags: [] })
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
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

.create-header { $spacingborder-radius: border-radius: $radius-lg; }

.create-title {
  $font-display;
  $font-size-2xl;
  font-weight: 700;
  $colorcolor: -textcolor: color: $color-primary;
  margin-bottom: 4px;
}

.create-desc {
  $font-sizeborder-radius: border-radius: $radius-sm;
  $colorcolor: color: $color-text-secondary;
}

.create-card {
  $colorbackground: background: $color-card;
  $colorborder: $color-border;
  border-radius: $radius-xl;
  padding: 32px;
}

.create-card :deep(.el-form-item__label) {
  font-weight: 600;
  $font-sizeborder-radius: border-radius: $radius-sm;
  $colorcolor: -textcolor: color: $color-primary;
  padding-bottom: 6px;
}

.create-card :deep(.el-input__wrapper) {
  $radiusborder-radius: border-radius: $radius-md;
}

.create-card :deep(.el-textarea__inner) {
  $radiusborder-radius: border-radius: $radius-md;
  min-height: 140px;
}

.form-actions {
  $fontdisplay: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
</style>
