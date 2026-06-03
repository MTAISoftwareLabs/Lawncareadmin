import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

export function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: blogPost, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => api.blog.getBySlug(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (blogPost) {
      document.title = `${blogPost.title} | Lawncare Workshop Blog`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && blogPost.metaDescription) {
        metaDescription.setAttribute('content', blogPost.metaDescription);
      } else if (blogPost.metaDescription) {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = blogPost.metaDescription;
        document.head.appendChild(meta);
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && blogPost.metaKeywords) {
        metaKeywords.setAttribute('content', blogPost.metaKeywords);
      } else if (blogPost.metaKeywords) {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = blogPost.metaKeywords;
        document.head.appendChild(meta);
      }

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', blogPost.title);
      } else {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        ogTitle.setAttribute('content', blogPost.title);
        document.head.appendChild(ogTitle);
      }

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && blogPost.metaDescription) {
        ogDescription.setAttribute('content', blogPost.metaDescription);
      } else if (blogPost.metaDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        ogDescription.setAttribute('content', blogPost.metaDescription);
        document.head.appendChild(ogDescription);
      }

      if (blogPost.featuredImage) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', blogPost.featuredImage);
        } else {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          ogImage.setAttribute('content', blogPost.featuredImage);
          document.head.appendChild(ogImage);
        }
      }
    }

    return () => {
      document.title = 'Lawncare Workshop';
    };
  }, [blogPost]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {blogPost.featuredImage && (
        <div className="w-full h-96 overflow-hidden bg-gray-900">
          <img 
            src={blogPost.featuredImage}
            alt={blogPost.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8 md:p-12"
          data-testid="article-blog-post"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900" data-testid="text-blog-title">
            {blogPost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{blogPost.author.name}</span>
            </div>
            {blogPost.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(blogPost.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{blogPost.viewCount} views</span>
            </div>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
            data-testid="text-blog-content"
          />
        </motion.article>

        <div className="mt-8 text-center">
          <Link href="/blog">
            <Button size="lg" data-testid="button-more-articles">
              Read More Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
