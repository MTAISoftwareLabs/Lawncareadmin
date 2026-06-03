import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useParams } from "wouter";

export function StaticPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api.pages.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-8">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been removed.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-8">
        <Card className="max-w-4xl mx-auto p-12" data-testid="static-page-content">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            {page.title}
          </h1>
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-700 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
            />
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
