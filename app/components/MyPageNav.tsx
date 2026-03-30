'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MyPageNav({ isBusiness }: { isBusiness?: boolean }) {
  const pathname = usePathname()

  const navItems = [
    { name: '내 정보', href: '/mypage', icon: '👤' },
    { name: '장바구니', href: '/cart', icon: '🛒' },
    { name: '주문 / 배송 내역', href: '/mypage/orders', icon: '📦' },
    { name: '나의 리뷰 관리', href: '/mypage/reviews', icon: '⭐' },
    { name: '기본 정보 수정', href: '/mypage/edit', icon: '⚙️' },
  ]

  if (isBusiness) {
    // 사업자 계정일 때만 보이는 마이페이지 탭 추가
    navItems.push({ name: '상품 등록 (판매자)', href: '/mypage/seller/add', icon: '📝' })
    navItems.push({ name: '상품 목록 (판매자)', href: '/mypage/seller/products', icon: '📋' })
  }

  return (
    <nav className="flex flex-col p-4">
      {navItems.map((item) => {
        // 하위 경로 처리 포함 (예: /mypage/orders/123 -> orders 탭 활성화)
        const isActive = item.href === '/mypage' ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 font-bold transition-all ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[0.95rem]">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
