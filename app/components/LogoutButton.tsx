'use client'

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    // 서버 컴포넌트 쿠키 상태가 갱신되도록 페이지 전체 새로고침
    window.location.reload()
  }

  return (
    <button onClick={handleLogout} className="cursor-pointer font-medium text-slate-500 transition hover:text-black">
      로그아웃
    </button>
  )
}
