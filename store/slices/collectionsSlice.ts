import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Collection,
  CollectionDetail,
  createCollectionApi,
  deleteCollectionApi,
  getCollectionByIdApi,
  getCollectionsApi,
  addProjectToCollectionApi,
  removeProjectFromCollectionApi,
  updateCollectionApi,
} from '@/services/collections.api';

export interface CollectionsState {
  collections: Collection[];
  selectedCollection: CollectionDetail | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CollectionsState = {
  collections: [],
  selectedCollection: null,
  loading: false,
  error: null,
  success: false,
};

export const fetchCollections = createAsyncThunk('collections/fetchCollections', async (_, { rejectWithValue }) => {
  try {
    return await getCollectionsApi();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to load collections');
  }
});

export const fetchCollectionById = createAsyncThunk('collections/fetchCollectionById', async (id: string, { rejectWithValue }) => {
  try {
    return await getCollectionByIdApi(id);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to load collection');
  }
});

export const createCollection = createAsyncThunk(
  'collections/createCollection',
  async (
    data: { name: string; description?: string; isPublic?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await createCollectionApi(data);
      return response.collection;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create collection');
    }
  }
);

export const updateCollection = createAsyncThunk(
  'collections/updateCollection',
  async (
    payload: { id: string; data: { name?: string; description?: string; isPublic?: boolean } },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateCollectionApi(payload.id, payload.data);
      return response.collection;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update collection');
    }
  }
);

export const deleteCollection = createAsyncThunk('collections/deleteCollection', async (id: string, { rejectWithValue }) => {
  try {
    await deleteCollectionApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete collection');
  }
});

export const addProjectToCollection = createAsyncThunk(
  'collections/addProjectToCollection',
  async (
    payload: { collectionId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await addProjectToCollectionApi(payload.collectionId, payload.projectId);
      return response.collection;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add project to collection');
    }
  }
);

export const removeProjectFromCollection = createAsyncThunk(
  'collections/removeProjectFromCollection',
  async (
    payload: { collectionId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await removeProjectFromCollectionApi(payload.collectionId, payload.projectId);
      return response.collection;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove project from collection');
    }
  }
);

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    clearCollectionsError: (state) => {
      state.error = null;
    },
    clearCollectionsSuccess: (state) => {
      state.success = false;
    },
    clearSelectedCollection: (state) => {
      state.selectedCollection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action: PayloadAction<Collection[]>) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCollectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedCollection = null;
      })
      .addCase(fetchCollectionById.fulfilled, (state, action: PayloadAction<CollectionDetail>) => {
        state.loading = false;
        state.selectedCollection = action.payload;
      })
      .addCase(fetchCollectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCollection.fulfilled, (state, action: PayloadAction<Collection>) => {
        state.loading = false;
        state.success = true;
        state.collections.unshift(action.payload);
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCollection.fulfilled, (state, action: PayloadAction<Collection>) => {
        state.loading = false;
        state.success = true;
        state.collections = state.collections.map((collection) =>
          collection._id === action.payload._id ? action.payload : collection
        );
        if (state.selectedCollection?._id === action.payload._id) {
          state.selectedCollection = {
            ...state.selectedCollection,
            name: action.payload.name,
            description: action.payload.description,
            isPublic: action.payload.isPublic,
            updatedAt: action.payload.updatedAt,
            createdAt: action.payload.createdAt,
          };
        }
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCollection.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.success = true;
        state.collections = state.collections.filter((collection) => collection._id !== action.payload);
        if (state.selectedCollection?._id === action.payload) {
          state.selectedCollection = null;
        }
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addProjectToCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addProjectToCollection.fulfilled, (state, action: PayloadAction<CollectionDetail>) => {
        state.loading = false;
        state.success = true;
        const collection = action.payload;
        state.collections = state.collections.map((item) =>
          item._id === collection._id ? { ...item, projects: collection.projects.map((project) => (typeof project === 'string' ? project : project._id)) } : item
        );
        state.selectedCollection = collection;
      })
      .addCase(addProjectToCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeProjectFromCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeProjectFromCollection.fulfilled, (state, action: PayloadAction<CollectionDetail>) => {
        state.loading = false;
        state.success = true;
        const collection = action.payload;
        state.collections = state.collections.map((item) =>
          item._id === collection._id ? { ...item, projects: collection.projects.map((project) => (typeof project === 'string' ? project : project._id)) } : item
        );
        state.selectedCollection = collection;
      })
      .addCase(removeProjectFromCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCollectionsError, clearCollectionsSuccess, clearSelectedCollection } = collectionsSlice.actions;
export default collectionsSlice.reducer;
