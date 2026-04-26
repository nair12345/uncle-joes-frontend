export interface Location {
  id: string;
  location_id?: string;
  city: string;
  state: string;
  address_one: string;
  address_two?: string | null;
  zip_code: string;
  phone_number?: string | null;
  email?: string;
  wifi?: boolean;
  drive_thru?: boolean;
  door_dash?: boolean;
  open_for_business?: boolean;
  location_map_lat?: number;
  location_map_lng?: number;
  // Hours
  hours_monday_open?: string | null;
  hours_monday_close?: string | null;
  hours_tuesday_open?: string | null;
  hours_tuesday_close?: string | null;
  hours_wednesday_open?: string | null;
  hours_wednesday_close?: string | null;
  hours_thursday_open?: string | null;
  hours_thursday_close?: string | null;
  hours_friday_open?: string | null;
  hours_friday_close?: string | null;
  hours_saturday_open?: string | null;
  hours_saturday_close?: string | null;
  hours_sunday_open?: string | null;
  hours_sunday_close?: string | null;
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
