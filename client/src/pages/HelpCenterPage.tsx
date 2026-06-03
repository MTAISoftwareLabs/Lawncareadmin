import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const FAQ_CATEGORIES = [
  "All",
  "Orders",
  "Shipping",
  "Returns",
  "Payments",
  "Account",
  "Products",
  "General"
];

export function HelpCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs", selectedCategory === "All" ? undefined : selectedCategory],
    queryFn: () =>
      api.faqs.getAll(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const filteredFaqs = faqs?.filter((faq: any) =>
    searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const groupedFaqs: Record<string, any[]> = {};
  filteredFaqs?.forEach((faq: any) => {
    if (!groupedFaqs[faq.category]) {
      groupedFaqs[faq.category] = [];
    }
    groupedFaqs[faq.category].push(faq);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-8 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-green-100 mb-8">
            Find answers to frequently asked questions
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900"
              data-testid="input-search-faqs"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FAQ_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredFaqs && filteredFaqs.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {Object.keys(groupedFaqs).map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 text-green-700">
                  {category}
                </h2>
                <div className="space-y-4">
                  {groupedFaqs[category].map((faq: any) => (
                    <Card
                      key={faq.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                      data-testid={`faq-item-${faq.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                          <HelpCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 text-gray-900">
                            {faq.question}
                          </h3>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No FAQs Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No results found for "${searchQuery}". Try different keywords.`
                : "There are no FAQs available at the moment."}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            )}
          </Card>
        )}

        <Card className="max-w-4xl mx-auto p-8 mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/profile">
                <Button className="bg-green-600 hover:bg-green-700" data-testid="button-contact-support">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
