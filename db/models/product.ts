import mongoose, { Schema, Document } from 'mongoose'

// 상품 옵션의 구조를 정의합니다 (예: size: ["S", "M", "L"])
export interface IProductOption {
  name: string
  values: string[]
}

// 스키마 타입을 위한 인터페이스 선언
export interface IProduct extends Document {
  name: string // 상품명
  brand: string // 브랜드명
  price: number // 정가
  discount: number // 할인율 (%)
  description: string // 상품 상세 설명
  stock: number // 재고 수량
  category: string // 카테고리 (예: 의류, 신발 등)
  images: string[] // 상품 이미지 URL 배열
  options: IProductOption[] // 상품 옵션 정보
  isAvailable: boolean // 판매 가능 여부
  shippingFee: number // 배송비
  hasSizeGroup: boolean // 카테고리별 사이즈 표기 유무
  sellerId: mongoose.Types.ObjectId // 판매자 식별을 위한 User 모델 참조
  createdAt: Date
  updatedAt: Date
}

// 상품 데이터를 데이터베이스에 저장하기 위한 Mongoose 스키마 정의입니다.
const ProductSchema = new Schema<IProduct>(
  {
    // 판매자 정보 (User 컬렉션 참조). 상품을 등록한 사업자를 추적하기 위함.
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // 상품명: 필수 입력 항목
    name: { type: String, required: true, trim: true },

    // 브랜드명: 필수 입력 항목
    brand: { type: String, required: true, trim: true },

    // 상품의 기본 가격 (할인 전 금액)
    price: { type: Number, required: true, min: 0 },

    // 할인율 (0 ~ 100 사이의 백분율 값)
    discount: { type: Number, default: 0, min: 0, max: 100 },

    // 상품 상세 설명 텍스트
    description: { type: String, required: true },

    // 남아있는 재고 수량
    stock: { type: Number, required: true, min: 0, default: 0 },

    // 상품의 소속 카테고리 (예: '의류', '신발', '가전', '리빙' 등)
    category: { type: String, required: true },

    // 배송비 (회원이 부담하거나 설정하는 배송비)
    shippingFee: { type: Number, default: 0, min: 0 },

    // 해당 카테고리에 사이즈 표기가 필요한 상품인지 여부
    hasSizeGroup: { type: Boolean, default: false },

    // 상품을 설명하는 이미지 주소들의 배열
    images: { type: [String], default: [] },

    // 색상, 사이즈 등 선택 가능한 옵션 목록
    options: {
      type: [
        {
          name: { type: String, required: true }, // 옵션명 (예: "size")
          values: { type: [String], required: true }, // 해당 옵션의 선택값 배열 (예: ["S", "M", "L"])
        },
      ],
      default: [],
    },

    // 현재 쇼핑몰 화면에서 구매/조회 가능한 상태인지 나타내는 플래그
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true, // createdAt과 updatedAt을 자동 생성 및 관리합니다.
    collection: 'product', // MongoDB 내보낼 컬렉션 이름 지정
  }
)

// 메인 페이지 상품 검색 속도 향상 및 상품명/브랜드에 대한 인덱싱
ProductSchema.index({ name: 'text', brand: 'text' })

// 개발 환경(HMR)에서 모델이 중복 등록되어 발생하는 에러를 방지하기 위해 캐시된 모델을 지웁니다.
if (mongoose.models.Product) {
  delete mongoose.models.Product
}

// 스키마를 기반으로 Product 모델을 생성하고 모듈로 분리하여 내보냅니다.
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
