<template>
  <div class="edit-page">
    <div class="edit-header">
      <h1 class="edit-title">编辑帖子</h1>
      <p class="edit-desc">修改你的帖子内容</p>
    </div>

    <div class="edit-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="帖子标题..." size="large" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="帖子内容..." maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = $event" />
        </el-form-item>

        <el-form-item label="标签">
          <TagSelector :tags="form.tags" @update:modelValue="form.tags = $event" />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">保存修改</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePostStore } from '@/stores/post'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelector from '@/components/common/TagSelector.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({ title: '', content: '', images: [], tags: [] })
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }] }

onMounted(async () => {
  const post = await postStore.fetchPostById(route.params.id)
  if (post) { form.title = post.title; form.content = post.content; form.images = post.images || []; form.tags = post.tags || [] }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await postStore.updatePost(route.params.id, { title: form.title, content: form.content, images: form.images, tags: form.tags })
    ElMessage.success('保存成功！')
    router.push('/posts/' + route.params.id)
  } catch (e) { ElMessage.error(e.message || '保存失败') }
  finally { submitting.value = false }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.edit-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.edit-header { border-radius: $radius-lg; }

.edit-title {


  font-weight: 700;
  color: $color-primary;
  margin-bottom: 4px;
}

.edit-desc {  border-radius: $radius-sm; color: $color-text-secondary; }

.edit-card {
  background: $color-card;
  border: $color-border;
  border-radius: $radius-xl;
  padding: 32px;
}

.edit-card :deep(.el-form-item__label) {
  font-weight: 600;
   border-radius: $radius-sm;
  color: $color-primary;
  padding-bottom: 6px;
}

.edit-card :deep(.el-input__wrapper) { border-radius: $radius-md; }
.edit-card :deep(.el-textarea__inner) { border-radius: $radius-md; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
</style>
