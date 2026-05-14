'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createProject } from '@/store/slices/projectsSlice';
import { AppDispatch, RootState } from '@/store/store';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { FormFileUpload } from './FormFileUpload';
import { FormTagsInput } from './FormTagsInput';
import { FormSection } from './FormSection';
import { CloudinaryUploadResponse } from '@/services/cloudinary.service';

interface ProjectFormState {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  demoVideo: string;
  liveDemoLink: string;
  technologies: string[];
  isFeatured: boolean;
  isPublished: boolean;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  faq: Array<{ question: string; answer: string }>;
  requirements: string[];
  fileSize: string;
  version: string;
}

const initialFormState: ProjectFormState = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  price: 0,
  discountPrice: 0,
  discountPercentage: 0,
  category: '',
  tags: [],
  thumbnail: '',
  images: [],
  demoVideo: '',
  liveDemoLink: '',
  technologies: [],
  isFeatured: false,
  isPublished: false,
  status: 'draft',
  stock: -1,
  faq: [],
  requirements: [],
  fileSize: '',
  version: '',
};

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'ui-design', label: 'UI Design' },
  { value: 'ux-design', label: 'UX Design' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'video-editing', label: 'Video Editing' },
  { value: 'animation', label: 'Animation' },
  { value: 'illustration', label: 'Illustration' },
];

const TECHNOLOGIES = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'django', label: 'Django' },
  { value: 'figma', label: 'Figma' },
  { value: 'photoshop', label: 'Photoshop' },
];

