import { Suspense } from 'react';
import ClientCategoriesPage from '@/components/ClientCategoriesPage';

async function getCategories() {
  try {
    const apiUrl = process.env.SERVER_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not defined');
    }

    const res = await fetch(`${apiUrl}/categories`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour since category data changes less frequently
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error; // Re-throw to handle at page level
  }
}

export default async function CategoriesPage() {
  try {
    const categories = await getCategories();
    
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