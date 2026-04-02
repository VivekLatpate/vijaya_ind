"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Filter, Trash2, Plus, ImageOff, ArrowRight, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/app/components/CartContext";

import Link from "next/link";
import { Product, MOCK_PRODUCTS } from "../lib/mockData";

export default function ClientCatalogue() {
  const { addToCart } = useCart();
  // --- Global State ---
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [visibleCount, setVisibleCount] = useState(8);
  
  // --- Filters ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- Mock Authentication (Role checking placeholder) ---
  // TODO: Replace with strictly authenticated server/client logic
  const [isAdminMode, setIsAdminMode] = useState(false);

  // --- Admin Add Product Form ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("Universal");
  const [newProductCategory, setNewProductCategory] = useState("Trim");
  const [newProductPrice, setNewProductPrice] = useState("");

  // Memoized Categories and Brands for Dropdowns
  const availableBrands = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.brand))).sort()], [products]);
  const availableCategories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category))).sort()], [products]);

  // Derived Filtered List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = selectedBrand === "All" || p.brand === selectedBrand;
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchBrand && matchCategory;
    });
  }, [products, searchTerm, selectedBrand, selectedCategory]);

  // Handlers
  const handleLoadMore = () => setVisibleCount((prev) => prev + 8);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this catalogue item?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      sku: `${product.brand.toUpperCase().substring(0,3)}-${product.id.toUpperCase()}`,
      price: product.price,
      gstRate: 18,
      quantity: product.moq,
      moq: product.moq
    });
    toast.success(`Added ${product.moq} x ${product.name} to cart.`);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const newProduct: Product = {
      id: `p_${Date.now()}`,
      name: newProductName,
      brand: newProductBrand,
      category: newProductCategory,
      price: parseFloat(newProductPrice) || 0,
      imageUrl: null, // Defaults cleanly to fallback if no endpoint handled
      moq: 1000,
      stock: 10000,
      description: "Custom admin-added product for catalogue verification.",
      specs: { material: "Nylon", usageArea: "Universal", durability: "Standard", fitType: "Universal" }
    };

    setProducts([newProduct, ...products]); // Add to top for immediate feedback
    setShowAddForm(false);
    
    // Reset explicitly cleanly
    setNewProductName("");
    setNewProductPrice("");
  };

  return (
    <section className="pb-24">
      {/* 2. Search + Filter Bar (Sticky) */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-[#f8fafc] text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all sm:text-sm"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-heading whitespace-nowrap">Filter By:</span>
              </div>
              
              <select
                className="px-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-slate-400 transition-colors"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {availableBrands.map(b => <option key={b} value={b}>{b === "All" ? "Every Brand" : b}</option>)}
              </select>

              <select
                className="px-3 py-2 bg-white border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-slate-400 transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {availableCategories.map(c => <option key={c} value={c}>{c === "All" ? "Every Category" : c}</option>)}
              </select>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* --- Mock Admin Toggle Layer (Normally hidden behind authenticated routes) --- */}
        <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Development / Hackathon Admin Portal</h4>
            <p className="text-amber-700 text-xs">Toggle the switch to test CRUD capabilities before wiring it to MongoDB auth.</p>
          </div>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isAdminMode ? 'bg-amber-600 text-white' : 'bg-transparent border border-amber-600 text-amber-900 hover:bg-amber-100'}`}
          >
            {isAdminMode ? "Disable Admin Options" : "Enable Admin View"}
          </button>
        </div>

        {/* --- Admin Interactive Addition Panel --- */}
        {isAdminMode && (
          <div className="mb-10 bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-heading flex items-center gap-2"><Plus className="w-5 h-5 text-primary"/> Manage Inventories</h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary hover:bg-[#0596ad] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                {showAddForm ? "Close Form" : "Add New Product"}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-[#f8fafc] p-6 rounded-xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-heading mb-1 uppercase">Product Name</label>
                    <input type="text" required value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. Dashboard Retainer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-heading mb-1 uppercase">Brand Fitment</label>
                    <input type="text" required value={newProductBrand} onChange={e => setNewProductBrand(e.target.value)} className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="Maruti, Tata..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-heading mb-1 uppercase">Category</label>
                    <input type="text" required value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="Bumper, Body..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-heading mb-1 uppercase">Piece Price (₹)</label>
                    <input type="number" step="0.10" required value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="3.50" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">Save Output to Global State</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 6. Empty States Handling */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-24 flex flex-col items-center justify-center text-center">
            <Package className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-heading mb-2">No products found holding this spec</h3>
            <p className="text-foreground text-sm max-w-sm">Please adjust your search and filter parameters, or contact engineering to commission custom tools.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedBrand("All"); setSelectedCategory("All"); }}
              className="mt-6 font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* 3. Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 relative">
                  
                  {/* Full Card Link Overlay */}
                  <Link href={`/products/${product.id}`} className="absolute inset-0 z-20 block w-full h-full bg-transparent"><span className="sr-only">View Detail</span></Link>

                  {/* Admin Delete Action */}
                  {isAdminMode && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(product.id); }}
                      className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-red-100 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center shadow-sm transition-all border border-red-200 hover:border-red-600"
                      title="Permanently remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Top: Image Handlers */}
                  <div className="aspect-square bg-[#f8fafc] relative p-8 flex items-center justify-center border-b border-border">
                    {/* Brand Pill Overlay */}
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-[10px] font-bold text-heading uppercase tracking-wider shadow-sm z-10">
                      {product.brand}
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-contain drop-shadow-md" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Image Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Information block */}
                  <div className="p-5 flex-grow flex flex-col justify-between bg-white relative">
                    <div className="z-10 pointer-events-none">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-semibold text-heading leading-tight group-hover:text-primary transition-colors pr-2">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">{product.category} Assembly</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-auto z-10 relative pointer-events-auto">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-slate-500 font-semibold uppercase">Bulk Tier</span>
                         <span className="text-sm font-bold text-heading">₹{product.price.toFixed(2)} <span className="text-xs font-normal text-slate-500">/pc</span></span>
                      </div>
                      <button 
                         onClick={(e) => handleQuickAdd(e, product)}
                         className="relative z-30 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-blue-600 border border-blue-100 shadow-sm"
                         title="Quick Add MOQ to Cart"
                      >
                         <span className="sr-only">Quick Add</span>
                         <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Load More System */}
            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={handleLoadMore}
                  className="bg-white hover:bg-muted text-heading border border-border shadow-sm px-8 py-3 rounded-xl font-bold text-sm transition-colors"
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
