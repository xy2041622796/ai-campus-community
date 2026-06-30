<template>
  <div class="create-page-wrap">
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
          <div class="content-toolbar">
            <el-button size="small" class="ai-polish-btn" :loading="polishLoading" :disabled="!form.content.trim()" @click="handlePolish"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> 润色</el-button>
          </div>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="分享你的校园故事、问题或想法..." maxlength="2000" show-word-limit />
        </el-form-item>

        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = $event" />
          <div class="ai-cover-bar"><el-button size="small" :loading="coverLoading" :disabled="!form.title.trim()" @click="handleGenerateCover"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> AI 生成封面图</el-button></div>
        </el-form-item>

        <el-form-item label="标签">
          <TagSelector :tags="form.tags" @update:modelValue="form.tags = $event" />
          <div class="ai-tag-bar"><el-button size="small" :loading="tagLoading" :disabled="!form.content.trim() && !form.title.trim()" @click="handleSuggestTags"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 生成标签</el-button></div>
        </el-form-item>

        <el-form-item>
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
  <el-dialog v-model="showPolishDialog" title="润色对比" width="90%" max-width="640px" :close-on-click-modal="false">
    <div v-if="polishResult" class="polish-compare">
      <div class="pc-col">
        <div class="pc-label">原来的文字</div>
        <div class="pc-content original">{{ polishOriginal }}</div>
      </div>
      <div class="pc-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A6CF7" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="pc-col">
        <div class="pc-label">润色后的文字</div>
        <div class="pc-content polished">{{ polishResult }}</div>
      </div>
    </div>
    <div class="dialog-footer" style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <el-button @click="polishResult = null; showPolishDialog = false">取消</el-button>
      <el-button @click="handleRePolish" :loading="polishLoading">重新润色</el-button>
      <el-button type="primary" @click="handleAcceptPolish">同意替换</el-button>
    </div>
  </el-dialog>
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
import { analyzePost } from '@/api/coze'

const router = useRouter()
const postStore = usePostStore()
const formRef = ref(null)
const submitting = ref(false)
const tagLoading = ref(false)
const coverLoading = ref(false)
const polishLoading = ref(false)
const aiStore = useAIStore()
const showPolishDialog = ref(false)
const polishOriginal = ref('')
const polishResult = ref('')

const charCount = computed(() => form.content.length)
const form = reactive({ title: '', content: '', images: [], tags: [] })
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
}

async function handlePolish() {
  if (!form.content.trim()) { ElMessage.info('请先填写正文内容'); return }
  polishLoading.value = true
  try {
    const result = await aiStore.polishContent(form.content)
    if (result && result !== form.content) {
      polishOriginal.value = form.content
      polishResult.value = result
      showPolishDialog.value = true
    }
  } finally {
    polishLoading.value = false
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
  tagLoading.value = true
  try {
    const result = await analyzePost(text)
    if (!result) { ElMessage.warning('AI 分析暂不可用，请检查网络'); return }
    const tags = result.topics || []
    if (tags.length) {
      form.tags = [...new Set([...form.tags, ...tags])]
      ElMessage.success('已生成 ' + tags.length + ' 个标签')
    } else {
      ElMessage.info('AI 未能提取到标签，试试写详细一些')
    }
  } catch (e) {
    console.error('[Tags] error:', e)
    ElMessage.error('AI 服务异常，请稍后重试')
  } finally {
    tagLoading.value = false
  }
}

async function handleGenerateCover() {
  if (!form.title.trim()) { ElMessage.info('请先填写标题'); return }
  coverLoading.value = true
  try {
    const text = (form.title + ' ' + form.content).trim()
    const analysis = await analyzePost(text)
    let prompt = analysis?.topics?.[0] || form.title
    const url = await aiStore.generateCoverImage(prompt)
    if (url) {
      form.images = [...form.images, url]
      ElMessage.success('封面图已生成')
    }
  } finally {
    coverLoading.value = false
  }
}


async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    let intent, emotion, topics, summary
    try {
      const text = (form.title + ' ' + form.content).trim()
      const structure = await analyzePost(text)
      if (structure) {
        intent = structure.intent
        emotion = structure.emotion
        topics = structure.topics
        summary = structure.summary
      }
    } catch (e) {
      console.error('[CreatePost] AI analysis skipped:', e)
    }
    await postStore.createPost({
      title: form.title,
      content: form.content,
      images: form.images,
      tags: form.tags,
      intent, emotion, topics, summary
    })
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

.polish-compare { display: flex; gap: 0; align-items: stretch; border: 1px solid $color-border-light; border-radius: $radius-lg; overflow: hidden; }
.pc-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pc-col + .pc-col { border-left: 1px solid $color-border-light; }
.pc-label { padding: 8px 14px; font-size: $font-size-xs; font-weight: 700; color: white; letter-spacing: 1px; }
.pc-col:first-child .pc-label { background: $color-text-tertiary; }
.pc-col:last-child .pc-label { background: $color-primary-gradient; }
.pc-content { flex: 1; padding: 14px; font-size: $font-size-base; line-height: $line-height-relaxed; white-space: pre-wrap; word-break: break-word; min-height: 120px; }
.pc-content.original { background: $color-card; color: $color-text-secondary; }
.pc-content.polished { background: rgba(74, 108, 247, 0.03); color: $color-text-primary; }
.pc-arrow { display: none; }
.content-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }

@media (max-width: 768px) { .polish-compare { flex-direction: column; } .pc-col + .pc-col { border-left: none; border-top: 1px solid $color-border-light; } }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
</style>
