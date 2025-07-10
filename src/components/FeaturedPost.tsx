import { BlogPost } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const handleClick = () => {
    window.open(post.medium_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden mb-8">
      <div className="md:flex">
        <div className="md:w-1/2 relative overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={handleClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ExternalLink className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              Featured
            </Badge>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              {post.category && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {post.category.name}
                </Badge>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(post.published_at), 'MMM d, yyyy')}
              </div>
            </div>
            
            <h2 
              className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-200"
              onClick={handleClick}
            >
              {post.title}
            </h2>
            
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {post.excerpt}
            </p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag className="h-4 w-4 text-gray-400" />
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {post.tags.length > 4 && (
                  <Badge variant="outline" className="text-gray-500">
                    +{post.tags.length - 4} more
                  </Badge>
                )}
              </div>
            )}
            
            <div 
              className="flex items-center justify-between text-blue-600 font-medium group-hover:text-blue-700 transition-colors"
              onClick={handleClick}
            >
              <span className="text-lg">Read Full Article on Medium</span>
              <ExternalLink className="h-5 w-5" />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}