'use client'

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    // 로그아웃 시 장바구니 보안을 위해 캐시를 즉시 비우고 메인 페이지로 강제 리다이렉트
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('cartUpdated'))
    window.location.href = '/'
  }

  return (
    <button onClick={handleLogout} className="cursor-pointer font-medium text-slate-500 transition hover:text-black">
      로그아웃
    </button>
  )
}
