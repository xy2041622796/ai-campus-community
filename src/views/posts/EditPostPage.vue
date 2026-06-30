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
          <div class="content-toolbar">
            <el-button size="small" class="ai-polish-btn" :loading="polishLoading" :disabled="!form.content.trim()" @click="handlePolish"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 润色</el-button>
            <el-button size="small" class="ai-tag-btn" :loading="tagLoading" :disabled="!form.content.trim() &amp;&amp; !form.title.trim()" @click="handleSuggestTags"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 生成标签</el-button>
          </div>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="帖子内容..." maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = $event" />
          <div class="ai-cover-bar"><el-button size="small" :loading="coverLoading" :disabled="!form.title.trim()" @click="handleGenerateCover"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> AI 生成封面图</el-button></div>
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
  <el-dialog v-model="showPolishDialog" title="润色对比" width="90%" max-width="640px" :close-on-click-modal="false">
    <div v-if="polishResult" class="polish-compare">
      <div class="pc-col">
        <div class="pc-label">原来的文字</div>
        <div class="pc-content original">{{ polishOriginal }}</div>
      </div>
      <div class="pc-col">
        <div class="pc-label">润色后的文字</div>
        <div class="pc-content polished">{{ polishResult }}</div>
      </div>
    </div>
    <div class="dialog-footer">
      <el-button @click="polishResult = null; showPolishDialog = false">取消</el-button>
      <el-button @click="handleRePolish" :loading="polishLoading">重新润色</el-button>
      <el-button type="primary" @click="handleAcceptPolish">同意替换</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePostStore } from '@/stores/post'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelector from '@/components/common/TagSelector.vue'
import { useAIStore } from '@/stores/ai'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const formRef = ref(null)
const submitting = ref(false)
const aiStore = useAIStore()
const polishLoading = computed(() => aiStore.polishing)
const tagLoading = computed(() => aiStore.suggesting)
const coverLoading = computed(() => aiStore.generating)
const showPolishDialog = ref(false)
const polishResult = ref("")
const polishOriginal = ref("")
const form = reactive({ title: '', content: '', images: [], tags: [] })
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }] }

onMounted(async () => {
  const post = await postStore.fetchPostById(route.params.id)
  if (post) { form.title = post.title; form.content = post.content; form.images = post.images || []; form.tags = post.tags || [] }
})

async function handlePolish() {
  if (!form.content.trim()) { ElMessage.info('请先填写正文内容'); return }
  const result = await aiStore.polishContent(form.content)
  if (result && result !== form.content) {
    polishOriginal.value = form.content
    polishResult.value = result
    showPolishDialog.value = true
  }
}

function handleAcceptPolish() {
  if (polishResult.value) form.content = polishResult.value
  showPolishDialog.value = false
  polishResult.value = null
}

function handleRePolish() {
  showPolishDialog.value = false
  polishResult.value = null
  handlePolish()
}

async function handleSuggestTags() {
  const text = (form.title + ' ' + form.content).trim()
  if (!text) { ElMessage.info('请先填写标题或正文'); return }
  const tags = await aiStore.suggestTags(text)
  if (tags.length) {
    form.tags = [...new Set([...form.tags, ...tags])]
    ElMessage.success('已生成 ' + tags.length + ' 个标签')
  }
}

async function handleGenerateCover() {
  if (!form.title.trim()) { ElMessage.info('请先填写标题'); return }
  const url = await aiStore.generateCoverImage(form.title)
  if (url) {
    form.images = [...form.images, url]
    ElMessage.success('封面图已生成')
  }
}

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

.content-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }

.ai-polish-btn {
  background: linear-gradient(135deg, #4A6CF7, #5EC4AC) !important;
  border: none !important;
  color: white !important;
  font-weight: 500 !important;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2) !important;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.ai-polish-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74, 108, 247, 0.35) !important; }
.ai-polish-btn svg { stroke: currentColor; }

.ai-tag-btn, .ai-cover-bar .el-button {
  background: linear-gradient(135deg, #5EC4AC, #4A6CF7) !important;
  border: none !important;
  color: white !important;
  font-weight: 500 !important;
  box-shadow: 0 2px 8px rgba(94, 196, 172, 0.2) !important;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
.ai-tag-btn:hover, .ai-cover-bar .el-button:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(94, 196, 172, 0.35) !important; }

.ai-cover-bar { margin-top: 8px; }
.ai-cover-bar .el-button svg { stroke: currentColor; }

.polish-compare { display: flex; gap: 0; align-items: stretch; border: 1px solid $color-border-light; border-radius: $radius-lg; overflow: hidden; }
.pc-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pc-col + .pc-col { border-left: 1px solid $color-border-light; }
.pc-label { padding: 8px 14px; font-size: $font-size-xs; font-weight: 700; color: white; letter-spacing: 1px; }
.pc-col:first-child .pc-label { background: $color-text-tertiary; }
.pc-col:last-child .pc-label { background: $color-primary-gradient; }
.pc-content { flex: 1; padding: 14px; font-size: $font-size-base; line-height: $line-height-relaxed; white-space: pre-wrap; word-break: break-word; min-height: 120px; }
.pc-content.original { background: $color-card; color: $color-text-secondary; }
.pc-content.polished { background: rgba(74, 108, 247, 0.03); color: $color-text-primary; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }

@media (max-width: 768px) { .polish-compare { flex-direction: column; } .pc-col + .pc-col { border-left: none; border-top: 1px solid $color-border-light; } }
.edit-card :deep(.el-textarea__inner) { border-radius: $radius-md; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
</style>


