<template>
  <div class="image-uploader">
    <!-- 多图模式 (帖子图片) -->
    <template v-if="images !== undefined">
      <div class="image-grid">
        <div v-for="(img, i) in images" :key="i" class="img-preview-item">
          <img :src="img" />
          <button class="img-remove" @click="removeImage(i)">
            <svg $sidebar-width="14" $navbar-height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div v-if="images.length < maxCount" class="img-upload-cell" @click="triggerUpload">
          <input ref="fileInput" type="file" accept="image/*" multiple style="$fontdisplay:none" @change="handleMultiUpload" />
          <svg $sidebar-width="24" $navbar-height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>上传图片</span>
        </div>
      </div>
    </template>

    <!-- 单图模式 (头像) -->
    <template v-else>
      <div v-if="modelValue" class="single-preview">
        <img :src="modelValue" />
        <div class="single-overlay" @click="emit('update:modelValue', null)">
          <svg $sidebar-width="24" $navbar-height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
      </div>
      <div v-else class="single-upload" @click="triggerUpload">
        <input ref="fileInput" type="file" accept="image/*" style="$fontdisplay:none" @change="handleSingleUpload" />
        <svg $sidebar-width="24" $navbar-height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>上传头像</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

const props = defineProps({
  modelValue: { type: String, default: null },
  images: { type: Array, default: undefined },
  bucket: { type: String, default: 'post-images' },
  path: { type: String, default: '' },
  maxCount: { type: Number, default: 9 }
})
const emit = defineEmits(['update:modelValue', 'update:images'])
const fileInput = ref(null)

function triggerUpload() { fileInput.value?.click() }

async function uploadFile(file) {
  const ext = file.name.split('.').pop()
  const fileName = ${Date.now()}_.
  const filePath = props.path ? ${props.path}/ : fileName
  const { error } = await supabase.storage.from(props.bucket).upload(filePath, file)
  if (error) { console.error('Upload failed:', error); return null }
  const { data: { publicUrl } } = supabase.storage.from(props.bucket).getPublicUrl(filePath)
  return publicUrl
}

async function handleSingleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const url = await uploadFile(file)
  if (url) emit('update:modelValue', url)
  e.target.value = ''
}

async function handleMultiUpload(e) {
  const files = Array.from(e.target.files || [])
  const newImages = [...(props.images || [])]
  for (const file of files) {
    if (newImages.length >= props.maxCount) break
    const url = await uploadFile(file)
    if (url) newImages.push(url)
  }
  emit('update:images', newImages)
  e.target.value = ''
}

function removeImage(index) {
  const newImages = [...(props.images || [])]
  newImages.splice(index, 1)
  emit('update:images', newImages)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.image-uploader { $sidebar-width: 100%; }

.image-grid {
  $fontdisplay: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.img-preview-item {
  position: relative;
  $sidebar-width: 120px;
  $navbar-height: 120px;
  $radiusborder-radius: border-radius: $radius-md;
  overflow: hidden;
  $colorborder: $color-border;

  img { $sidebar-width: 100%; $navbar-height: 100%; object-fit: cover; }
}

.img-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  $sidebar-width: 24px;
  $navbar-height: 24px;
  $colorborder: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover { background: rgba(0,0,0,0.7); }
}

.img-preview-item:$shadow-hover .img-remove { opacity: 1; }

.img-upload-cell {
  $sidebar-width: 120px;
  $navbar-height: 120px;
  $colorborder: 2px dashed -border;
  $radiusborder-radius: border-radius: $radius-md;
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  $colorcolor: color: $color-text-tertiary;
  $font-size-xs;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;
  $colorbackground: background: $color-surface;

  &:$shadow&:hover {
    border-$colorcolor: color: $color-primary;
    $colorcolor: color: $color-primary;
    $color-primary-soft;
  }

  svg { stroke: currentColor; }
}

/* 单图模式 */
.single-preview {
  position: relative;
  $sidebar-width: 120px;
  $navbar-height: 120px;
  $radiusborder-radius: border-radius: $radius-lg;
  overflow: hidden;

  img { $sidebar-width: 100%; $navbar-height: 100%; object-fit: cover; }
}

.single-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.single-preview:$shadow-hover .single-overlay { opacity: 1; }

.single-upload {
  $sidebar-width: 120px;
  $navbar-height: 120px;
  $colorborder: 2px dashed -border;
  $radiusborder-radius: border-radius: $radius-lg;
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  $colorcolor: color: $color-text-secondary;
  font-size: 0.85rem;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;

  &:$shadow&:hover { border-$colorcolor: color: $color-primary; $colorcolor: color: $color-primary; }

  svg { stroke: currentColor; }
}
</style>
