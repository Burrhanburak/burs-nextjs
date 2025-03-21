export function generatePassword(length = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  // Ensure at least one character from each category
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ") // Uppercase
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz") // Lowercase
  password += getRandomChar("0123456789") // Number
  password += getRandomChar("!@#$%^&*") // Special character

  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Shuffle the password
  return shuffleString(password)
}

function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length)
  return charset[randomIndex]
}

function shuffleString(str: string): string {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}

