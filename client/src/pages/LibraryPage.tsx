import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, Download, FileText, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Ebook {
  id: number;
  name: string;
  imageUrl: string | null;
  downloadUrl: string;
  displayOrder: number | null;
  isActive: boolean | null;
  createdAt: string;
}

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: ebooks = [], isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/ebooks"],
  });

  const filteredItems = ebooks.filter((item) => {
    return !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lawn Care Library</h1>
          <p className="text-muted-foreground">
            Educational resources, ebooks, and guides for lawn care
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden" data-testid={`card-ebook-${item.id}`}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-blue-600 dark:text-blue-300" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardFooter>
                  {item.downloadUrl ? (
                    <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full" data-testid={`button-download-${item.id}`}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No Results Found" : "Library Coming Soon"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery 
                  ? "Try adjusting your search criteria" 
                  : "Educational resources, ebooks, and guides will be added here soon."}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default LibraryPage;
