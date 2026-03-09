import { Product, EmissionLevel } from '../types';

const API_URL = '/api';

const mapProduct = (p: any): Product => ({
  ...p,
  id: p.id.toString(),
  carbonScore: p.carbon_score || 0,
  emissionLevel: (p.sustainability_level || 'Medium').toUpperCase() as EmissionLevel,
  carbonData: p.carbon_data ? JSON.parse(p.carbon_data) : {
    production: (p.carbon_score ? (100 - p.carbon_score) * 0.4 : 2),
    transport: (p.carbon_score ? (100 - p.carbon_score) * 0.3 : 1.5),
    packaging: (p.carbon_score ? (100 - p.carbon_score) * 0.2 : 1),
    usage: (p.carbon_score ? (100 - p.carbon_score) * 0.1 : 0.5),
    total: (p.carbon_score ? (100 - p.carbon_score) / 10 : 5)
  },
  brand: p.brand || 'EcoBazar',
  materials: p.materials ? JSON.parse(p.materials) : ['Sustainable Material'],
  manufactureDate: p.manufacture_date || new Date().toISOString().split('T')[0],
  expectedLifespan: p.expected_lifespan || '5 Years',
  repairabilityScore: p.repairability_score || 8.5,
  recyclingInstructions: p.recycling_instructions || 'Please recycle according to local guidelines.',
  lifecycleStages: p.lifecycle_stages ? JSON.parse(p.lifecycle_stages) : [
    { stage: 'Production', description: 'Ethically manufactured', location: 'Global', icon: 'factory' },
    { stage: 'Distribution', description: 'Carbon-neutral shipping', location: 'Global', icon: 'truck' }
  ],
  purchaseCount: p.purchase_count || 120,
  viewCount: p.view_count || 450,
  likeCount: p.like_count || 0,
  salesTrend: p.sales_trend ? JSON.parse(p.sales_trend) : [
    { month: 'Jan', sales: 45 }, { month: 'Feb', sales: 52 }, { month: 'Mar', sales: 48 }
  ],
  pointsValue: p.points_value || 50,
  priceComparison: p.price_comparison ? JSON.parse(p.price_comparison) : [],
  isVisible: p.is_visible === 1
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  return data.map(mapProduct);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) return undefined;
  const p = await response.json();
  return mapProduct(p);
};

export const getRecommendations = async (productId: string): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/recommendations/${productId}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.map(mapProduct);
};

export const calculateCarbonFootprint = async (data: {
  weight: number;
  material: string;
  usage_frequency: number;
  transport_distance: number;
}) => {
  const response = await fetch(`${API_URL}/carbon/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Calculation failed');
  return response.json();
};

export const trackActivity = async (productId: string, actionType: 'view' | 'purchase' | 'like' | 'unlike') => {
  const token = localStorage.getItem('eco_token');
  if (!token) return;

  await fetch(`${API_URL}/activity`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, action_type: actionType }),
  });
};

export const createOrder = async (orderData: { totalAmount: number; discountAmount: number; platformFee: number; items: any[] }) => {
  const token = localStorage.getItem('eco_token');
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to place order');
  }
  
  return response.json();
};

export const getActivityStats = async () => {
  const token = localStorage.getItem('eco_token');
  if (!token) return null;

  const response = await fetch(`${API_URL}/activity/stats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
};

export const getCommunityActivity = async () => {
  const response = await fetch(`${API_URL}/activity/community`);
  if (!response.ok) return [];
  return response.json();
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...product,
      carbon_score: product.carbonScore,
      emission_factor: product.emissionFactor || 0.5,
      sustainability_level: product.emissionLevel,
      manufacture_date: product.manufactureDate,
      expected_lifespan: product.expectedLifespan,
      repairability_score: product.repairabilityScore,
      recycling_instructions: product.recyclingInstructions,
      lifecycle_stages: product.lifecycleStages,
      purchase_count: product.purchaseCount,
      sales_trend: product.salesTrend,
      points_value: product.pointsValue,
      price_comparison: product.priceComparison
    }),
  });
  if (!response.ok) throw new Error('Failed to add product');
  const data = await response.json();
  return {
    ...product,
    id: data.id.toString(),
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete product');
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...product,
      carbon_score: product.carbonScore,
      emission_factor: product.emissionFactor,
      sustainability_level: product.emissionLevel,
      manufacture_date: product.manufactureDate,
      expected_lifespan: product.expectedLifespan,
      repairability_score: product.repairabilityScore,
      recycling_instructions: product.recyclingInstructions,
      lifecycle_stages: product.lifecycleStages,
      purchase_count: product.purchaseCount,
      sales_trend: product.salesTrend,
      points_value: product.pointsValue,
      price_comparison: product.priceComparison
    }),
  });
  if (!response.ok) throw new Error('Failed to update product');
};

export const getMLStatus = async () => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/ml/status`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
};

export const trainMLModel = async () => {
  const token = localStorage.getItem('eco_token');
  const response = await fetch(`${API_URL}/ml/train`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Training failed');
  return response.json();
};

export const predictCarbon = async (data: {
  weight: number;
  material: string;
  usage_frequency?: number;
  transport_distance?: number;
}) => {
  const response = await fetch(`${API_URL}/predict/carbon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Prediction failed');
  return response.json();
};
