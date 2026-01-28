/**
 * RSA加密工具
 */
import JSEncrypt from 'jsencrypt'

// RSA公钥 (从环境变量获取)
const PUBLIC_KEY = import.meta.env.VITE_RSA_PUBLIC_KEY || ''

/**
 * RSA加密
 * @param text 待加密文本
 * @returns 加密后的文本，失败返回空字符串
 */
export const encryptByRsa = (text: string): string => {
  if (!text) return ''
  
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(PUBLIC_KEY)
  const encrypted = encrypt.encrypt(text)
  return encrypted || ''
}
