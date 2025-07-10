import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  medium_url: string;
  featured_image: string;
  category_id?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
}

// Database queries
export const getBlogPosts = async (categorySlug?: string, tagSlug?: string) => {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:categories(*),
      tags:blog_post_tags(
        tag:tags(*)
      )
    `)
    .order('published_at', { ascending: false });

  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }

  if (tagSlug) {
    query = query.eq('tags.tag.slug', tagSlug);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  // Transform the data to flatten tags
  return data?.map(post => ({
    ...post,
    tags: post.tags?.map((tagRelation: any) => tagRelation.tag) || []
  })) || [];
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
};

export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
};

export const searchBlogPosts = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:categories(*),
      tags:blog_post_tags(
        tag:tags(*)
      )
    `)
    .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }

  return data?.map(post => ({
    ...post,
    tags: post.tags?.map((tagRelation: any) => tagRelation.tag) || []
  })) || [];
};