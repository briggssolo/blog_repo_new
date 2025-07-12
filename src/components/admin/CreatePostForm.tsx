import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { supabase, Category, Tag } from '@/lib/supabase';
import { toast } from 'sonner';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  medium_url: z.string().url('Please enter a valid Medium URL'),
  featured_image: z.string().url('Please enter a valid image URL'),
  category_id: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, setValue]);

  // Load categories and tags
  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ]);

      if (categoriesData.data) setCategories(categoriesData.data);
      if (tagsData.data) setTags(tagsData.data);
    } catch (err) {
      console.error('Error loading categories and tags:', err);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Create the blog post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          medium_url: data.medium_url,
          featured_image: data.featured_image,
          category_id: data.category_id || null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Handle tags
      if (selectedTags.length > 0) {
        // Create new tags if they don't exist
        for (const tagName of selectedTags) {
          const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          
          if (!existingTag) {
            const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await supabase.from('tags').insert({
              name: tagName,
              slug: tagSlug,
            });
          }
        }

        // Get all tag IDs
        const { data: allTags } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', selectedTags);

        if (allTags) {
          // Create blog_post_tags relationships
          const tagRelations = allTags.map(tag => ({
            blog_post_id: post.id,
            tag_id: tag.id,
          }));

          await supabase.from('blog_post_tags').insert(tagRelations);
        }
      }

      toast.success('Article created successfully!');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create article');
      toast.error('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Article</CardTitle>
        <CardDescription>
          Add a new article that links to your Medium post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="article-slug"
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of the article"
              rows={3}
              {...register('excerpt')}
            />
            {errors.excerpt && (
              <p className="text-sm text-red-600">{errors.excerpt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medium_url">Medium URL</Label>
            <Input
              id="medium_url"
              placeholder="https://medium.com/@username/article-title"
              {...register('medium_url')}
            />
            {errors.medium_url && (
              <p className="text-sm text-red-600">{errors.medium_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured_image">Featured Image URL</Label>
            <Input
              id="featured_image"
              placeholder="https://example.com/image.jpg"
              {...register('featured_image')}
            />
            {errors.featured_image && (
              <p className="text-sm text-red-600">{errors.featured_image.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Article
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}