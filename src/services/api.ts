import { Location, MenuItem } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function fetchLocations(): Promise<Location[]> {
  const url = `${API_BASE_URL}/locations`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} at ${url}`);
      throw new Error('Failed to fetch locations');
    }
    return response.json();
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
