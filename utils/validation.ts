export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateProjectForm = (data: any) => {
  const errors: Record<string, string> = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.shortDescription?.trim()) {
    errors.shortDescription = 'Short description is required';
  }

  if (!data.fullDescription?.trim()) {
    errors.fullDescription = 'Full description is required';
  }

  if (data.price === undefined || data.price < 0) {
    errors.price = 'Price must be a valid number greater than or equal to 0';
  }

  if (!data.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!data.thumbnail?.trim()) {
    errors.thumbnail = 'Thumbnail is required';
  }

  if (data.discountPercentage !== undefined && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
    errors.discountPercentage = 'Discount percentage must be between 0 and 100';
  }

  if (data.liveDemoLink && !validateUrl(data.liveDemoLink)) {
    errors.liveDemoLink = 'Live demo link must be a valid URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const calculateDiscount = (price: number, discountPercentage: number): number => {
  return parseFloat((price - (price * discountPercentage) / 100).toFixed(2));
};
