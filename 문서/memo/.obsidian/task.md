# 판매자 기능 및 상품 검색 구현 작업 목록

- [x] 1. 상품 모델(Product Model) 생성
  - [x] 요구사항(ERD)을 반영하여 `db/models/product.ts` 스키마 생성.
  - [x] 상품을 등록한 판매자(User)를 참조하는 필드(`sellerId`)를 명시적으로 추가.
  - [x] 포함할 필드: 상품명(name), 브랜드(brand), 가격(price), 할인율(discount), 상세 설명(description), 재고(stock), 카테고리(category), 이미지(images), 옵션(options), 판매 여부(isAvailable), 배송비(shippingFee), 카테고리별 사이즈 표기 유무(hasSizeGroup).

- [x] 2. 상품 관련 API 구현
  - [x] `GET /api/products`: 전체 상품 목록 반환 및 상품명 텍스트 검색 기능 지원.
  - [x] `POST /api/products`: 새로운 상품 등록 (판매자 권한 인증 필요).
  - [ ] `GET /api/products/[id]`: 단일 상품 상세 정보 조회.
  - [ ] `PUT /api/products/[id]`: 상품 정보 수정.
  - [ ] `DELETE /api/products/[id]`: 상품 삭제.

- [x] 3. 판매자 전용 UI 생성
  - [x] `app/(pages)/seller/products/page.tsx`: 판매자가 등록한 상품 목록 조회 화면.
  - [x] `app/(pages)/seller/products/new/page.tsx`: 신규 상품 등록 폼 화면.
  - [x] `app/(pages)/seller/products/[id]/edit/page.tsx`: 등록된 상품 정보 수정 폼 화면.

- [x] 4. 메인 페이지 수정 및 검색 기능 추가
  - [x] `app/page.tsx` 또는 `app/components/ProductGrid.tsx`에서 `lib/data.ts`의 더미 데이터 대신 `/api/products` API를 통해 데이터베이스 실제 데이터를 불러오도록 변경.
  - [x] `app/page.tsx` 또는 `ProductGrid.tsx`에 상품명으로 검색할 수 있는 입력 창(검색 바) 추가.
  - [x] 등록된 상품이 메인 페이지에 성공적으로 연동되는지 확인.

- [x] 5. 코드 주석 작성
  - [x] 새로 추가되거나 수정되는 모든 코드에 명확하고 상세한 한글 주석 작성.
