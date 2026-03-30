import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'
import User from '@/db/models/user'
import { products } from '@/lib/data'

export async function GET() {
  await dbConnect()

  try {
    // 상품을 등록할 비즈니스(사업자) 계정을 하나 찾습니다.
    let user = await User.findOne({ user_type: 'business' })
    if (!user) {
      user = await User.findOne({})
    }

    // 만약 데이터베이스에 유저가 하나도 없다면, 더미 판매자 계정을 생성합니다.
    if (!user) {
      user = new User({
        name: '시스템 관리자',
        email: 'system_seller@example.com',
        username: 'system_seller',
        passwordHash: 'dummy',
        birthDate: '1990-01-01',
        gender: 'other',
        phoneNumber: '010-0000-0000',
        address: '시스템 주소',
        user_type: 'business',
        accountType: 'business',
      })
      await user.save()
    }

    const sellerId = user._id

    // 기존의 모든 상품 데이터를 지웁니다.
    await Product.deleteMany({})

    // lib/data.ts 에 있는 샘플 상품 객체를 데이터베이스 스키마 형태에 맞게 매핑합니다.
    const productsToInsert = products.map((p) => ({
      name: p.name,
      brand: p.brand,
      price: p.price,
      discount: p.discount,
      category: p.category,
      description: p.description || '상세 설명이 없습니다.',
      stock: 50, // 기본 재고
      images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.image],
      options: [],
      isAvailable: true,
      shippingFee: 0,
      hasSizeGroup: false,
      sellerId: sellerId,
    }))

    // 데이터베이스에 삽입합니다.
    await Product.insertMany(productsToInsert)

    return NextResponse.json({ message: `성공적으로 ${productsToInsert.length}개의 상품을 시딩(Seeding)했습니다.` })
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ message: '시딩(Seeding) 중 오류 발생', error: String(error) }, { status: 500 })
  }
}
