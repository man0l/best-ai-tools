'use client';
import { useState, useCallback } from 'react';
import { Tool } from '../types';
import Hero from './Hero';
import ToolCard from './ToolCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import Pagination from './Pagination';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

interface ClientHomeContentProps {
  initialTools: Tool[];
  initialCategories: string[];
  initialPagination: PaginationData;
  initialPage: number;
  selectedCategory: string;
}

export default function ClientHomeContent({ 
  initialTools, 
  initialCategories,
  initialPagination,
  initialPage,
  selectedCategory: initialSelectedCategory
}: ClientHomeContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);

  // Function to create URL with search params
  const createUrl = useCallback((page: number, category?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Handle page parameter
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    // Handle category parameter
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    return `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [pathname, searchParams]);

  const handlePageChange = (page: number) => {
    if (!searchQuery) {
      router.push(createUrl(page, initialSelectedCategory), { scroll: false });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = initialTools.filter(tool =>
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools([]);
    }
  };

  const handleCategoryChange = (category: string) => {
    router.push(createUrl(1, category), { scroll: false });
  };

  const handleHomeClick = () => {
    setSearchQuery('');
    setFilteredTools([]);
    router.push('/');
  };

  const displayTools = searchQuery ? filteredTools : initialTools;

  return (
    <>
      <Hero onHomeClick={handleHomeClick} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar onSearch={handleSearch} />
          <CategoryFilter
            categories={initialCategories}
            selectedCategory={initialSelectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto mt-8">
          {displayTools.map((tool, index) => (
            <ToolCard
              key={`${tool.title}-${index}`}
              title={tool.title}
              description={tool.description}
              imageUrl={tool.imageUrl}
              category={tool.filter1}
              url={tool.url}
              tags={tool.Tags ? tool.Tags.split(',') : []}
              rank={tool.rank}
            />
          ))}
        </div>
        
        {!searchQuery && displayTools.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={initialPagination.currentPage}
              totalPages={initialPagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </>
  );
} 