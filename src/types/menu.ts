export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  active: boolean;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
  restaurantId: string;
}

export interface MenuFilter {
  category?: string;
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
  active?: boolean;
}

export interface MenuItemWithQuantity extends MenuItem {
  quantity: number;
}

export interface MenuStats {
  totalItems: number;
  activeItems: number;
  categories: number;
  averagePrice: number;
  popularItems: MenuItem[];
}
