import Link from 'next/link'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import LogoutButton from './components/LogoutButton'
import ProductGrid from './components/ProductGrid'

// 샘플 상품 데이터 리스트 (8종)
const products = [
  {
    id: 1,
    name: '시그니처 오버핏 트렌치 코트',
    brand: 'MODERN',
    category: '의류',
    price: 159000,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
  },
  {
    id: 2,
    name: '프리미엄 레더 스니커즈 블랑',
    brand: 'SNEAKERS',
    category: '신발',
    price: 89000,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
  },
  {
    id: 3,
    name: '노이즈 캔슬링 하이파이 헤드폰',
    brand: 'SOUND.X',
    category: '가전',
    price: 299000,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80',
  },
  {
    id: 4,
    name: '미니멀 세라믹 머그 잔 세트',
    brand: 'LIVING',
    category: '리빙',
    price: 25000,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
  },
  {
    id: 5,
    name: '에센셜 코튼 100% 베이직 티셔츠',
    brand: 'MODERN',
    category: '의류',
    price: 29000,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  },
  {
    id: 6,
    name: '스마트 피트니스 스포츠 워치',
    brand: 'TECH',
    category: '가전',
    price: 159000,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
  },
  {
    id: 7,
    name: '빈티지 워싱 와이드 데님 팬츠',
    brand: 'STYLE',
    category: '의류',
    price: 59000,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
  },
  {
    id: 8,
    name: '천연 유기농 아로마 디퓨저',
    brand: 'HOME',
    category: '리빙',
    price: 35000,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1608528577891-eb05fcd393ed?w=600&q=80',
  },
]

export default function Home() {
  // 쿠키에서 jwt 토큰을 가져와 로그인(세션) 여부를 아주 빠르게 파악합니다. (서버 사이드 렌더링)
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  let user: { username: string; role: string } | null = null

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
      user = jwt.verify(token, jwtSecret) as { username: string; role: string }
    } catch {
      // 잘못되거나 만료된 토큰의 경우 무시합니다.
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 1. 글로벌 네비게이션 헤더 (GNB) */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
              CONNECT
            </Link>
            <nav className="hidden gap-6 text-[0.95rem] font-semibold text-slate-600 md:flex">
              <Link href="#" className="transition hover:text-black">
                베스트
              </Link>
              <Link href="#" className="transition hover:text-black">
                신상품
              </Link>
              <Link href="#" className="flex items-center gap-1 text-blue-600 transition hover:text-blue-800">
                기획전 ⚡
              </Link>
              <Link href="#" className="transition hover:text-black">
                브랜드
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-5 text-[0.9rem] font-medium text-slate-600">
            {user ? (
              // 로그인 상태일 때
              <div className="flex items-center gap-5">
                <span className="text-slate-800">
                  <strong className="mr-1 font-bold text-black">{user.username}</strong>님
                </span>
                <Link href="#" className="transition hover:text-black">
                  장바구니(0)
                </Link>
                <Link href="/mypage" className="transition hover:text-black">
                  마이페이지
                </Link>
                <LogoutButton />
              </div>
            ) : (
              // 비로그인 상태일 때
              <div className="flex items-center gap-5">
                <Link href="/auth?type=login" className="transition hover:text-black">
                  로그인
                </Link>
                <Link href="/auth?type=sign-up" className="transition hover:text-black">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. 메인 배너 영역 (Hero) */}
      <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
        {/* 장식용 원형 배경 */}
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-12 translate-x-1/3 rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-purple-100/50 blur-3xl"></div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center">
          <span className="mb-2 text-sm font-bold tracking-widest text-blue-600">2026 FALL COLLECTION</span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            나를 완성하는
            <br />
            가장 완벽한 쇼핑
          </h1>
          <p className="mb-4 mt-2 max-w-lg text-lg text-slate-500 md:text-xl">
            CONNECT에서 엄선한 최고의 브랜드와 트렌디한 아이템들을 지금 바로 만나보세요.
          </p>
          <div className="mt-2">
            <Link
              href="#"
              className="inline-block transform rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              프리미엄 기획전 구경하기
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 진열 상품 플로팅 컴포넌트 (Product Grid - Client Component) */}
      <ProductGrid products={products} />

      {/* 심플 푸터 */}
      <footer className="mt-10 border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400">
          &copy; 2026 CONNECT PLATFORM. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
