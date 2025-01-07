'use client';

import { Tool } from '../types';
import ToolCard from './ToolCard';
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface RelatedToolsProps {
  tools: Tool[];
  category: string;
}

export default function RelatedTools({ tools, category }: RelatedToolsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(tools.length / itemsPerPage);

  if (tools.length === 0) return null;

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const startIdx = currentPage * itemsPerPage;
  const visibleTools = tools.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">More {category} Tools</h2>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleTools.map((tool, index) => (
            <ToolCard
              key={index}
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

        {/* Navigation arrows - only show if there's more than one page */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md transition-opacity ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Previous tools"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md transition-opacity ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              aria-label="Next tools"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
} 