/**
 * [lib 폴더와 이 파일이 존재하는 이유]
 * lib(library) 폴더는 프론트엔드(화면)와 백엔드(서버/DB) 양쪽에서 공통으로 사용되는
 * 유용한 도구 함수들이나 설정값들을 모아두는 곳입니다.
 *
 * 회원가입 화면(프론트)에서 입력할 때도 비밀번호가 규칙에 맞는지 바로바로 검사해야 하고,
 * 서버(백엔드)에서도 혹시 모를 해킹 대비를 위해 한 번 더 비밀번호 규칙을 검사해야 합니다.
 * 이렇게 양쪽에서 똑같은 코드를 두 번 작성하지 않기 위해 여기에 한 번만 만들어두고 같이 가져다 씁니다.
 */

// 비밀번호의 최소 길이를 8자로 제한하는 상수입니다.
export const PASSWORD_MIN_LENGTH = 8
// 비밀번호의 최대 길이를 15자로 제한하는 상수입니다.
export const PASSWORD_MAX_LENGTH = 15
// 동일한 문자나 숫자가 3번 이상 연속으로 반복되는지 검사하기 위한 정규표현식(규칙)입니다.
// 예: "aaa123", "111qwe" 등 입력 시 패턴에 매칭됩니다.
export const REPEATED_CHARACTER_REGEX = /(.)\1{2,}/

// 1. 비밀번호 길이가 조건(8자 이상 15자 이하)에 맞는지 확인하는 함수입니다.
export function isPasswordLengthValid(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH
}

// 2. 비밀번호에 동일한 문자가 3번 연속으로 들어갔는지 검사하는 함수입니다. (정규식 사용)
export function hasRepeatedCharacterSequence(password: string) {
  return REPEATED_CHARACTER_REGEX.test(password)
}

// 3. 아이디(username)와 비밀번호가 똑같이 입력되었는지 검사하는 함수입니다.
export function isPasswordSameAsUsername(password: string, username: string) {
  // 양옆 공백을 자르고(trim) 모두 소문자로 변경(toLowerCase)해서 대소문자 상관없이 똑같은지 비교합니다.
  return password.trim().toLowerCase() === username.trim().toLowerCase()
}

// 4. 영문, 숫자, 특수문자 중 2가지 이상이 조합되었는지 검사하는 함수입니다.
export function hasTwoOrMoreCharacterTypes(password: string) {
  let typeCount = 0
  if (/[a-zA-Z]/.test(password)) typeCount++ // 영문 포함
  if (/[0-9]/.test(password)) typeCount++ // 숫자 포함
  if (/[^a-zA-Z0-9\s]/.test(password)) typeCount++ // 특수문자(공백 제외) 포함

  return typeCount >= 2
}

// 위에서 만든 1번, 2번, 3번 검사 함수들을 모두 통과하는지 확인하고,
// 실패한 경우 화면에 보여줄 '에러 메시지 텍스트'를 돌려주는 메인 검증 함수입니다.
export function getPasswordValidationMessage(password: string, username: string) {
  // 길이가 맞지 않으면 에러 메시지 반환
  if (!isPasswordLengthValid(password)) {
    return '비밀번호는 8자 이상 15자 이하로 입력해 주세요.'
  }

  // 2가지 이상 조합이 아니면 에러 메시지 반환
  if (!hasTwoOrMoreCharacterTypes(password)) {
    return '영문, 숫자, 특수문자 중 2가지 이상을 조합해 주세요.'
  }

  // 3번 이상 연속된 문자가 있으면 에러 메시지 반환
  if (hasRepeatedCharacterSequence(password)) {
    return '안전을 위해 동일한 문자/숫자를 3자 이상 연속으로 사용할 수 없습니다.'
  }

  // 아이디와 비밀번호가 같으면 에러 메시지 반환
  if (isPasswordSameAsUsername(password, username)) {
    return '아이디를 비밀번호로 사용할 수 없습니다.'
  }

  // 모든 검사를 무사히 통과했다면 에러가 없다는 뜻으로 빈 문자열('')을 반환합니다.
  return ''
}

// 에러 메시지가 비어있다면(에러가 없다면) true, 에러가 있다면 false를 돌려주는 최종 확인 함수입니다.
export function isPasswordValid(password: string, username: string) {
  return getPasswordValidationMessage(password, username) === ''
}

// 회원가입 화면 등에서 비밀번호 입력창 밑에 기본으로 보여줄 안내 문구입니다.
export const PASSWORD_REQUIREMENTS_MESSAGE =
  '영문/숫자/특수문자 중 2가지 이상을 조합하여 8~15자로 입력하고, 동일한 문자 3회 연속 사용을 피해 주세요. 아이디를 비밀번호로 사용할 수 없습니다.'
