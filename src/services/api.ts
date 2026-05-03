import { Location, MenuItem, Member, Order, LoginResponse } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchLocations(): Promise<Location[]> {
  const url = `${API_BASE_URL}/locations`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} at ${url}`);
      throw new Error('Failed to fetch locations');
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as any).locations)) {
      return (data as any).locations;
    }
    return [];
  } catch (error) {
    console.error('Fetch error (locations):', error);
    throw error;
  }
}

export async function fetchLocationById(id: string): Promise<Location> {
  const url = `${API_BASE_URL}/locations/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    return response.json();
  } catch (error) {
    console.error(`Fetch error (location ${id}):`, error);
    throw error;
  }
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const url = `${API_BASE_URL}/menu`;
  console.log(`Fetching menu from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} at ${url}`);
      throw new Error(`Failed to fetch menu (${response.status})`);
    }
    const data = await response.json();
    console.log('Menu data received:', data);
    return data;
  } catch (error) {
    console.error('Fetch error (menu):', error);
    throw error;
  }
}

export async function fetchMenuItemById(id: string): Promise<MenuItem> {
  const url = `${API_BASE_URL}/menu/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch menu item');
    }
    return response.json();
  } catch (error) {
    console.error(`Fetch error (menu item ${id}):`, error);
    throw error;
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.[0]?.msg || errorData.detail || 'Login failed');
    }
    return response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function fetchMemberOrders(memberId: string): Promise<Order[]> {
  const url = `${API_BASE_URL}/members/${memberId}/orders`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  } catch (error) {
    console.error(`Fetch error (orders for ${memberId}):`, error);
    throw error;
  }
}

export async function fetchMemberPoints(memberId: string): Promise<{ points: number }> {
  const url = `${API_BASE_URL}/members/${memberId}/points`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch points');
    return response.json();
  } catch (error) {
    console.error(`Fetch error (points for ${memberId}):`, error);
    throw error;
  }
}
