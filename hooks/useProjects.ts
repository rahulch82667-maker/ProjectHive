import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  createProject,
  fetchProjects,
  fetchProjectById,
  updateProject,
  deleteProject,
  clearError,
  clearSuccess,
  clearCurrentProject,
} from '@/store/slices/projectsSlice';
import { ProjectFormData } from '@/services/projects.api';

interface FetchProjectsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
}

export const useProjects = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.projects);

  const createNewProject = async (data: ProjectFormData) => {
    return dispatch(createProject(data)).unwrap();
  };

  const loadProjects = async (params: FetchProjectsParams = {}) => {
    return dispatch(fetchProjects(params)).unwrap();
  };

  const loadProjectById = async (id: string) => {
    return dispatch(fetchProjectById(id)).unwrap();
  };

  const updateExistingProject = async (id: string, data: Partial<ProjectFormData>) => {
    return dispatch(updateProject({ id, data })).unwrap();
  };

  const removeProject = async (id: string) => {
    return dispatch(deleteProject(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const clearProject = () => {
    dispatch(clearCurrentProject());
  };

  return {
    // State
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    success: state.success,
    currentProject: state.currentProject,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    totalProjects: state.totalProjects,

    // Methods
    createNewProject,
    loadProjects,
    loadProjectById,
    updateExistingProject,
    removeProject,
    clear,
    clearProject,
  };
};
