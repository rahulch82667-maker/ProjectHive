import axiosInstance from './api/axios';

export interface ProjectFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  demoVideo?: string;
  liveDemoLink?: string;
  technologies: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  status: 'draft' | 'published' | 'archived';
  stock?: number;
  faq: Array<{ question: string; answer: string }>;
  requirements: string[];
  fileSize?: string;
  version?: string;
}

export interface Project extends ProjectFormData {
  _id: string;
  slug: string;
  salesCount: number;
  rating: number;
  totalReviews: number;
  favoritesCount: number;
  cartCount: number;
  changelog: Array<{ version: string; date: string; notes: string }>;
  createdBy: { _id: string; name: string; email: string };
  updatedBy: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Create a new project
 */
export const createProjectApi = async (data: ProjectFormData): Promise<{ project: Project; message: string }> => {
  try {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Get all projects with pagination
 */
export const getProjectsApi = async (
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    search?: string;
    status?: string;
    tags?: string[];
    technologies?: string[];
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sortBy?: 'price' | 'rating' | 'salesCount' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }
): Promise<ProjectsResponse> => {
  try {
    const response = await axiosInstance.get('/projects', {
      params: { page, limit, ...filters },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Get project by ID
 */
export const getProjectByIdApi = async (id: string): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Get project by slug
 */
export const getProjectBySlugApi = async (slug: string): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`/projects/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Update a project
 */
export const updateProjectApi = async (
  id: string,
  data: Partial<ProjectFormData>
): Promise<{ project: Project; message: string }> => {
  try {
    const response = await axiosInstance.put(`/projects/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a project
 */
export const deleteProjectApi = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
