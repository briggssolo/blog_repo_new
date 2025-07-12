import { useState } from 'react';
import { CreatePostForm } from './CreatePostForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft } from 'lucide-react';

type AdminView = 'dashboard' | 'create-post';

interface AdminPanelProps {
  onClose?: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'create-post':
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <CreatePostForm
              onSuccess={() => setCurrentView('dashboard')}
              onCancel={() => setCurrentView('dashboard')}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your blog content</p>
              </div>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('create-post')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Article
                  </CardTitle>
                  <CardDescription>
                    Add a new blog post with Medium integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Create New Article
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle>Manage Articles</CardTitle>
                  <CardDescription>
                    Edit and delete existing articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle>Categories & Tags</CardTitle>
                  <CardDescription>
                    Manage blog categories and tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {renderView()}
      </div>
    </div>
  );
}