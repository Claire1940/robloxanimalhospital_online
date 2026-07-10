import { getAllContent, CONTENT_TYPES } from '@/lib/content'
import type { ContentItem, Language } from '@/lib/content'

export interface ContentItemWithType extends ContentItem {
  contentType: string
}

/**
 * 获取最新文章（服务器端）
 * @param locale 语言
 * @param max 最大数量
 * @returns 排序后的文章列表
 */
export async function getLatestArticles(
  locale: Language,
  max: number = 30
): Promise<ContentItemWithType[]> {
  // 获取所有内容类型的文章
  const allArticles: ContentItemWithType[] = []

  for (const contentType of CONTENT_TYPES) {
    const items = await getAllContent(contentType, locale)
    allArticles.push(...items.map(item => ({ ...item, contentType })))
  }

  // 预计算更新时间，确保排序稳定
  const articlesWithMeta = allArticles.map(article => ({
    article,
    updateTime: article.frontmatter.lastModified
      ? new Date(article.frontmatter.lastModified).getTime()
      : (article.frontmatter.date ? new Date(article.frontmatter.date).getTime() : 0),
    slug: article.slug
  }))

  // 排序：更新时间降序，同时间按 slug 降序（确定性，与导航栏升序相反）
  articlesWithMeta.sort((a, b) => {
    if (a.updateTime !== b.updateTime) return b.updateTime - a.updateTime
    return b.slug.localeCompare(a.slug)
  })

  return articlesWithMeta.slice(0, max).map(x => x.article)
}
