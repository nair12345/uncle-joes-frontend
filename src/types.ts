export interface Location {
  id: string;
  location_id?: string;
  city: string;
  state: string;
  address_one: string;
  address_two?: string | null;
  zip_code: string | number;
  phone_number?: string | null;
  email?: string;
  wifi?: boolean;
  drive_thru?: boolean;
  door_dash?: boolean;
  open_for_business?: boolean;
  location_map_lat?: number;
  location_map_lng?: number;
  // Hours
  hours_monday_open?: string | number | null;
  hours_monday_close?: string | number | null;
  hours_tuesday_open?: string | number | null;
  hours_tuesday_close?: string | number | null;
  hours_wednesday_open?: string | number | null;
  hours_wednesday_close?: string | number | null;
  hours_thursday_open?: string | number | null;
  hours_thursday_close?: string | number | null;
  hours_friday_open?: string | number | null;
  hours_friday_close?: string | number | null;
  hours_saturday_open?: string | number | null;
  hours_saturday_close?: string | number | null;
  hours_sunday_open?: string | number | null;
  hours_sunday_close?: string | number | null;
}

export interface MenuItem {
  id: string;
  item_id?: string;
  name: string;
  category: string;
  size: string;
  calories: number;
  price: number;
  description?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Member {
  id: string;
  email: string;
  name?: string;
  points?: number;
}

export interface Order {
  id: string;
  member_id: string;
  date: string;
  total: number;
  items: string[];
  status: string;
}

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  member: Member;
}

export interface CreateOrderRequest {
  member_id: string;
  store_id: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  menu_item_id: string;
  quantity: number;
  price: number;
  size: string;
}
