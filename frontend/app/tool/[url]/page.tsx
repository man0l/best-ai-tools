import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Tool } from '../../../types';
import RelatedTools from '../../../components/RelatedTools';

const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export async function generateMetadata({ params }: { params: { url: string } }): Promise<Metadata> {
  const { tool } = await getToolData(params.url);
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.'
    };
  }

  return {
    title: tool.title,
    description: tool.description?.substring(0, 160),
    openGraph: {
      title: tool.title,
      description: tool.description?.substring(0, 160),
      images: [tool.imageUrl],
    },
  };
}

async function getToolData(url: string) {
  try {
    const apiUrl = process.env.SERVER_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not defined');
    }

    const res = await fetch(`${apiUrl}/tools`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch tools: ${res.statusText}`);
    }

    const { tools } = await res.json();
    const foundTool = tools.find((t: Tool) => 
      t.url === url || createSlug(t.title) === url
    );

    if (!foundTool) {
      return { tool: null, relatedTools: [] };
    }

    // Find related tools from the same category
    const relatedTools = tools
      .filter((t: Tool) => 
        t.filter1 === foundTool.filter1 && // Same category
        t.title !== foundTool.title // Exclude current tool
      )
      .slice(0, 5); // Take first 5

    return { tool: foundTool, relatedTools };
  } catch (error) {
    console.error('Error fetching tool data:', error);
    throw error;
  }
}

export default async function ToolDetails({ params }: { params: { url: string } }) {
  try {
    const { tool, relatedTools } = await getToolData(params.url);

    if (!tool) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-xl mb-4">Tool not found</div>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
                Back to All Tools
              </Link>
              
              {/* Tool Info */}
              <div className="mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      {tool.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full">
                        {tool.filter1}
                      </span>
                      {tool.Tags && tool.Tags.split(',').map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  {tool.rank && (
                    <div className="text-lg text-gray-500">
                      #{tool.rank}
                    </div>
                  )}
                </div>
              </div>

              {/* Tool Image */}
              <div className="w-full mb-8">
                <div className="relative w-full h-[400px]">
                  <Image
                    src={tool.imageUrl}
                    alt={tool.title}
                    fill
                    className="object-contain rounded-lg shadow-md"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">About {tool.title}</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: tool.description }}
              />
            </div>

            {/* Related Tools Section */}
            <RelatedTools tools={relatedTools} category={tool.filter1} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ToolDetails:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl mb-4">Error loading tool details</div>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }
} 