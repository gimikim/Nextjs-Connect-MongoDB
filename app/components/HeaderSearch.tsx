'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function HeaderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParam = searchParams.get('search') || ''

  const [searchTerm, setSearchTerm] = useState(searchParam)

  useEffect(() => {
    setSearchTerm(searchParam)
  }, [searchParam])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    // 검색 시 메인 페이지로 이동하면서 파라미터 전달
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="mx-4 hidden w-full max-w-lg items-center gap-2 md:flex">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="원하시는 상품을 검색해보세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-5 pr-10 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}
