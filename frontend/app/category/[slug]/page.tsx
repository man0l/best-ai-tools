import { Metadata } from 'next';
import { Tool } from '../../../types';
import ToolCard from '../../../components/ToolCard';
import Link from 'next/link';

const ITEMS_PER_PAGE = 9;

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodeURIComponent(params.slug).replace(/-/g, ' ');
  return {
    title: `Best AI ${category} Tools`,
    description: `Discover the best AI ${category} tools and resources.`
  };
}

function PaginationControls({ 
  currentPage, 
  totalPages, 
  category 
}: { 
  currentPage: number; 
  totalPages: number; 
  category: string;
}) {
  const createPageURL = (pageNumber: number) => {
    return `/category/${category}${pageNumber > 1 ? `?page=${pageNumber}` : ''}`;
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      {currentPage > 1 && (
        <Link
          href={createPageURL(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </Link>
      )}
      
      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, i) => {
          const pageNumber = i + 1;
          const isCurrentPage = pageNumber === currentPage;
          
          return (
            <Link
              key={pageNumber}
              href={createPageURL(pageNumber)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isCurrentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages && (
        <Link
          href={createPageURL(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const currentPage = Number(searchParams.page) || 1;
  const slug = params.slug;
  
  const API_BASE_URL = process.env.SERVER_API_URL || 'http://backend:5000/api';
  const category = decodeURIComponent(slug.toString()).replace(/-/g, ' ').toLowerCase().trim();
  
  try {
    // Add pagination parameters to the API request
    const url = new URL(`${API_BASE_URL}/tools`);
    url.searchParams.set('category', category);
    url.searchParams.set('page', currentPage.toString());
    url.searchParams.set('limit', ITEMS_PER_PAGE.toString());

    console.log('Fetching from:', url.toString());
    const res = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('API Response Error:', {
        status: res.status,
        statusText: res.statusText,
        url: res.url
      });
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log('API Response:', {
      hasTools: !!response.tools,
      toolsCount: response.tools ? response.tools.length : 0,
      pagination: response.pagination
    });

    const tools = response.tools || [];
    const totalItems = response.pagination?.total || tools.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (tools.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">No tools found</h1>
          <p>No tools found for category: {category}</p>
          <Link 
            href="/"
            className="mt-4 text-blue-600 hover:text-blue-800 inline-block"
          >
            Return to home
          </Link>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 capitalize">
          Best AI {category} Tools
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tools.map((tool: Tool, index: number) => (
            <ToolCard
              key={tool.title || index}
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
        
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            category={encodeURIComponent(slug.toString())}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching tools:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">Failed to load tools. Please try again later.</p>
        <Link 
          href="/"
          className="mt-4 text-blue-600 hover:text-blue-800 inline-block"
        >
          Return to home
        </Link>
      </div>
    );
  }
} 