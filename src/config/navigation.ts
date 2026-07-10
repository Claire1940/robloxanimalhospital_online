import {
	BookOpen,
	Ticket,
	GraduationCap,
	Eye,
	Wrench,
	Users,
	Trophy,
	type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航配置：7 个内容分类（codes/guide/classes/anomalies/mechanics/characters/endings）
// 顺序遵循玩法进程：兑换码 → 新手引导 → 职业 → 异常识别 → 机制 → 角色 → 结局
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Ticket, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'classes', path: '/classes', icon: GraduationCap, isContentType: true },
	{ key: 'anomalies', path: '/anomalies', icon: Eye, isContentType: true },
	{ key: 'mechanics', path: '/mechanics', icon: Wrench, isContentType: true },
	{ key: 'characters', path: '/characters', icon: Users, isContentType: true },
	{ key: 'endings', path: '/endings', icon: Trophy, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/'

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
