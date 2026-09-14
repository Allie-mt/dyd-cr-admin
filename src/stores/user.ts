import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AdminUser {
  username: string
  nickname: string
  role: string
}

const TOKEN_KEY = 'cr_admin_token'
const USER_KEY = 'cr_admin_user'

// 模拟登录接口
const MOCK_ACCOUNTS = [
  { username: 'admin', password: 'admin123', nickname: '系统管理员', role: '超级管理员' },
]

function loginApi(username: string, password: string): Promise<AdminUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = MOCK_ACCOUNTS.find(
        (item) => item.username === username && item.password === password,
      )
      if (found) {
        resolve({ username: found.username, nickname: found.nickname, role: found.role })
      } else {
        reject(new Error('账号或密码错误'))
      }
    }, 600)
  })
}

// 用户登录态
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<AdminUser | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  async function login(username: string, password: string) {
    const user = await loginApi(username, password)
    token.value = `mock-token-${Date.now()}`
    userInfo.value = user
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, userInfo, login, logout }
})
