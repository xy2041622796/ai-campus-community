<template>
  <div class="create-event-page">
    <div class="ce-header">
      <button class="back-btn" @click="router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回
      </button>
      <h1 class="ce-title">创建活动</h1>
    </div>

    <!-- AI 活动助手 -->
    <div v-if="!form.title" class="ai-assistant-section">
      <div class="ai-assistant-header">
        <div class="ai-assistant-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h3 class="ai-assistant-title">AI 活动助手</h3>
          <p class="ai-assistant-desc">描述你想组织的活动，AI 自动生成完整方案</p>
        </div>
      </div>
      <div class="ai-assistant-input">
        <el-input
          v-model="quickInput"
          type="textarea"
          :rows="3"
          placeholder="例如：周末想组织烧烤&#10;下周五晚上搞个电影之夜&#10;组织一场编程马拉松"
          :disabled="quickGenerating"
          @keyup.ctrl.enter="handleQuickGenerate"
        />
        <div class="ai-assistant-actions">
          <span class="ai-assistant-hint">Ctrl + Enter 快速生成</span>
          <el-button type="primary" :loading="quickGenerating" :disabled="!quickInput.trim()" @click="handleQuickGenerate">
            AI 生成活动方案
          </el-button>
        </div>
      </div>
    </div>
    <div class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="给你的活动取个名字" maxlength="50" show-word-limit />
        </el-form-item>
        <div class="ai-suggest-bar"><el-button size="small" :loading="aiStore.polishing" :disabled="!form.title.trim()" @click="handleAISuggest"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 策划活动</el-button>
          <el-button size="small" :loading="planLoading" :disabled="!form.title.trim()" @click="handleAIPlan"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> AI 完整方案</el-button></div>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述一下你的活动" maxlength="500" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="活动时间" prop="event_date">
              <el-date-picker v-model="form.event_date" type="datetime" placeholder="选择活动时间" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地点">
              <el-input v-model="form.location" placeholder="活动地点" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="人数限制">
              <el-select v-model="form.max_participants" style="width:100%">
                <el-option :value="0" label="不限人数" />
                <el-option :value="10" label="10人" />
                <el-option :value="20" label="20人" />
                <el-option :value="50" label="50人" />
                <el-option :value="100" label="100人" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间">
              <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择截止时间" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="图片">
          <ImageUploader :images="form.images" @update:images="form.images = $event" />
        </el-form-item>
        <el-form-item v-if="planResult">
          <div class="ai-plan-card">
            <div class="ai-plan-header"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 策划方案</div>
            <div class="ai-plan-content">{{ planResult }}</div>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="ce-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">创建活动</el-button>
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
import { useEventStore } from '@/stores/event'
import { useAIStore } from '@/stores/ai'
import ImageUploader from '@/components/common/ImageUploader.vue'

const router = useRouter()
const store = useEventStore()
const formRef = ref(null)
const submitting = ref(false)
const aiStore = useAIStore()
const planResult = ref(null)
const planLoading = ref(false)
const quickInput = ref("")
const quickGenerating = ref(false)

const form = reactive({
  title: '', description: '', event_date: null, location: '',
  max_participants: 0, deadline: null, images: []
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  event_date: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
}

async function handleAISuggest() {
  if (!form.title.trim()) return
  const prompt = '我想组织一个活动叫「' + form.title + '」，请帮我写一段活动描述，包括活动内容、逻辑和意义，100字左右'
  const result = await aiStore.polishContent(prompt)
  if (result) form.description = result
}


async function handleQuickGenerate() {
  if (!quickInput.value.trim()) return
  quickGenerating.value = true
  try {
    const result = await aiStore.generateEvent(quickInput.value)
    if (result) {
      form.title = result.title || ""
      form.description = result.description || ""
      form.location = result.location || ""
      if (result.eventDate) form.event_date = new Date(result.eventDate)
      if (result.maxParticipants) form.max_participants = result.max_participants
      if (result.deadline) form.deadline = new Date(result.deadline)
      ElMessage.success("AI 已生成活动方案，请检查后发布")
    } else {
      ElMessage.error("AI 生成失败，请重试")
    }
  } catch (e) {
    console.error("[Event] quick generate error:", e)
    ElMessage.error("AI 服务异常")
  } finally {
    quickGenerating.value = false
  }
}
async function handleAIPlan() {
  if (!form.title.trim()) { ElMessage.info('请先填写活动标题'); return }
  planLoading.value = true
  const details = '时间：' + (form.event_date ? new Date(form.event_date).toLocaleDateString('zh-CN') : '待定') + '，地点：' + (form.location || '待定') + '，人数：' + (form.max_participants || '不限')
  const result = await aiStore.planEvent(form.title, details)
  if (result) planResult.value = result
  planLoading.value = false
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await store.createEvent({
      title: form.title, description: form.description,
      event_date: form.event_date, location: form.location,
      max_participants: form.max_participants, deadline: form.deadline,
      images: form.images
    })
    planResult.value = null
    ElMessage.success('活动创建成功!')
    router.push('/events')
  } catch (e) { ElMessage.error(e.message || '创建失败') }
  finally { submitting.value = false }
}
</script>


/* AI 活动助手 */
.ai-assistant-section { background: linear-gradient(135deg, rgba(74,108,247,0.06), rgba(94,196,172,0.06)); border: 1px solid rgba(74,108,247,0.15); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.ai-assistant-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.ai-assistant-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.ai-assistant-title { font-size: 1.1rem; font-weight: 600; color: #1a1a2e; margin: 0 0 4px; }
.ai-assistant-desc { font-size: 0.85rem; color: #667788; margin: 0; }
.ai-assistant-input { display: flex; flex-direction: column; gap: 12px; }
.ai-assistant-input :deep(.el-textarea__inner) { border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.95rem; line-height: 1.6; resize: none; }
.ai-assistant-input :deep(.el-textarea__inner:focus) { border-color: #4A6CF7; box-shadow: 0 0 0 3px rgba(74,108,247,0.1); }
.ai-assistant-actions { display: flex; align-items: center; justify-content: space-between; }
.ai-assistant-hint { font-size: 0.8rem; color: #999; }
.ai-assistant-actions .el-button { background: linear-gradient(135deg, #4A6CF7, #5EC4AC); border: none; font-weight: 600; }
<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.create-event-page { animation: pageFadeIn 0.4s ease; max-width: 640px; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.ce-header { margin-bottom: 20px; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border: 1px solid $color-border-light; border-radius: $radius-md; background: $color-card; color: $color-text-secondary; cursor: pointer; font-size: $font-size-sm; margin-bottom: 12px; transition: $transition-fast; }
.back-btn:hover { color: $color-primary; border-color: $color-primary; }
.back-btn svg { stroke: currentColor; }
.ce-title { font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; margin: 0; }
.ce-card { background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-xl; padding: 28px; }
.ai-suggest-bar { display: flex; gap: 8px; margin-bottom: 8px; }

.ai-plan-card {
  width: 100%;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.04), rgba(94, 196, 172, 0.04));
  border: 1px solid rgba(74, 108, 247, 0.12);
  border-radius: $radius-lg;
  overflow: hidden;
}
.ai-plan-header {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  background: rgba(74, 108, 247, 0.06);
  font-size: $font-size-sm; font-weight: 600; color: $color-primary;
  svg { stroke: $color-primary; }
}
.ai-plan-content {
  padding: 16px;
  font-size: $font-size-sm;
  line-height: $line-height-relaxed;
  color: $color-text-secondary;
  white-space: pre-wrap;
}
.ce-actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>