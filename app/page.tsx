import Link from 'next/link'
import ProductGrid from './components/ProductGrid'
import { products } from '../lib/data' // 별도의 모듈에 분리된 상품 데이터를 불러와서 재사용합니다.

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
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
