import { api } from './client'

export interface User { id: number; username: string }

export async function login(username: string, password: string): Promise<string> {
  const form = new URLSearchParams({ username, password, grant_type: 'password' })
  const { data } = await api.post<{ access_token: string }>('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data.access_token
}

export async function register(username: string, password: string): Promise<User> {
  const { data } = await api.post<User>('/auth/register', { username, password })
  return data
}
