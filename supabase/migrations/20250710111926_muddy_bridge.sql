/*
  # Create blog schema with Medium integration

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, optional)
      - `created_at` (timestamp)
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `medium_url` (text)
      - `featured_image` (text)
      - `category_id` (uuid, foreign key)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `blog_post_tags` (junction table)
      - `blog_post_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user management

  3. Sample Data
    - Categories: Technology, Design, Business, Personal Development, Programming
    - Tags: React, TypeScript, JavaScript, UI/UX, etc.
    - Sample blog posts with proper relationships
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  medium_url text NOT NULL,
  featured_image text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, tag_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Blog post tags are viewable by everyone"
  ON blog_post_tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for authenticated users to manage content
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage blog post tags"
  ON blog_post_tags FOR ALL
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Insert sample data
INSERT INTO categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Articles about technology trends and innovations'),
  ('Design', 'design', 'Design principles, UI/UX, and creative insights'),
  ('Business', 'business', 'Business strategy, entrepreneurship, and industry insights'),
  ('Personal Development', 'personal-development', 'Self-improvement and career growth'),
  ('Programming', 'programming', 'Coding tutorials, best practices, and development tips')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('Web Development', 'web-development'),
  ('UI/UX', 'ui-ux'),
  ('JavaScript', 'javascript'),
  ('CSS', 'css'),
  ('Node.js', 'nodejs'),
  ('Database', 'database'),
  ('API', 'api'),
  ('Frontend', 'frontend'),
  ('Backend', 'backend'),
  ('Mobile', 'mobile'),
  ('AI', 'ai'),
  ('Machine Learning', 'machine-learning'),
  ('DevOps', 'devops')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, medium_url, featured_image, category_id, published_at) VALUES
  (
    'Building Modern Web Applications with React and TypeScript',
    'building-modern-web-applications-react-typescript',
    'Learn how to create scalable and maintainable web applications using React and TypeScript. This comprehensive guide covers best practices, project structure, and advanced patterns.',
    'https://medium.com/@example/building-modern-web-applications-react-typescript',
    'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'technology'),
    now() - interval '1 day'
  ),
  (
    'The Art of Minimalist Design: Less is More',
    'art-of-minimalist-design-less-is-more',
    'Discover the principles of minimalist design and how to create stunning interfaces with clean, purposeful elements. Learn when to remove and when to add for maximum impact.',
    'https://medium.com/@example/art-of-minimalist-design',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'design'),
    now() - interval '2 days'
  ),
  (
    'Scaling Your Startup: From MVP to Enterprise',
    'scaling-startup-mvp-to-enterprise',
    'A practical guide to scaling your startup from a minimum viable product to an enterprise-level solution. Learn about technical architecture, team building, and strategic planning.',
    'https://medium.com/@example/scaling-startup-mvp-enterprise',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'business'),
    now() - interval '3 days'
  ),
  (
    'Advanced JavaScript Patterns for Better Code',
    'advanced-javascript-patterns-better-code',
    'Explore advanced JavaScript patterns and techniques that will make your code more maintainable, efficient, and elegant. From closures to async patterns.',
    'https://medium.com/@example/advanced-javascript-patterns',
    'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'programming'),
    now() - interval '4 days'
  ),
  (
    'The Psychology of User Experience Design',
    'psychology-user-experience-design',
    'Understanding human psychology is crucial for creating exceptional user experiences. Learn how cognitive biases, mental models, and user behavior impact design decisions.',
    'https://medium.com/@example/psychology-user-experience-design',
    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'design'),
    now() - interval '5 days'
  ),
  (
    'Building a Personal Brand in Tech',
    'building-personal-brand-tech',
    'Learn how to build a strong personal brand in the tech industry. From social media presence to networking strategies, discover what works in the competitive landscape.',
    'https://medium.com/@example/building-personal-brand-tech',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    (SELECT id FROM categories WHERE slug = 'personal-development'),
    now() - interval '6 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog post tags
INSERT INTO blog_post_tags (blog_post_id, tag_id) VALUES
  (
    (SELECT id FROM blog_posts WHERE slug = 'building-modern-web-applications-react-typescript'),
    (SELECT id FROM tags WHERE slug = 'react')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'building-modern-web-applications-react-typescript'),
    (SELECT id FROM tags WHERE slug = 'typescript')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'building-modern-web-applications-react-typescript'),
    (SELECT id FROM tags WHERE slug = 'web-development')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'art-of-minimalist-design-less-is-more'),
    (SELECT id FROM tags WHERE slug = 'ui-ux')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'art-of-minimalist-design-less-is-more'),
    (SELECT id FROM tags WHERE slug = 'frontend')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'scaling-startup-mvp-to-enterprise'),
    (SELECT id FROM tags WHERE slug = 'backend')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'scaling-startup-mvp-to-enterprise'),
    (SELECT id FROM tags WHERE slug = 'devops')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'advanced-javascript-patterns-better-code'),
    (SELECT id FROM tags WHERE slug = 'javascript')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'advanced-javascript-patterns-better-code'),
    (SELECT id FROM tags WHERE slug = 'web-development')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'psychology-user-experience-design'),
    (SELECT id FROM tags WHERE slug = 'ui-ux')
  ),
  (
    (SELECT id FROM blog_posts WHERE slug = 'building-personal-brand-tech'),
    (SELECT id FROM tags WHERE slug = 'frontend')
  )
ON CONFLICT (blog_post_id, tag_id) DO NOTHING;