"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Filter, ImageOff, Package, Search } from "lucide-react";

type CatalogueProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string | null;
  moq: number;
  stock: number;
  description: string;
  model: string;
};

type ClientCatalogueLiveProps = {
  products: CatalogueProduct[];
};

export default function ClientCatalogueLive({
  products,
}: ClientCatalogueLiveProps) {
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const availableBrands = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.brand))).sort()],
    [products],
  );

  const availableCategories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category))).sort()],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchSearch = [product.name, product.brand, product.model, product.description]
        .join(" ")
        .toLowerCase()
        .includes(term);
      const matchBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchSearch && matchBrand && matchCategory;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory]);

  return (
    <section className="pb-24">
      <div className="sticky top-20 z-40 border-b border-border bg-white/95 py-4 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="relative w-full lg:w-1/2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-border bg-[#f8fafc] py-2.5 pl-10 pr-3 text-heading transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
              placeholder="Search by product name, brand, or model..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="whitespace-nowrap text-sm font-semibold text-heading">
                Filter By:
              </span>
            </div>

            <select
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
            >
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "All" ? "Every Brand" : brand}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "Every Category" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <Package className="mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-xl font-bold text-heading">
              No products found with this filter
            </h3>
            <p className="max-w-sm text-sm text-foreground">
              Try a different search term or clear the filters to browse the full
              active catalogue.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedBrand("All");
                setSelectedCategory("All");
              }}
              className="mt-6 font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="relative flex aspect-square items-center justify-center border-b border-border bg-[#f8fafc] p-8">
                    <div className="absolute left-3 top-3 z-10 rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-heading shadow-sm">
                      {product.brand}
                    </div>

                    <div className="relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain drop-shadow-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <ImageOff className="mb-2 h-12 w-12 opacity-50" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Image Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative flex flex-grow flex-col justify-between bg-white p-5">
                    <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
                      <span className="sr-only">View product</span>
                    </Link>

                    <div className="pointer-events-none z-10">
                      <h3 className="pr-2 font-semibold leading-tight text-heading transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      <p className="mb-3 mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {product.category}
                      </p>
                      <p className="line-clamp-2 text-sm text-foreground">
                        {product.description || `${product.brand} ${product.model}`}
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          Bulk Tier
                        </span>
                        <span className="text-sm font-bold text-heading">
                          Rs.{product.price.toFixed(2)}{" "}
                          <span className="text-xs font-normal text-slate-500">/pc</span>
                        </span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((current) => current + 8)}
                  className="rounded-xl border border-border bg-white px-8 py-3 text-sm font-bold text-heading shadow-sm transition-colors hover:bg-muted"
                >
                  Load More Inventory ({filteredProducts.length - visibleCount} hidden)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
