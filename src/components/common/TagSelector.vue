<template>
  <div class="tag-selector">
    <div class="tags-display">
      <el-tag v-for="(tag, i) in effectiveTags" :key="i" closable :disable-transitions="false" @close="removeTag(i)">{{ tag }}</el-tag>
    </div>
    <div class="tag-input-row">
      <el-input v-model="inputVal" placeholder="输入标签并按回车添加" size="small" class="tag-input" @keyup.enter="addTag" />
      <div class="tag-suggestions">
        <button v-for="s in suggestions" :key="s" type="button" class="tag-suggestion" :class="{ used: effectiveTags.includes(s) }"
          :disabled="effectiveTags.includes(s)" @click="selectSuggestion(s)">
          {{ s }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ modelValue: { type: Array, default: () => [] }, tags: { type: Array, default: undefined } })
const emit = defineEmits(['update:modelValue'])

const effectiveTags = computed(() => props.tags ?? props.modelValue)
const inputVal = ref('')

const suggestions = ['学习', '生活', '校园', '社团', '美食', '考试', '求职', '考研', '留学', '实习', '运动', '游戏', '音乐', '摄影', '旅行']

function addTag() {
  const tag = inputVal.value.trim()
  if (tag && !effectiveTags.value.includes(tag)) emit('update:modelValue', [...effectiveTags.value, tag])
  inputVal.value = ''
}

function removeTag(index) {
  const newTags = [...effectiveTags.value]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function selectSuggestion(s) {
  if (!effectiveTags.value.includes(s)) emit('update:modelValue', [...effectiveTags.value, s])
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.tag-selector { width: 100%; }

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag-input-row { display: flex; flex-direction: column; gap: 10px; }
.tag-input { max-width: 280px; }

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-suggestion {
  padding: 5px 14px;
  border: 1px solid $color-border-light;
  border-radius: $radius-round;
  background: $color-card;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: $color-primary;
    color: $color-primary;
    background: $color-primary-subtle;
  }

  &.used {
    opacity: 0.35;
    cursor: not-allowed;
  }
}
</style>
