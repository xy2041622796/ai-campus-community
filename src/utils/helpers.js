export function studentIdToEmail(studentId) {
  return `s${studentId}@campus.auth`
}

export function getStorageUrl(bucket, path) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 生成 AI 推荐理由
export function generateRecommendReason(post, currentUser) {
  const reasons = []

  if (post.matched_topics?.length) {
    reasons.push('因为你关注了' + post.matched_topics.slice(0, 2).join('、'))
  }
  if (post.matched_intent) {
    reasons.push('你喜欢' + (post.intent || '') + '类型的帖子')
  }
  if (post.matched_emotion) {
    reasons.push('情绪偏好匹配')
  }
  if (post.author?.college && currentUser?.college === post.author.college) {
    reasons.push('来自同校')
  }
  if (post.rank_score > 0.7) {
    reasons.push('高度匹配')
  }

  if (reasons.length === 0) return null
  return reasons.slice(0, 2).join(' · ')
}

// 生成用户推荐理由
export function generateUserReason(relationships, currentUser, targetUser) {
  const reasons = []

  if (relationships?.relationships) {
    for (const rel of relationships.relationships) {
      if (rel === 'common_tags') reasons.push('共同兴趣')
      else if (rel === 'same_college') reasons.push('同校')
      else if (rel === 'mutual_like') reasons.push('共同喜欢的帖子')
      else if (rel === 'follower') reasons.push('关注了你')
      else if (rel === 'mutual_follow') reasons.push('互相关注')
    }
  }

  if (targetUser.college && currentUser?.college === targetUser.college) {
    reasons.push('同校同学')
  }

  if (reasons.length === 0) return null
  return reasons.slice(0, 3).join(' · ')
}
