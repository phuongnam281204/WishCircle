import { AuthResponse, BirthdayPage, Group, NotificationLog, User, Wish } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'wishcircle_access_token';

type RequestOptions = {
  readonly body?: unknown;
  readonly method?: string;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function requestOtp(phone: string): Promise<{ readonly message: string }> {
  return request('/auth/request-otp', { body: { phone }, method: 'POST' });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResponse> {
  return request('/auth/verify-otp', { body: { code, phone }, method: 'POST' });
}

export async function setupProfile(name: string, birthday: string): Promise<AuthResponse> {
  return request('/auth/profile', { body: { birthday, name }, method: 'POST' });
}

export async function getMe(): Promise<User> {
  return request('/users/me');
}

export async function listGroups(): Promise<Group[]> {
  return request('/groups');
}

export async function getGroup(groupId: string): Promise<Group> {
  return request(`/groups/${groupId}`);
}

export async function createGroup(name: string): Promise<Group> {
  return request('/groups', { body: { name }, method: 'POST' });
}

export async function joinGroup(inviteCode: string): Promise<Group> {
  return request('/groups/join', { body: { inviteCode }, method: 'POST' });
}

export async function createWish(input: {
  readonly groupId: string;
  readonly isAnonymous: boolean;
  readonly message: string;
  readonly photoUrl?: string;
  readonly toUserId: string;
}): Promise<Wish> {
  return request('/wishes', { body: input, method: 'POST' });
}

export async function generateBirthdayPage(groupId: string, toUserId: string): Promise<BirthdayPage> {
  return request('/birthday-pages/generate', { body: { groupId, toUserId }, method: 'POST' });
}

export async function getBirthdayPage(token: string): Promise<BirthdayPage> {
  return request(`/birthday-pages/${token}`);
}

export async function listNotifications(): Promise<NotificationLog[]> {
  return request('/notifications');
}

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? 'GET',
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return (await response.json()) as TResponse;
}

async function getErrorMessage(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { readonly message?: string | string[] } | null;
  if (Array.isArray(payload?.message)) {
    return payload.message.join(', ');
  }
  return payload?.message ?? 'Request failed.';
}
