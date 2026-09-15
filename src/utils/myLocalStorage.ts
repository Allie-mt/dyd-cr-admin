/**
 * 主要用来存储token，如果服务器端使用了此类机制，可不用。
 */

interface StorageData<T = any> {
	data: T
}

const myLocalStorage = {
	setData<T = any>(key: string, value: T, expired?: number): void {
		localStorage.setItem(key, JSON.stringify({ data: value }))
	},

	getData<T = any>(key: string): T | string {
		try {
			const itemValue = localStorage.getItem(key)
			if (itemValue === null) {
				return ''
			}
			const dataObj: StorageData<T> = JSON.parse(itemValue)
			return dataObj.data
		} catch (error) {
			console.log('getData error ')
			return ''
		}
	},

	removeData(key: string): void {
		localStorage.removeItem(key)
	},

	getLocalToken(): string {
		return this.getData<string>('access_token')
	},

	setLocalToken(token: string): void {
		return this.setData('access_token', token, 30 * 1440)
	},

	getRefreshToken(): string {
		return this.getData<string>('refresh_token')
	},

	setRefreshToken(token: string): void {
		return this.setData('refresh_token', token, 30 * 1440)
	},

	getLocalAvatar(): string {
		return this.getData<string>('avatar')
	},

	setLocalAvatar(avatar: string): void {
		return this.setData('avatar', avatar, 30 * 1440)
	},

	removeAll(): void {
		this.removeData('refresh_token')
		this.removeData('access_token')
		this.removeData('avatar')
	},
}

export default myLocalStorage