export const AddProjectForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.projects);

  const [form, setForm] = useState<ProjectFormState>(initialFormState);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!form.fullDescription.trim()) errors.fullDescription = 'Full description is required';
    if (form.price < 0) errors.price = 'Price must be greater than 0';
    if (!form.category) errors.category = 'Category is required';
    if (!form.thumbnail) errors.thumbnail = 'Thumbnail is required';
    if (form.discountPercentage < 0 || form.discountPercentage > 100)
      errors.discountPercentage = 'Discount percentage must be between 0 and 100';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleThumbnailUpload = (file: CloudinaryUploadResponse | CloudinaryUploadResponse[]) => {
    if (!Array.isArray(file)) {
      setForm((prev) => ({ ...prev, thumbnail: file.secure_url }));
      setUploadingThumbnail(false);
    }
  };

  const handleImagesUpload = (files: CloudinaryUploadResponse | CloudinaryUploadResponse[]) => {
    if (Array.isArray(files)) {
      setForm((prev) => ({
        ...prev,
        images: files.map((f) => f.secure_url),
      }));
      setUploadingImages(false);
    }
  };

  const handleDemoVideoUpload = (file: CloudinaryUploadResponse | CloudinaryUploadResponse[]) => {
    if (!Array.isArray(file)) {
      setForm((prev) => ({ ...prev, demoVideo: file.secure_url }));
    }
  };

  const handleTechnologyChange = (tech: string) => {
    setForm((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }));
  };

  const handleAddFAQ = () => {
    setForm((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }],
    }));
  };

  const handleFAQChange = (index: number, field: 'question' | 'answer', value: string) => {
    setForm((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveFAQ = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(
        createProject({
          ...form,
          price: parseFloat(form.price.toString()),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice.toString()) : undefined,
          discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage.toString()) : undefined,
        })
      ).unwrap();

      router.push(`/admin/projects`);
    } catch (err: any) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <FormSection title="Basic Information" description="Enter the basic details about your project">
        <FormInput
          id="title"
          name="title"
          label="Project Title"
          placeholder="Enter project title"
          value={form.title}
          onChange={handleInputChange}
          error={validationErrors.title}
          required
        />

        <FormInput
          id="shortDescription"
          name="shortDescription"
          label="Short Description"
          placeholder="Brief description (100-200 characters)"
          value={form.shortDescription}
          onChange={handleInputChange}
          error={validationErrors.shortDescription}
          required
        />

        <FormTextarea
          id="fullDescription"
          name="fullDescription"
          label="Full Description"
          placeholder="Detailed project description"
          value={form.fullDescription}
          onChange={handleInputChange}
          error={validationErrors.fullDescription}
          rows={6}
          required
        />

        <FormSelect
          id="category"
          name="category"
          label="Category"
          value={form.category}
          onChange={handleInputChange}
          options={CATEGORIES}
          error={validationErrors.category}
          required
        />

        <FormTagsInput
          label="Tags"
          value={form.tags}
          onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
          helpText="Add relevant tags to help users find your project"
          maxTags={10}
        />
      </FormSection>

      {/* Pricing Information */}
      <FormSection title="Pricing" description="Set your project pricing and discounts">
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            id="price"
            name="price"
            label="Base Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={handleInputChange}
            error={validationErrors.price}
            required
          />

          <FormInput
            id="discountPrice"
            name="discountPrice"
            label="Discount Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.discountPrice}
            onChange={handleInputChange}
          />

          <FormInput
            id="discountPercentage"
            name="discountPercentage"
            label="Discount Percentage"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={form.discountPercentage}
            onChange={handleInputChange}
            error={validationErrors.discountPercentage}
            helpText="Enter discount as a percentage (0-100)"
          />

          <FormInput
            id="stock"
            name="stock"
            label="Stock (-1 for unlimited)"
            type="number"
            placeholder="-1"
            value={form.stock}
            onChange={handleInputChange}
          />
        </div>
      </FormSection>

      {/* Media */}
      <FormSection title="Media" description="Upload thumbnails, images, and demo video">
        <FormFileUpload
          label="Thumbnail Image"
          accept="image/*"
          required
          onChange={handleThumbnailUpload}
          uploading={uploadingThumbnail}
          folder="projecthive/thumbnails"
          helpText="Upload a high-quality thumbnail image for your project"
        />

        {form.thumbnail && (
          <div className="mt-2">
            <p className="text-xs text-slate-600 mb-2">Preview:</p>
            <img
              src={form.thumbnail}
              alt="Thumbnail preview"
              className="h-32 w-32 rounded-lg object-cover"
            />
          </div>
        )}

        <FormFileUpload
          label="Project Images"
          accept="image/*"
          multiple
          onChange={handleImagesUpload}
          uploading={uploadingImages}
          folder="projecthive/images"
          helpText="Upload additional project images (up to 10 images)"
        />

        {form.images.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-600 mb-2">Uploaded images:</p>
            <div className="grid gap-2 grid-cols-4">
              {form.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Project ${idx}`}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <FormFileUpload
          label="Demo Video"
          accept="video/*"
          onChange={handleDemoVideoUpload}
          folder="projecthive/videos"
          resourceType="video"
          helpText="Upload a demo video showcasing your project"
        />

        <FormInput
          id="liveDemoLink"
          name="liveDemoLink"
          label="Live Demo Link"
          type="url"
          placeholder="https://example.com/demo"
          value={form.liveDemoLink}
          onChange={handleInputChange}
        />
      </FormSection>

      {/* Technologies */}
      <FormSection title="Technologies" description="Select technologies used in this project">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {TECHNOLOGIES.map((tech) => (
            <label key={tech.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.technologies.includes(tech.value)}
                onChange={() => handleTechnologyChange(tech.value)}
                className="rounded border-slate-300 text-amber-600"
              />
              <span className="text-sm text-slate-700">{tech.label}</span>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Additional Information */}
      <FormSection title="Additional Information">
        <FormInput
          id="fileSize"
          name="fileSize"
          label="File Size"
          placeholder="e.g., 250 MB"
          value={form.fileSize}
          onChange={handleInputChange}
        />

        <FormInput
          id="version"
          name="version"
          label="Version"
          placeholder="1.0.0"
          value={form.version}
          onChange={handleInputChange}
        />

        <FormTagsInput
          label="Requirements"
          value={form.requirements}
          onChange={(requirements) => setForm((prev) => ({ ...prev, requirements }))}
          placeholder="Add project requirements"
          maxTags={20}
        />
      </FormSection>

      {/* FAQ */}
      <FormSection title="FAQ" description="Add frequently asked questions">
        <div className="space-y-4">
          {form.faq.map((item, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-slate-700">Question {index + 1}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveFAQ(index)}
                  className="text-sm text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>

              <FormInput
                placeholder="Enter question"
                value={item.question}
                onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
              />

              <FormTextarea
                placeholder="Enter answer"
                value={item.answer}
                onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                rows={3}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddFAQ}
            className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700"
          >
            + Add FAQ Item
          </button>
        </div>
      </FormSection>

      {/* Status Options */}
      <FormSection title="Publication Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <FormSelect
            id="status"
            name="status"
            label="Status"
            value={form.status}
            onChange={handleInputChange}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleInputChange}
                name="isFeatured"
                className="rounded border-slate-300 text-amber-600"
              />
              <span className="text-sm font-medium text-slate-700">Featured Project</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={handleInputChange}
                name="isPublished"
                className="rounded border-slate-300 text-amber-600"
              />
              <span className="text-sm font-medium text-slate-700">Published</span>
            </label>
          </div>
        </div>
      </FormSection>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-6 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
