<template>
  <div class="create-event-page">
    <div class="ce-header">
      <button class="back-btn" @click="router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回
      </button>
      <h1 class="ce-title">编辑活动</h1>
    </div>
    <div v-if="loading" class="ce-loading"><div class="ce-spinner"></div></div>
    <div v-else class="ce-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="活动动标标" prop="title">
          <el-input v-model="form.title" placeholder="给你的活动叫个什么" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="活动描绍" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描绍一下你的活动" maxlength="500" show-word-limit />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="活动时间" prop="event_date">
            <el-date-picker v-model="form.event_date" type="datetime" placeholder="选括活动时间" style="width:100%" />
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="地点">
            <el-input v-model="form.location" placeholder="活动地点" />
          </el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="人数限制">
            <el-select v-model="form.max_participants" style="width:100%">
              <el-option :value="0" label="不限" />
              <el-option :value="10" label="10\u4eba" /><el-option :value="20" label="20\u4eba" /><el-option :value="50" label="50\u4eba" /><el-option :value="100" label="100\u4eba" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="截止时间">
            <el-date-picker v-model="form.deadline" type="datetime" placeholder="选括截止时间" style="width:100%" />
          </el-form-item></el-col>
        </el-row>
        <el-form-item>
          <div class="ce-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">保存保存</el-button>
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
import { useEventStore } from '@/stores/event'
import { supabase } from '@/api/supabase'

const route = useRoute(); const router = useRouter()
const store = useEventStore()
const formRef = ref(null); const submitting = ref(false); const loading = ref(true)
const form = reactive({ title: '', description: '', event_date: null, location: '', max_participants: 0, deadline: null })
const rules = { title: [{ required: true, message: '请输输入称', trigger: 'blur' }], description: [{ required: true, message: '请输输入描绍', trigger: 'blur' }], event_date: [{ required: true, message: '请输输选括时间', trigger: 'change' }] }

async function loadEvent() {
  const { data } = await supabase.from('events').select('*').eq('id', route.params.id).single()
  if (data) { Object.assign(form, { title: data.title, description: data.description, event_date: data.event_date, location: data.location || '', max_participants: data.max_participants, deadline: data.deadline }) }
  loading.value = false
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return; submitting.value = true
  try {
    const { error } = await supabase.from('events').update({
      title: form.title, description: form.description, event_date: form.event_date,
      location: form.location, max_participants: form.max_participants, deadline: form.deadline
    }).eq('id', route.params.id)
    if (error) throw error
    ElMessage.success('保存成功!')
    router.push('/events/' + route.params.id)
  } catch (e) { ElMessage.error(e.message || '保存失败') }
  finally { submitting.value = false }
}

onMounted(loadEvent)
</script>
<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
.create-event-page { animation: pageFadeIn 0.4s ease; max-width: 640px; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ce-header { margin-bottom: 20px; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border: 1px solid $color-border-light; border-radius: $radius-md; background: $color-card; color: $color-text-secondary; cursor: pointer; font-size: $font-size-sm; margin-bottom: 12px; }
.back-btn:hover { color: $color-primary; border-color: $color-primary; } .back-btn svg { stroke: currentColor; }
.ce-title { font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; margin: 0; }
.ce-loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }
.ce-spinner { width: 32px; height: 32px; border: 3px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ce-card { background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-xl; padding: 28px; }
.ce-actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>
