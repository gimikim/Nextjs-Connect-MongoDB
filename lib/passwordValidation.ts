export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 15
export const REPEATED_CHARACTER_REGEX = /(.)\1{2,}/

export function isPasswordLengthValid(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH
}

export function hasRepeatedCharacterSequence(password: string) {
  return REPEATED_CHARACTER_REGEX.test(password)
}

export function isPasswordSameAsUsername(password: string, username: string) {
  return password.trim().toLowerCase() === username.trim().toLowerCase()
}

export function getPasswordValidationMessage(password: string, username: string) {
  if (!isPasswordLengthValid(password)) {
    return '비밀번호는 8자 이상 15자 이하로 입력해 주세요.'
  }

  if (hasRepeatedCharacterSequence(password)) {
    return '안전을 위해 동일한 문자/숫자를 3자 이상 연속으로 사용할 수 없습니다.'
  }

  if (isPasswordSameAsUsername(password, username)) {
    return '아이디를 비밀번호로 사용할 수 없습니다.'
  }

  return ''
}

export function isPasswordValid(password: string, username: string) {
  return getPasswordValidationMessage(password, username) === ''
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  '비밀번호는 8자 이상 15자 이하로 입력하고, 동일한 문자/숫자 3자 이상 연속 사용은 피해 주세요. 또한 아이디를 비밀번호로 사용할 수 없습니다.'
