import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      {/* 1. 상단 링크 바 */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            <li>
              <Link href="#" className="transition hover:text-blue-600">
                회사소개
              </Link>
            </li>
            <li>
              <Link href="#" className="transition hover:text-blue-600">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="#" className="font-bold text-slate-900 transition hover:text-blue-600">
                개인정보처리방침
              </Link>
            </li>
            <li>
              <Link href="#" className="transition hover:text-blue-600">
                고객센터(CS)
              </Link>
            </li>
            <li>
              <Link href="#" className="transition hover:text-blue-600">
                제휴문의
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. 메인 푸터 정보 영역 */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          {/* 고객센터 */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="mb-4 text-2xl font-black tracking-tighter text-blue-600">CONNECT</h2>
            <div className="mb-6 flex flex-col gap-1">
              <strong className="text-3xl font-black text-slate-900">1588-0000</strong>
              <span className="text-sm font-medium text-slate-500">평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</span>
              <span className="text-sm font-medium text-slate-500">주말 및 공휴일 휴무</span>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                1:1 문의하기
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
                FAQ 보러가기
              </button>
            </div>
          </div>

          {/* 퀵 링크 1 */}
          <div className="col-span-1">
            <h3 className="mb-4 font-bold text-slate-900">쇼핑 가이드</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  회원가입/멤버십
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  주문/결제 안내
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  배송조회
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  반품/교환/환불
                </Link>
              </li>
            </ul>
          </div>

          {/* 퀵 링크 2 */}
          <div className="col-span-1">
            <h3 className="mb-4 font-bold text-slate-900">서비스</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  이벤트/혜택
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  기획전
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  리뷰 모아보기
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-blue-600">
                  오프라인 매장 안내
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. 하단 기업 정보 및 카피라이트 */}
        <div className="mt-12 border-t border-slate-100 pt-8 text-xs leading-relaxed text-slate-500">
          <p className="mb-3">
            (주)커넥트<span className="mx-2 text-slate-300">|</span>대표이사: 홍길동
            <span className="mx-2 text-slate-300">|</span>서울특별시 강남구 테헤란로 123 커넥트타워 15층
          </p>
          <p className="mb-3">
            사업자등록번호: 123-45-67890{' '}
            <Link href="#" className="ml-1 font-medium text-slate-600 underline">
              사업자정보확인
            </Link>
            <span className="mx-2 text-slate-300">|</span>통신판매업신고: 제 2026-서울강남-0000호
          </p>
          <p className="mb-6">
            개인정보보호책임자: 김보안(privacy@connect.com)
            <span className="mx-2 text-slate-300">|</span>호스팅서비스사업자: (주)커넥트 클라우드
          </p>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="font-medium text-slate-400">
              Copyright © {new Date().getFullYear()} CONNECT Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-slate-400 transition hover:text-slate-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 transition hover:text-slate-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 transition hover:text-slate-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
