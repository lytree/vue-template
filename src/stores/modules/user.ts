import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface UserInfo {
  name: string
  email: string
  roles: string[]
}

/** 当前登录用户（示例数据，真实项目替换为接口获取） */
export const useUserStore = defineStore('user', () => {
  const info = ref<UserInfo>({
    name: '林晚',
    email: 'wan.lin@example.com',
    roles: ['admin'],
  })

  /** 头像兜底：取名字后两位 */
  const initials = computed(() => info.value.name.slice(-2))

  const isAdmin = computed(() => info.value.roles.includes('admin'))

  function setInfo(next: UserInfo) {
    info.value = next
  }

  function reset() {
    info.value = { name: '未登录', email: '', roles: [] }
  }

  return { info, initials, isAdmin, setInfo, reset }
})
