/**
 * AI Prompt 版本管理
 * 
 * 所有 AI 调用的 Prompt 集中在此管理，方便：
 * 1. 统一调整 Prompt 质量
 * 2. 追踪 Prompt 版本变化
 * 3. A/B 测试不同 Prompt
 * 4. 快速回滚到旧版本
 */

export const PROMPTS = {
  // === 内容分析 ===
  POST_ANALYSIS: {
    version: 'v1.0',
    description: '帖子内容语义分析',
    build: (content) => ({
      role: 'user',
      content: `你是校园社区AI分析助手。请分析以下帖子内容，返回JSON格式：
{
  "intent": "分享|求助|吐槽|招募|交易",
  "emotion": "positive|negative|neutral",
  "topics": ["话题1", "话题2", "话题3"],
  "summary": "一句话总结，20字以内"
}

帖子内容：${content}

只返回JSON，不要任何解释。`
    })
  },

  // === 内容审核 ===
  MODERATION: {
    version: 'v1.0',
    description: '帖子内容合规审核',
    build: (title, content) => ({
      role: 'user',
      content: `你是校园社区内容审核员。请检查以下帖子内容是否合规。
规则：
1. 禁止广告推广（招聘、兼职、买卖等商业信息）
2. 禁止辱骂人身攻击
3. 禁止色情低俗内容
4. 禁止敏感政治言论
5. 禁止重复刷屏内容

请返回 JSON：{"passed": true/false, "reason": "不通过的原因，通过则留空"}
帖子内容：
标题：${title}
正文：${content}`
    })
  },

  // === 标签推荐 ===
  TAG_SUGGESTION: {
    version: 'v1.0',
    description: '帖子标签智能推荐',
    build: (text) => ({
      role: 'user',
      content: `根据以下帖子内容，推荐3-5个最相关的校园分类标签。只返回JSON数组格式，如["标签1","标签2","标签3"]。不要加任何解释。

${text}`
    })
  },

  // === 文本润色 ===
  POLISH: {
    version: 'v1.0',
    description: '帖子内容润色',
    build: (text) => ({
      role: 'user',
      content: `你是一个校园社区助手。请润色以下帖子内容，使其更通顺、更吸引人。保持原意和风格，只优化表达，不改变事实。直接返回润色后的结果，不要加任何解释。

${text}`
    })
  },

  // === 社区日报 ===
  DAILY_DIGEST: {
    version: 'v1.0',
    description: '社区日报生成',
    build: (data) => ({
      role: 'user',
      content: `你是一名校园社区日报编辑。请根据以下今日社区数据，生成一份生动有趣的AI社区日报。

【数据统计】
- 今日发帖数: ${data.postCount}
- 今日评论数: ${data.commentCount}
- 新注册用户: ${data.newUserCount}

【今日帖子列表】
${data.postsInfo || '- 暂无帖子'}

【活跃用户】
${data.activeUsersInfo || '- 暂无数据'}

请生成以下内容的JSON格式回复：
{
  "summary": "100字以内社区概况",
  "moodInsight": "50字以内情绪分析",
  "topics": ["话题1", "话题2", "话题3"],
  "hotPosts": [{"title": "...", "reason": "为什么火"}],
  "aiAdvice": "50字以内运营建议"
}

只输出纯JSON。`
    })
  },

  // === 话题生成 ===
  TOPIC_GENERATION: {
    version: 'v1.0',
    description: 'AI 自动生成讨论话题',
    build: (hotTopics) => {
      const topicsStr = hotTopics.length > 0
        ? `校园社区近期热门话题有：${hotTopics.map(t => t.tag).join('、')}。请基于这些话题生成 3 个讨论主题`
        : '社区最近比较冷清，请生成 3 个有趣的校园讨论主题来活跃气氛，话题要贴近大学生活'
      
      return {
        role: 'user',
        content: `${topicsStr}，每个主题包括标题和简短描述。返回 JSON 数组格式：[{"title":"...","description":"...","tags":["标签1","标签2"]}]`
      }
    }
  },

  // === 评论建议 ===
  COMMENT_SUGGESTION: {
    version: 'v1.0',
    description: 'AI 评论建议',
    build: (postContent, replyTo) => ({
      role: 'user',
      content: replyTo
        ? `有人在帖子下评论了"${replyTo}"，请生成一个简短友好的回复建议，20字以内。`
        : `以下是一篇校园帖子，请生成一个简短有趣的评论，20字以内。帖子内容：${postContent.slice(0, 200)}`
    })
  },

  // === 推荐理由 ===
  RECOMMEND_REASON: {
    version: 'v1.0',
    description: '用户推荐理由生成',
    build: (userA, userB) => ({
      role: 'user',
      content: `用户A的兴趣标签：${(userA.interest_tags || []).join(', ')}，学院：${userA.college || '未知'}
用户B的兴趣标签：${(userB.interest_tags || []).join(', ')}，学院：${userB.college || '未知'}

请用一句话解释为什么这两个人可能合得来，30字以内。直接返回结果。`
    })
  }
}

/**
 * 获取指定 Prompt 的版本信息
 * @param {string} promptName - Prompt 名称
 * @returns {Object} - { version, description }
 */
export function getPromptVersion(promptName) {
  const prompt = PROMPTS[promptName]
  if (!prompt) return null
  return { version: prompt.version, description: prompt.description }
}

/**
 * 获取所有 Prompt 的版本信息
 * @returns {Array} - Prompt 列表
 */
export function getAllPrompts() {
  return Object.entries(PROMPTS).map(([name, config]) => ({
    name,
    version: config.version,
    description: config.description
  }))
}
