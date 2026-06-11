import type { AuthUser } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/';
      }
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `API error: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  login(email: string, password: string, mfaCode?: string) {
    return this.request<{ accessToken: string; refreshToken: string; user: AuthUser; requiresMfa?: boolean }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password, mfaCode }) },
    );
  }

  getMe() {
    return this.request<{ user: AuthUser }>('/auth/me');
  }

  // Dashboard
  getDashboardStats() {
    return this.request<{
      totalHotels: number;
      hotelsOnline: number;
      activeGuests: number;
      checkinsToday: number;
      foreignNationals: number;
      blacklistHits: number;
      openIncidents: number;
    }>('/dashboard/stats');
  }

  getDistrictStats() {
    return this.request<Array<{
      district: string;
      state: string;
      hotels: number;
      online: number;
      active_guests: number;
    }>>('/dashboard/districts');
  }

  getRecentIncidents() {
    return this.request<Array<Record<string, unknown>>>('/dashboard/incidents/recent');
  }

  // Guests
  getGuests(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ data: Array<Record<string, unknown>>; meta: { total: number } }>(`/guests${qs}`);
  }

  registerGuest(data: Record<string, unknown>) {
    return this.request('/guests', { method: 'POST', body: JSON.stringify(data) });
  }

  // Hotels
  getHotels() {
    return this.request<{ data: Array<Record<string, unknown>> }>('/hotels');
  }

  getAllHotelsAdmin() {
    return this.request<{ data: Array<Record<string, unknown>> }>('/hotels/admin/all');
  }

  getPendingHotels() {
    return this.request<{ data: Array<Record<string, unknown>> }>('/hotels/pending');
  }

  registerHotel(data: Record<string, unknown>) {
    return this.request<{ message: string; hotelId: string; status: string }>(
      '/hotels/register',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  approveHotel(id: string) {
    return this.request(`/hotels/${id}/approve`, { method: 'POST' });
  }

  rejectHotel(id: string, reason: string) {
    return this.request(`/hotels/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  updateHotel(id: string, data: Record<string, unknown>) {
    return this.request(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Data access requests
  createDataRequest(data: Record<string, unknown>) {
    return this.request('/data-requests', { method: 'POST', body: JSON.stringify(data) });
  }

  getMyDataRequests() {
    return this.request<{ data: Array<Record<string, unknown>> }>('/data-requests/my');
  }

  getDataRequests(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request<{ data: Array<Record<string, unknown>> }>(`/data-requests${qs}`);
  }

  approveDataRequest(id: string, reviewNotes?: string) {
    return this.request(`/data-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes }),
    });
  }

  rejectDataRequest(id: string, reviewNotes?: string) {
    return this.request(`/data-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes }),
    });
  }

  getRequestData(id: string) {
    return this.request<{ request: Record<string, unknown>; guests: Array<Record<string, unknown>>; count: number }>(
      `/data-requests/${id}/data`,
    );
  }

  // Watchlist
  getWatchlist(source?: string) {
    const qs = source ? `?source=${source}` : '';
    return this.request<{ data: Array<Record<string, unknown>> }>(`/watchlist${qs}`);
  }

  addWatchlistEntry(data: Record<string, unknown>) {
    return this.request('/watchlist', { method: 'POST', body: JSON.stringify(data) });
  }

  importWatchlist(data: { apiUrl: string; apiKey?: string; defaultSource?: string }) {
    return this.request<{ imported: number; records: Array<Record<string, unknown>> }>(
      '/watchlist/import',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  // AI Search
  aiSearch(query: string) {
    return this.request<{
      query: string;
      interpretation: string;
      count: number;
      results: Array<Record<string, unknown>>;
    }>('/ai/search', { method: 'POST', body: JSON.stringify({ query }) });
  }

  // Analytics
  getAnalytics(period: string) {
    return this.request<{
      period: string;
      total: number;
      byGender: Array<{ gender: string; count: string }>;
      byNationality: Array<{ nationality: string; count: string }>;
      dailyTrend: Array<{ date: string; count: string }>;
    }>(`/analytics/report?period=${period}`);
  }

  // Incidents
  getIncidents() {
    return this.request<{ data: Array<Record<string, unknown>> }>('/incidents');
  }
}

export const api = new ApiClient();
