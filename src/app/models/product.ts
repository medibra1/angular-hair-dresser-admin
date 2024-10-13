export interface IProduct {
    id: number;
    slug?: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    promo_price?: number;
    images?: string[];
    rating?: number;
    tags?: string[];
    models?: string[];
    brand?: string;
    additional_info?: string;
    reviews?: string[];
    colors?: string[];
    stock?: number;
    quantity?: number;
    selected_model?: string; 
    selected_color?: string;
    available?: boolean;
    status?: boolean,
    created_at?: Date;
    updated_at?: Date;
  }