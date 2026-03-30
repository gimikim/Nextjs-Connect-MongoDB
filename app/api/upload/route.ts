import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    // 프론트엔드에서 'file' 이라는 이름으로 전송한 이미지를 추출합니다.
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ message: '업로드된 파일이 없습니다.' }, { status: 400 })
    }

    // 파일 데이터를 Buffer 형태로 변환합니다.
    const buffer = Buffer.from(await file.arrayBuffer())

    // 파일 이름이 겹치지 않도록 현재 시스템 시간(타임스탬프) 기반의 고유한 이름과 기존 확장자를 조합합니다.
    const timestamp = Date.now()
    const ext = path.extname(file.name) || '.jpg'
    // 영문/숫자가 아닌 파일명은 오류를 낼 수 있어서 완전히 타임스탬프 기반 이름으로 재구성합니다.
    const safeFilename = `${timestamp}${ext}`

    // 저장할 폴더 경로를 생성합니다. (프로젝트 내부의 public/uploads 폴더)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // 해당 폴더가 존재하지 않으면 자동으로 생성합니다.
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // 지정된 경로에 물리적 파일을 저장(쓰기)합니다.
    const filePath = path.join(uploadDir, safeFilename)
    await fs.writeFile(filePath, buffer)

    // 리액트 컴포넌트(img 태그)에서 접근할 수 있는 URL 경로를 생성합니다.
    const fileUrl = `/uploads/${safeFilename}`

    // 정상 저장 되었음을 알리고 URL 경로를 반환합니다.
    return NextResponse.json({ message: '업로드 성공', url: fileUrl })
  } catch (error) {
    console.error('File Upload Error:', error)
    return NextResponse.json({ message: '이미지 업로드 중 알 수 없는 오류가 발생했습니다.' }, { status: 500 })
  }
}
