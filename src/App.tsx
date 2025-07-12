import { useState, useEffect } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { BlogHeader } from '@/components/BlogHeader';
import { CategoryFilter } from '@/components/CategoryFilter';
import { BlogGrid } from '@/components/BlogGrid';
import { FeaturedPost } from '@/components/FeaturedPost';
import { BlogPost, Category, getBlogPosts, getCategories, searchBlogPosts } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

function BlogApp() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const { user, isAdmin } = useAuth();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when user creates new posts
  useEffect(() => {
    if (!showAdminPanel) {
      loadData();
    }
  }, [showAdminPanel]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getCategories()
      ]);
      
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load blog data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categorySlug: string | null) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(categorySlug);
      setSearchTerm(''); // Clear search when filtering by category
      
      const postsData = await getBlogPosts(categorySlug);
      setPosts(postsData);
    } catch (err) {
      setError('Failed to filter posts');
      console.error('Error filtering posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(null); // Clear category filter when searching
      
      const postsData = await searchBlogPosts(searchTerm);
      setPosts(postsData);
    } catch (err) {
      setError('Failed to search posts');
      console.error('Error searching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value === '') {
      loadData();
    }
  };

  const handleAuthClick = () => {
    setAuthDialogOpen(true);
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminPanel(true);
    }
  };

  // Show admin panel if user is admin and requested
  if (showAdminPanel && isAdmin) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  const featuredPost = posts.find(post => post.published_at === posts[0]?.published_at);
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearch}
        onAuthClick={handleAuthClick}
        onAdminClick={handleAdminClick}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Featured post */}
            {featuredPost && !loading && (
              <FeaturedPost post={featuredPost} />
            )}
            
            {/* Blog grid */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory 
                    ? `${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory} Articles`
                    : searchTerm 
                    ? `Search results for "${searchTerm}"`
                    : 'Latest Articles'
                  }
                </h2>
                <div className="text-sm text-gray-500">
                  {!loading && `${posts.length} article${posts.length !== 1 ? 's' : ''}`}
                </div>
              </div>
              
              <BlogGrid 
                posts={regularPosts}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </main>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BlogApp />
    </AuthProvider>
  );
}