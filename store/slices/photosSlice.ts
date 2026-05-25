import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Photo, PhotoFilters, PhotosResponse, getPhotosApi, createPhotoApi, uploadPhotoImageApi, updatePhotoApi } from '@/services/photos.api';
import { deletePhotoApi } from '@/services/photos.api';

export interface PhotosState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  filters: PhotoFilters;
  availableTags: string[];
  availableTechnologies: string[];
  uploadProgress: number;
  creating: boolean;
}

const initialState: PhotosState = {
  photos: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1,
  filters: {
    page: 1,
    limit: 12,
    sort: 'newest',
  },
  availableTags: [],
  availableTechnologies: [],
  uploadProgress: 0,
  creating: false,
};

export const fetchPhotos = createAsyncThunk<PhotosResponse, PhotoFilters | undefined>(
  'photos/fetchPhotos',
  async (filters, { rejectWithValue }) => {
    try {
      return await getPhotosApi(filters);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photos');
    }
  }
);

export const deletePhoto = createAsyncThunk<string, string>(
  'photos/deletePhoto',
  async (id, { rejectWithValue }) => {
    try {
      await deletePhotoApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete photo');
    }
  }
);

export const updatePhoto = createAsyncThunk<Photo, { id: string; data: Partial<Omit<Photo, '_id' | 'createdAt' | 'updatedAt'>> }>(
  'photos/updatePhoto',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updatePhotoApi(id, data);
      return response.photo;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update photo');
    }
  }
);

export const createPhoto = createAsyncThunk<Photo, { data: any; imageFile: File }>(
  'photos/createPhoto',
  async ({ data, imageFile }, { rejectWithValue }) => {
    try {
      // First upload image
      const uploadResult = await uploadPhotoImageApi(imageFile);
      // Then create photo with the image URL
      const photoResult = await createPhotoApi({
        ...data,
        imageUrl: uploadResult.url,
      });
      return photoResult.photo;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create photo');
    }
  }
);

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotosError: (state) => {
      state.error = null;
    },
    setPhotosFilters: (state, action: PayloadAction<PhotoFilters>) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPhotosPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
      state.currentPage = action.payload;
    },
    resetPhotosFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sort: 'newest',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload.photos;
        state.total = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.availableTags = action.payload.filters?.tags || [];
        state.availableTechnologies = action.payload.filters?.technologies || [];
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPhoto.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPhoto.fulfilled, (state, action) => {
        state.creating = false;
        state.photos.unshift(action.payload);
        state.total = state.total + 1;
      })
      .addCase(createPhoto.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      .addCase(deletePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = state.photos.filter(photo => photo._id !== action.payload);
        state.total = state.total - 1;
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePhoto.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.photos.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        }
      })
      .addCase(updatePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPhotosError, setPhotosFilters, setPhotosPage, resetPhotosFilters } = photosSlice.actions;
export default photosSlice.reducer;