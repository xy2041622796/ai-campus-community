<template>
  <div class="edit-profile-page">
    <div class="page-header">
      <h1 class="page-title">编辑个人资料</h1>
      <p class="page-desc">让你的校园形象更生动</p>
    </div>

    <div class="edit-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="头像">
          <ImageUploader v-model="form.avatar_url" bucket="avatars" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" maxlength="20" show-word-limit class="edit-input" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学院" prop="college">
              <el-select v-model="form.college" style="width:100%" class="edit-input">
                <el-option v-for="col in colleges" :key="col" :label="col" :value="col" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select v-model="form.grade" style="width:100%" class="edit-input">
                <el-option v-for="g in grades" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="个人简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="介绍一下自己..." class="edit-input" />
        </el-form-item>

        <el-form-item label="兴趣标签">
          <TagSelector v-model="form.interest_tags" />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="$color-primary" :loading="profileStore.loading" @click="handleSave">保存修改</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelector from '@/components/common/TagSelector.vue'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const formRef = ref(null)

const colleges = ['计算机学院', '数学学院', '外国语学院', '经济学院', '法学院', '艺术学院', '医学院', '其他']
const grades = ['大一', '大二', '大三', '大四', '研一', '研二', '研三', '博士']

const form = reactive({
  avatar_url: '', nickname: '', college: '', grade: '', bio: '', interest_tags: []
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }, { max: 20, message: '昵称不超过20字', trigger: 'blur' }],
  college: [{ required: true, message: '请选择学院', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }]
}

onMounted(() => {
  if (authStore.user) {
    form.avatar_url = authStore.user.avatar_url || ''
    form.nickname = authStore.user.nickname || ''
    form.college = authStore.user.college || ''
    form.grade = authStore.user.grade || ''
    form.bio = authStore.user.bio || ''
    form.interest_tags = authStore.user.interest_tags || []
  }
})

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    await profileStore.updateProfile(authStore.user.id, form)
    await authStore.fetchProfile(authStore.user.id)
    ElMessage.success('保存成功！')
    router.push('/profile/' + authStore.user.id)
  } catch (e) { ElMessage.error(e.message || '保存失败') }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.edit-profile-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.page-header { border-radius: $radius-lg; }

.page-title {


  font-weight: 700;
  color: $color-primary;
  margin-bottom: 4px;
}

.page-desc {  border-radius: $radius-sm; color: $color-text-secondary; }

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

.edit-input :deep(.el-input__wrapper) { border-radius: $radius-md; }
.edit-input :deep(.el-textarea__inner) { border-radius: $radius-md; }

.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
</style>
