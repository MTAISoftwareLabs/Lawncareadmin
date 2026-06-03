import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", "FERTILIZERS", "GRASS SEED", "LAWN TOOLS", "PEST CONTROL"];

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, sortBy, priceRange, minRating],
    queryFn: () => api.products.getAll({
      ...(selectedCategory !== "All" && { category: selectedCategory }),
      ...(sortBy && { sortBy }),
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(minRating > 0 && { minRating }),
    }),
  });

  const products = allProducts?.filter((product: any) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (inStockOnly && product.stock <= 0) {
      return false;
    }
    if (onSaleOnly && !product.featured) {
      return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("");
    setPriceRange([0, 5000]);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "All" || sortBy !== "" || priceRange[0] !== 0 || priceRange[1] !== 5000 || minRating > 0 || inStockOnly || onSaleOnly;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-4xl font-bold">All Products</h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {hasActiveFilters && <span className="ml-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Active</span>}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="flex items-center gap-2"
                data-testid="button-reset-filters"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {searchQuery && (
          <p className="text-sm text-gray-600">
            Showing results for: <span className="font-semibold">"{searchQuery}"</span>
          </p>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-gray-50 rounded-lg p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label className="text-sm font-semibold mb-3 block">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      data-testid={`filter-category-${category}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={5000}
                  step={100}
                  className="mt-2"
                  data-testid="slider-price-range"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Minimum Rating: {minRating > 0 ? `${minRating}+ ⭐` : 'All'}
                </Label>
                <Slider
                  value={[minRating]}
                  onValueChange={(value) => setMinRating(value[0])}
                  min={0}
                  max={5}
                  step={0.5}
                  className="mt-2"
                  data-testid="slider-min-rating"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  data-testid="checkbox-in-stock"
                />
                <Label htmlFor="inStockOnly" className="text-sm cursor-pointer">
                  In Stock Only
                </Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="onSaleOnly"
                  checked={onSaleOnly}
                  onChange={(e) => setOnSaleOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                  data-testid="checkbox-on-sale"
                />
                <Label htmlFor="onSaleOnly" className="text-sm cursor-pointer">
                  On Sale / Featured
                </Label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
            />
          ))}
        </div>
      )}

      {products?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
