import apiClient from './client';
import type { AuthResponse, User } from '../types';

export const register = (data: {
  fullname: string; email: string;
  password: string; password_confirmation: string; phone?: string;
}) => apiClient.post<AuthResponse>('/auth/register', data);

export const login = (data: {
  email: string; password: string;
}) => apiClient.post<AuthResponse>('/auth/login', data);

export const logout = () =>
  apiClient.post('/auth/logout');

export const getMe = () =>
  apiClient.get<User>('/auth/me');

export const forgotPassword = (email: string) =>
  apiClient.post('/auth/forgot-password', { email });

export const resetPassword = (data: {
  token: string; email: string;
  password: string; password_confirmation: string;
}) => apiClient.post('/auth/reset-password', data);