import api from '../api/axios';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalUsers: number;
  totalProjects: number;
  allTimeOrders: number;
  allTimeRevenue: number;
  pendingOrders: number;
}

export interface TopProject {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  price: number;
  revenue: number;
  orders: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  _id: string;
  revenue: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  amount: number;
  createdAt: string;
  project: {
    title: string;
    slug: string;
    thumbnail: string;
  } | null;
  user: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

export interface PaymentStatusBreakdown {
  _id: string;
  count: number;
  total: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topProjects: TopProject[];
  monthlyRevenue: MonthlyRevenue[];
  revenueByCategory: CategoryRevenue[];
  recentOrders: RecentOrder[];
  paymentStatusBreakdown: PaymentStatusBreakdown[];
  period: string;
}

export const fetchAnalytics = async (period: string = 'month'): Promise<AnalyticsData> => {
  const response = await api.get('/admin/analytics', {
    params: { period },
  });
  return response.data;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};