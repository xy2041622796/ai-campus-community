<template>
  <div class="tag-selector">
    <div class="tags-display">
      <el-tag v-for="(tag, i) in modelValue" :key="i" closable :disable-transitions="false" @close="removeTag(i)">{{ tag }}</el-tag>
    </div>
    <div class="tag-input-row">
      <el-input v-model="inputVal" placeholder="输入标签并按回车添加" size="small" class="tag-input" @keyup.enter="addTag" />
      <div class="tag-suggestions">
        <button v-for="s in suggestions" :key="s" class="tag-suggestion" :class="{ used: modelValue.includes(s) }"
          :disabled="modelValue.includes(s)" @click="selectSuggestion(s)">
          {{ s }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ modelValue: { type: Array, default: () => [] }, tags: { type: Array, default: undefined } })
const emit = defineEmits(['update:modelValue'])

const tags = computed(() => props.tags ?? props.modelValue)
import { computed } from 'vue'

const inputVal = ref('')
const suggestions = ['学习', '生活', '校园', '社团', '美食', '考试', '求职', '考研', '留学', '实习', '运动', '游戏', '音乐', '摄影', '旅行']

function addTag() {
  const tag = inputVal.value.trim()
  if (tag && !tags.value.includes(tag)) emit('update:modelValue', [...tags.value, tag])
  inputVal.value = ''
}

function removeTag(index) {
  const newTags = [...tags.value]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function selectSuggestion(s) {
  if (!tags.value.includes(s)) emit('update:modelValue', [...tags.value, s])
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.tag-selector { $sidebar-width: 100%; }

.tags-display {
  $fontdisplay: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-input-row { $fontdisplay: flex; flex-direction: column; gap: 8px; }
.tag-input { max-width: 240px; }

.tag-suggestions {
  $fontdisplay: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-suggestion {
  $font-size-xs;
  padding: 3px 10px;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-round;
  $colorbackground: background: $color-card;
  $colorcolor: color: $color-text-secondary;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;

  &:hover:not(:disabled) {
    border-$colorcolor: color: $color-primary;
    $colorcolor: color: $color-primary;
    $color-primary-soft;
  }

  &.used {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
