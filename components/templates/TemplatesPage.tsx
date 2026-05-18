'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchTemplates, updateTemplatesFilters, resetTemplatesFilters } from '@/store/slices/projectsSlice';
import { Project } from '@/services/projects.api';
import TemplatesHeader from './TemplatesHeader';
import TemplatesGrid from './TemplatesGrid';
import TemplatesFilters from './TemplatesFilters';
import Container from '@/components/layout/Container';

export default function TemplatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, templatesFilters, totalProjects, currentPage, totalPages } = useSelector(
    (state: RootState) => state.projects
  );

  const [debouncedSearch, setDebouncedSearch] = useState(templatesFilters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== templatesFilters.search) {
        dispatch(updateTemplatesFilters({ search: debouncedSearch }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearch, templatesFilters.search, dispatch]);

  // Fetch templates when filters change
  useEffect(() => {
    dispatch(fetchTemplates({
      page: 1,
      limit: 12,
      ...templatesFilters,
    }));
  }, [dispatch, templatesFilters]);

  const handlePageChange = (page: number) => {
    dispatch(fetchTemplates({
      page,
      limit: 12,
      ...templatesFilters,
    }));
  };

  const handleFilterChange = (filters: Partial<typeof templatesFilters>) => {
    dispatch(updateTemplatesFilters(filters));
  };

  const handleSearchChange = (search: string) => {
    setDebouncedSearch(search);
  };

  const handleResetFilters = () => {
    dispatch(resetTemplatesFilters());
    setDebouncedSearch('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] transition-colors duration-300">
      <Container className="py-10">
        <TemplatesHeader
          totalProjects={totalProjects}
          search={debouncedSearch}
          onSearchChange={handleSearchChange}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <aside className="lg:w-80 flex-shrink-0">
            <TemplatesFilters
              filters={templatesFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          <main className="flex-1">
            <TemplatesGrid
              projects={projects}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </Container>
    </div>
  );
}