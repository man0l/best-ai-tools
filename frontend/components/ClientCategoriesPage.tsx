'use client';
import Link from 'next/link';

interface Category {
  name: string;
  count: number;
}

interface ClientCategoriesPageProps {
  initialCategories: Category[];
}

export default function ClientCategoriesPage({ initialCategories }: ClientCategoriesPageProps) {
  const getFontSize = (count: number) => {
    const max = Math.max(...initialCategories.map(c => c.count));
    const min = Math.min(...initialCategories.map(c => c.count));
    const normalized = (count - min) / (max - min);
    // Font size between 1rem and 2rem
    return 1 + normalized * 1;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">AI Tool Categories</h1>
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {initialCategories.map(({ name, count }) => {
            const fontSize = getFontSize(count);
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            return (
              <Link
                key={name}
                href={`/category/${slug}`}
                className="inline-block transition-all duration-200 hover:text-accent-foreground"
                style={{
                  fontSize: `${fontSize}rem`,
                  opacity: 0.7 + (fontSize - 1) * 0.3
                }}
              >
                <span className="hover:underline">{name}</span>
                <span className="text-xs ml-1 text-muted-foreground">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 