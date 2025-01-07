import { Suspense } from 'react';
import { Tool } from '@/types';
import ClientHomeContent from '@/components/ClientHomeContent';

interface PaginatedResponse {
  tools: Tool[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

async function getInitialData(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Don't use page param if it's 1 or not provided
    const page = searchParams.page && Number(searchParams.page) > 1 ? Number(searchParams.page) : 1;
    const category = typeof searchParams.category === 'string' ? searchParams.category : '';
    const limit = 9;
    
    const apiUrl = process.env.SERVER_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not defined');
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (category) {
      params.set('category', category);
    }

    // Parallel fetch for better performance
    const [toolsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/tools?${params.toString()}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 30 } // Revalidate every 30 seconds for fresh data while maintaining cache
      }),
      fetch(`${apiUrl}/categories`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // Cache categories for 1 hour as they change less frequently
      })
    ]);
    
    if (!toolsRes.ok || !categoriesRes.ok) {
      throw new Error(`Failed to fetch data: ${toolsRes.statusText} ${categoriesRes.statusText}`);
    }
    
    const [toolsData, categoriesData] = await Promise.all([
      toolsRes.json(),
      categoriesRes.json()
    ]);

    // Log for debugging
    console.log('Category:', category);
    console.log('Total tools:', toolsData.pagination.total);

    return {
      tools: toolsData.tools,
      pagination: toolsData.pagination,
      categories: categoriesData.map((cat: any) => cat.name),
      selectedCategory: category
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const data = await getInitialData(searchParams);
  
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">Error loading data</h2>
        <p className="mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ClientHomeContent 
        initialTools={data.tools} 
        initialCategories={data.categories}
        initialPagination={data.pagination}
        initialPage={data.pagination.currentPage}
        selectedCategory={data.selectedCategory}
      />
    </Suspense>
  );
}
