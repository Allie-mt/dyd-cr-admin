import { useUserStore } from '@/stores/user'

export function hasPermission(str: string): boolean {
  const userStore = useUserStore()
  const scopes = userStore.permissionIdList
  if (!scopes || scopes.length === 0) {
    // console.log('scopes is null init ' + str)
  } else {
    // console.log('local scopes ' + str)
  }
  // console.log('time init ', Date.now() - stime)
  if (scopes.length > 0 && scopes.indexOf(str) !== -1) {
    // console.log('has ' + str)
    return true
  } else {
    // console.log('has not ' + str)
    return false
  }
}
