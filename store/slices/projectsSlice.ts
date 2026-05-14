import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectFormData, ProjectsResponse, createProjectApi, getProjectsApi, updateProjectApi, deleteProjectApi } from '@/services/projects.api';

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  totalPages: number;
  currentPage: number;
  totalProjects: number;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  totalPages: 1,
  currentPage: 1,
  totalProjects: 0,
  loading: false,
  error: null,
  success: false,
};

// Async Thunks
export const createProject = createAsyncThunk('projects/createProject', async (data: ProjectFormData, { rejectWithValue }) => {
  try {
    const response = await createProjectApi(data);
    return response.project;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create project');
  }
});

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (
    params: { page?: number; limit?: number; category?: string; search?: string; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getProjectsApi(params.page || 1, params.limit || 10, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: Partial<ProjectFormData> }, { rejectWithValue }) => {
    try {
      const response = await updateProjectApi(id, data);
      return response.project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id: string, { rejectWithValue }) => {
  try {
    await deleteProjectApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete project');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects.unshift(action.payload);
        state.totalProjects += 1;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<ProjectsResponse>) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.totalProjects = action.payload.total;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        state.totalProjects -= 1;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, setCurrentProject, clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
