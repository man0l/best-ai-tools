import Image from 'next/image';

interface HeroProps {
  onHomeClick?: () => void;
}

export default function Hero({ onHomeClick }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-background py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="mb-6">
            <span className="block text-muted-foreground font-medium mb-2" onClick={onHomeClick} style={{ cursor: 'pointer' }}>AI Tools Directory</span>
            <span className="gradient-text">Discover and Compare</span>
            <span className="block mt-1">The Best AI Tools</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Explore our curated collection of AI-powered tools to enhance your workflow and boost productivity
          </p>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">100+</div>
              <div className="text-muted-foreground mt-1">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">10+</div>
              <div className="text-muted-foreground mt-1">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">1000+</div>
              <div className="text-muted-foreground mt-1">Monthly Users</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </div>
  );
} 