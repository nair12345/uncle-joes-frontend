import { Location, MenuItem, Member, Order, LoginResponse, CreateOrderRequest } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond.');
    }
    throw error;
  }
}

export async function fetchLocations(): Promise<Location[]> {
  const url = `${API_BASE_URL}/locations`;
  try {
    const response = await fetchWithTimeout(url);
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
    const response = await fetchWithTimeout(url);
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
    const response = await fetchWithTimeout(url);
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
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Failed to fetch menu item');
    }
    return response.json();
  } catch (error) {
    console.error(`Fetch error (menu item ${id}):`, error);
    throw error;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('uj_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/login`;
  console.log(`Attempting login at: ${url} for ${email}`);
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`Login failed with status ${response.status}:`, data);
      
      let errorMessage = 'Login failed';
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err: any) => 
          err.msg || (typeof err === 'string' ? err : JSON.stringify(err))
        ).join(', ');
      } else if (data.detail) {
        errorMessage = String(data.detail);
      } else if (data.error) {
        errorMessage = String(data.error);
      } else if (data.message) {
        errorMessage = String(data.message);
      }

      // Special handling for common BigQuery errors even at login stage
      if (errorMessage.includes('403 Access Denied') || errorMessage.includes('permission')) {
        errorMessage = `BigQuery Permission Error: The API doesn't have permission to access your account data. \n\nPlease ensure both 'BigQuery Data Editor' and 'BigQuery User' roles are granted to: 374670707835-compute@developer.gserviceaccount.com in project mgmt-545-coffee-shop-project`;
      }
      
      throw new Error(errorMessage);
    }

    console.log('Login response received:', data);

    // Robust normalization of the member object and ID based on backend shape
    if (data.member) {
      // Normalize member_id to id for frontend consistency
      data.member.id = data.member.member_id || data.member.id;
      
      // Combine first/last names if present
      if (data.member.first_name || data.member.last_name) {
        const name = `${data.member.first_name || ''} ${data.member.last_name || ''}`.trim();
        if (name) data.member.name = name;
      }
    } else {
      // Fallback if member is missing
      const id = data.member_id || data.id || data.userId || data.member?.id;
      data.member = data.member || {};
      data.member.id = id;
      data.member.email = data.member.email || email;
      data.member.name = data.member.name || data.name || email.split('@')[0];
    }

    console.log('Normalized member data:', data.member);
    return data;
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
}

export async function fetchMemberOrders(memberId: string): Promise<Order[]> {
  if (!memberId || memberId === 'undefined' || memberId === 'null') {
    console.error('Invalid memberId provided to fetchMemberOrders:', memberId);
    return [];
  }
  const url = `${API_BASE_URL}/members/${memberId}/orders`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to fetch orders';
      if (errorData.detail) errorMessage = String(errorData.detail);
      else if (errorData.error) errorMessage = String(errorData.error);
      
      if (errorMessage.includes('403 Access Denied') || errorMessage.includes('permission')) {
        errorMessage = `BigQuery Permission Error: The API doesn't have permission to read your BigQuery data. \n\nIMPORTANT: You need TWO roles granted to the service account:\n1. 'BigQuery Data Editor' (to write data)\n2. 'BigQuery User' (to run queries)\n\nGrant these to: 374670707835-compute@developer.gserviceaccount.com\n\nIn Project: 'mgmt-545-coffee-shop-project'`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    console.log('Exact orders URL:', url);
    console.log('Raw orders response:', data);
    
    // Return and normalize data.orders as requested
    if (data && Array.isArray(data.orders)) {
      return data.orders.map((order: any) => ({
        id: order.order_id || order.id,
        date: order.order_date || order.date,
        total: order.order_total || order.total,
        member_id: order.member_id,
        status: order.status || 'Completed',
        items: order.line_items ? order.line_items.map((li: any) => li.item_name || li.name) : (order.items || [])
      }));
    }
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    console.error(`Fetch error (orders for ${memberId}):`, error);
    throw error;
  }
}

export async function fetchMemberPoints(memberId: string): Promise<number> {
  if (!memberId || memberId === 'undefined' || memberId === 'null') {
    console.error('Invalid memberId provided to fetchMemberPoints:', memberId);
    return 0;
  }
  const url = `${API_BASE_URL}/members/${memberId}/points`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to fetch points';
      if (errorData.detail) errorMessage = String(errorData.detail);
      else if (errorData.error) errorMessage = String(errorData.error);

      if (errorMessage.includes('403 Access Denied') || errorMessage.includes('permission')) {
        errorMessage = `BigQuery Permission Error: The API doesn't have permission to read your points data. \n\nEnsure both 'BigQuery Data Editor' and 'BigQuery User' roles are granted.`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    console.log('Exact points URL:', url);
    console.log('Raw points response:', data);
    
    // Return data.points as requested
    if (data && data.points !== undefined) {
      return Number(data.points) || 0;
    }
    if (typeof data === 'number') return data;
    if (typeof data === 'string' && !isNaN(Number(data))) return Number(data);
    return 0;
  } catch (error) {
    console.error(`Fetch error (points for ${memberId}):`, error);
    throw error;
  }
}

export async function createOrder(orderRequest: CreateOrderRequest): Promise<any> {
  const url = `${API_BASE_URL}/orders`;
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderRequest)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to create order';
      
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: any) => 
          `${err.loc.join(' -> ')}: ${err.msg}`
        ).join(', ');
      } else if (errorData.detail) {
        errorMessage = String(errorData.detail);
      } else if (errorData.message) {
        errorMessage = String(errorData.message);
      } else if (errorData.error) {
        errorMessage = String(errorData.error);
      }
      
      // Special handling for common BigQuery errors
      if (errorMessage.includes('403 Access Denied') || errorMessage.includes('permission')) {
        errorMessage = `BigQuery Permission Error: The API doesn't have permission to write to your BigQuery table. 

IMPORTANT: You need TWO roles granted to the service account:
1. 'BigQuery Data Editor' (to write data)
2. 'BigQuery User' (to run queries)

Grant these roles to:
374670707835-compute@developer.gserviceaccount.com

In Project: 'mgmt-545-coffee-shop-project'`;
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
}
