import { Metadata } from 'next';
import { Tool } from '../../../types';
import ToolCard from '../../../components/ToolCard';
import Pagination from '../../../components/Pagination';

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

export default async function CategoryPage({ params, searchParams }: Props) {
  const currentPage = Number(searchParams.page) || 1;
  const slug = params.slug;
  
  const API_BASE_URL = process.env.SERVER_API_URL || 'http://backend:5000/api';
  const category = decodeURIComponent(slug.toString()).replace(/-/g, ' ').toLowerCase().trim();
  
  try {
    console.log('Fetching from:', `${API_BASE_URL}/tools?category=${encodeURIComponent(category)}`);
    const res = await fetch(`${API_BASE_URL}/tools?category=${encodeURIComponent(category)}`, { 
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
      firstTool: response.tools?.[0]
    });

    const tools = Array.isArray(response) ? response : (response.tools || []);

    if (tools.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">No tools found</h1>
          <p>No tools found for category: {category}</p>
          <a 
            href="/"
            className="mt-4 text-blue-600 hover:text-blue-800 inline-block"
          >
            Return to home
          </a>
        </div>
      );
    }

    const totalPages = Math.ceil(tools.length / ITEMS_PER_PAGE);
    const paginatedTools = tools.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 capitalize">
          Best AI {category} Tools
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {paginatedTools.map((tool: Tool, index: number) => (
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
        
        {tools.length > ITEMS_PER_PAGE && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={() => {}}
            />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching tools:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-600">Failed to load tools. Please try again later.</p>
        <a 
          href="/"
          className="mt-4 text-blue-600 hover:text-blue-800 inline-block"
        >
          Return to home
        </a>
      </div>
    );
  }
} 