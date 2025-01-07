import { Suspense } from 'react';
import { Tool } from '@/types';
import ClientCategoriesPage from '@/components/ClientCategoriesPage';

async function getTools() {
  try {
    const apiUrl = process.env.SERVER_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not defined');
    }

    const res = await fetch(`${apiUrl}/tools`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour since category data changes less frequently
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tools: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.tools || [];
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error; // Re-throw to handle at page level
  }
}

export default async function CategoriesPage() {
  try {
    const tools = await getTools();
    
    // Create a map to count tools per category
    const categoryMap = tools.reduce((acc: { [key: string]: number }, tool: Tool) => {
      const category = tool.filter1;
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});

    // Convert to array and sort by count
    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ClientCategoriesPage initialCategories={categories} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error rendering categories page:', error);
    return <div>Error loading categories</div>;
  }
} 