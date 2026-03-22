'use client'

import { useEffect, useState } from 'react'

export default function CartCount() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const updateCount = () => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart)
        // 장바구니에 담긴 총 수량을 계산합니다.
        const totalItems = parsed.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
        setCount(totalItems)
      } catch {
        setCount(0)
      }
    } else {
      setCount(0)
    }
  }

  useEffect(() => {
    setMounted(true)
    updateCount()

    // 같은 탭 내에서 로컬스토리지 변경 시 업데이트를 위한 커스텀 이벤트
    window.addEventListener('cartUpdated', updateCount)
    // 다른 탭에서 변경 시 업데이트를 위한 스토리지 이벤트
    window.addEventListener('storage', updateCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  if (!mounted) return <span>0</span>

  return <span>{count}</span>
}
