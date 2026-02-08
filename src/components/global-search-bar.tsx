"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/data/products";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  results: Product[];
  query: string;
  pagination: {
    totalCount: number;
  };
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search using custom hook
  const debouncedQuery = useDebounce(query, 300);

  // Fetch search results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      setIsOpen(false);
      return;
    }

    fetchSearchResults(debouncedQuery);
  }, [debouncedQuery]);

  // Fetch search results
  const fetchSearchResults = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=6`
      );
      const data: SearchResult = await response.json();
      
      if (response.ok) {
        setResults(data.results);
        setTotalCount(data.pagination.totalCount);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1 || selectedIndex === results.length) {
          // Navigate to full search results page
          handleViewAll();
        } else if (selectedIndex >= 0 && selectedIndex < results.length) {
          // Navigate to selected product
          router.push(`/products/${results[selectedIndex].id}`);
          closeSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search products, brands, SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {results.length === 0 && !isLoading && query.length >= 2 && (
            <div className="p-6 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="p-2 text-xs text-gray-500 border-b">
                Found {totalCount} {totalCount === 1 ? "product" : "products"}
              </div>

              {/* Product Results */}
              {results.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={closeSearch}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                    selectedIndex === index ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                    <Image
                      src={product.image.src}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {highlightMatch(product.name, query)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.company}
                      {product.sku && ` • SKU: ${product.sku}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      ${product.price.sale || product.price.regular}
                    </p>
                    {product.price.sale && (
                      <p className="text-xs text-gray-400 line-through">
                        ${product.price.regular}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

              {/* View All Results Link */}
              {totalCount > results.length && (
                <button
                  onClick={handleViewAll}
                  className={`w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary hover:bg-gray-50 transition-colors ${
                    selectedIndex === results.length ? "bg-gray-100" : ""
                  }`}
                >
                  View all {totalCount} results
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
