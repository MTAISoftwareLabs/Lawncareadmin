import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeQueryRef = useRef<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setIsLoading(false);
      activeQueryRef.current = "";
      return;
    }

    const currentQuery = query;
    activeQueryRef.current = currentQuery;
    setIsLoading(true);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await api.products.search(currentQuery);
        
        if (activeQueryRef.current === currentQuery) {
          setResults(searchResults);
          setShowResults(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (activeQueryRef.current === currentQuery) {
          setResults([]);
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleResultClick = (productId: number) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setLocation(`/products/${productId}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for lawn care products..."
          className="w-full pl-10 pr-10 py-2 bg-white/95 text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-500"
          data-testid="input-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    data-testid={`search-result-${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <p className="font-semibold text-green-600">₹{product.price}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No products found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
