import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useDigestStore = defineStore('digest', () => {
  const digest = ref(null)
  const loading = ref(false)

  // 获取当日所有帖子（用于 AI 分析）
  async function fetchTodayPosts() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:author_id(nickname, avatar_url, college, grade, bio), comments(count)')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // 获取今日评论统计
  async function fetchTodayCommentCount() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (error) throw error
    return count || 0
  }

  // 获取新注册用户数
  async function fetchNewUserCount() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, college, postCount')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (error) throw error
    return data?.length || 0
  }

  // 获取最活跃用户（今日发帖最多）
  async function fetchActiveUsers(limit = 5) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('posts')
      .select('author_id, count')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('count', { ascending: false })

    if (error) throw error

    // 按作者分组统计
    const authorCounts = {}
    for (const row of (data || [])) {
      authorCounts[row.author_id] = (authorCounts[row.author_id] || 0) + 1
    }

    const authorIds = Object.keys(authorCounts).slice(0, limit)
    if (authorIds.length === 0) return []

    const { data: authors, error: authorErr } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, college, grade')
      .in('id', authorIds)

    if (authorErr) throw authorErr

    return authors.map(a => ({
      ...a,
      postCount: authorCounts[a.id] || 0
    }))
  }

  // 调用 Agnes AI 生成日报
  async function generateDailyDigest(posts, commentCount, newUserCount, activeUsers) {
    const postsInfo = posts.slice(0, 20).map(p =>
      `- 【${p.title}】作者: ${p.author?.nickname || '未知'} | 点赞: ${p.like_count || 0} | 评论: ${p.comments?.[0]?.count || 0} | 标签: ${(p.tags || []).join(', ') || '无'}`
    ).join('\n')

    const activeUsersInfo = activeUsers.map(u =>
      `- ${u.nickname || '未知'} (${u.college || '未知学院'}) - ${u.postCount} 篇帖子`
    ).join('\n')

    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [{
            role: 'user',
            content: `你是一名校园社区日报编辑。请根据以下今日社区数据，生成一份生动有趣的AI社区日报。

【数据统计】
- 今日发帖数: ${posts.length}
- 今日评论数: ${commentCount}
- 新注册用户: ${newUserCount}

【今日帖子列表】
${postsInfo || '- 暂无帖子'}

【活跃用户】
${activeUsersInfo || '- 暂无数据'}

请生成以下内容的JSON格式回复（不要有任何其他文字说明，只输出JSON）：
{
  "summary": "一段100字以内的社区今日整体情况概述，语气轻松有趣",
  "postCount": ${posts.length},
  "commentCount": ${commentCount},
  "newUserCount": newUserCount,
  "moods": [
    {"label": "积极", "percent": 40, "colorClass": "positive"},
    {"label": "平静", "percent": 30, "colorClass": "calm"},
    {"label": "焦虑", "percent": 15, "colorClass": "anxious"},
    {"label": "兴奋", "percent": 15, "colorClass": "excited"}
  ],
  "moodInsight": "一段50字以内的情绪趋势分析",
  "topics": ["话题1", "话题2", "话题3"],
  "hotPosts": [{"id": "帖子ID", "title": "标题", "author": {"nickname": "作者名"}, "likes": 0, "comments": 0}],
  "activeUsers": [{"id": "用户ID", "nickname": "昵称", "avatar_url": "", "college": "学院", "postCount": 1}],
  "aiAdvice": "一段50字以内的社区运营建议"
}

注意：
1. hotPosts 选5个最热门的，按热度排序
2. topics 从帖子标签和内容中提取3-5个热门话题
3. moods 的 percent 总和应为100
4. moodInsight 根据帖子内容判断社区整体情绪
5. aiAdvice 基于数据分析给出运营建议
6. 只输出纯JSON，不要markdown代码块标记`
          }]
        })
      })

      if (!res.ok) throw new Error('AI 服务请求失败')
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ''

      // 清理可能的 markdown 代码块
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      return JSON.parse(cleaned)
    } catch (e) {
      console.error('[Digest] AI 生成失败:', e)
      throw e
    }
  }

  // 主函数：获取完整日报
  async function fetchDailyDigest() {
    loading.value = true
    digest.value = null
    try {
      const [posts, commentCount, newUserCount, activeUsers] = await Promise.all([
        fetchTodayPosts(),
        fetchTodayCommentCount(),
        fetchNewUserCount(),
        fetchActiveUsers(5)
      ])

      const aiDigest = await generateDailyDigest(posts, commentCount, newUserCount, activeUsers)
      digest.value = aiDigest
    } catch (e) {
      console.error('[Digest] 日报生成失败:', e)
      // 降级方案：返回静态数据
      digest.value = {
        summary: `今日社区共有 ${posts.length || 0} 篇新帖子，${commentCount || 0} 条评论，${newUserCount || 0} 位新朋友加入。`,
        postCount: posts.length || 0,
        commentCount: commentCount || 0,
        newUserCount: newUserCount || 0,
        moods: [
          { label: '积极', percent: 40, colorClass: 'positive' },
          { label: '平静', percent: 30, colorClass: 'calm' },
          { label: '焦虑', percent: 15, colorClass: 'anxious' },
          { label: '兴奋', percent: 15, colorClass: 'excited' }
        ],
        moodInsight: '社区情绪整体平稳，大家在分享日常和学习经验。',
        topics: ['校园生活', '学习分享'],
        hotPosts: [],
        activeUsers: activeUsers || [],
        aiAdvice: '鼓励更多互动，可以尝试组织一些线上话题讨论提升活跃度。'
      }
    } finally {
      loading.value = false
    }
  }

  return { digest, loading, fetchDailyDigest }
})
