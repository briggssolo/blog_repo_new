import { Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categorySlug: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Hash className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
      </div>
      
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          onClick={() => onCategorySelect(null)}
          className="w-full justify-start text-left"
        >
          All Articles
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "ghost"}
            onClick={() => onCategorySelect(category.slug)}
            className="w-full justify-start text-left"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}