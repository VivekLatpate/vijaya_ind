import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ImageOff, CheckCircle2, Factory, Box, Info, PackageX } from "lucide-react";

import TrustBar from "../../components/TrustBar";
import Navbar from "../../components/Navbar";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

import { getProductById, getRelatedProducts } from "../../lib/mockData";
import ProductActions from "./ProductActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Vijaya Industries Catalogue`,
    description: product.description,
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.category, product.id);

  return (
    <>
      <TrustBar />
      <Navbar />

      <main className="flex-grow bg-[#f8fafc]">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center text-xs font-semibold text-slate-500 gap-2">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-secondary truncate max-w-[200px] sm:max-w-xs block">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* 2. Main Product Section (Core Layout) */}
        <section className="py-12 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
              
              {/* LEFT: Product Image Gallery */}
              <div className="flex flex-col gap-4">
                <div className="aspect-square bg-muted rounded-2xl relative border border-border flex items-center justify-center overflow-hidden">
                  {/* Brand Tag Layer */}
                  <div className="absolute top-4 left-4 z-10 bg-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm text-heading">
                    {product.brand} OEM FIT
                  </div>
                  
                  {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill 
                      className="object-contain p-8 hover:scale-110 transition-transform duration-500 drop-shadow-lg" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ImageOff className="w-16 h-16 mb-4 opacity-50" />
                      <span className="uppercase font-bold tracking-widest text-xs">Image Coming Soon</span>
                      <p className="text-xs max-w-xs text-center mt-2 px-8 text-slate-500 font-medium">Render preview currently unavailable. Technical fitment guaranteed.</p>
                    </div>
                  )}
                </div>
                {/* Thumbnails (Mocked since we only have 1 image per DB item) */}
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl border ${i===0 ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-muted'} flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer relative overflow-hidden`}>
                      {product.imageUrl && i===0 ? (
                        <Image src={product.imageUrl} alt="Thumbnail" fill className="object-cover scale-150 p-2 opacity-50 block" />
                      ) : (
                        <Box className={`w-5 h-5 ${i===0 ? 'text-primary' : 'text-slate-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Product Information */}
              <div className="flex flex-col">
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-heading leading-[1.15] mb-4">{product.name}</h1>
                  <p className="text-foreground text-lg leading-relaxed">{product.description}</p>
                </div>

                <div className="mb-10 bg-[#f8fafc] border border-border rounded-xl px-6 py-5">
                   {/* Key Details Block */}
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
                     
                     {/* Box 1: Price */}
                     <div className="flex flex-col pt-4 sm:pt-0">
                       <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Bulk Price</span>
                       <div className="flex items-baseline gap-1 mt-auto">
                         <span className="text-2xl font-bold text-heading">₹{product.price.toFixed(2)}</span>
                         <span className="text-sm font-semibold text-slate-500">/ pc</span>
                       </div>
                     </div>

                     {/* Box 2: MOQ */}
                     <div className="flex flex-col pt-4 sm:pt-0 sm:pl-6">
                       <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Min. Order</span>
                       <div className="flex items-baseline gap-1 mt-auto">
                         <span className="text-2xl font-bold text-heading">{product.moq}</span>
                         <span className="text-sm font-semibold text-slate-500">units</span>
                       </div>
                     </div>

                     {/* Box 3: Stock */}
                     <div className="flex flex-col pt-4 sm:pt-0 sm:pl-6">
                       <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Availability</span>
                       <div className="flex items-center gap-2 mt-auto">
                         {product.stock > 10000 ? (
                           <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold text-sm">
                             <CheckCircle2 className="w-4 h-4" /> Ready Stock
                           </div>
                         ) : product.stock > 0 ? (
                           <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold text-sm">
                             <Info className="w-4 h-4" /> Limited Queue
                           </div>
                         ) : (
                           <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded font-bold text-sm">
                             <PackageX className="w-4 h-4" /> Depleted
                           </div>
                         )}
                       </div>
                     </div>

                   </div>
                </div>

                {/* 3. Actions / Quantity Stepper */}
                <div className="mb-10">
                  <ProductActions moq={product.moq} stock={product.stock} />
                </div>

                {/* 4. Specifications Table */}
                <div className="flex-grow flex flex-col justify-end">
                   <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-muted px-6 py-4 flex items-center gap-3 border-b border-border">
                       <Factory className="w-5 h-5 text-primary" />
                       <h3 className="font-bold text-heading">Technical Specifications</h3>
                     </div>
                     <div className="bg-white">
                        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-sm">
                          <div className="px-6 py-4 font-semibold text-slate-600">Material Type</div>
                          <div className="px-6 py-4 text-heading font-medium">{product.specs.material}</div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-sm">
                          <div className="px-6 py-4 font-semibold text-slate-600">Usage Area</div>
                          <div className="px-6 py-4 text-heading font-medium">{product.specs.usageArea}</div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border border-b border-border text-sm">
                          <div className="px-6 py-4 font-semibold text-slate-600">Durability</div>
                          <div className="px-6 py-4 text-heading font-medium">{product.specs.durability}</div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border text-sm">
                          <div className="px-6 py-4 font-semibold text-slate-600">Fit Type</div>
                          <div className="px-6 py-4 text-heading font-medium">{product.specs.fitType}</div>
                        </div>
                     </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 5. Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="py-20 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-heading mb-8">Related Fasteners ({product.category})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(rel => (
                  <Link href={`/products/${rel.id}`} key={rel.id} className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-[#f8fafc] relative p-6 flex items-center justify-center border-b border-border">
                      <div className="absolute top-2 left-2 bg-white px-1.5 py-0.5 rounded text-[9px] font-bold text-heading uppercase shadow-sm z-10">
                        {rel.brand}
                      </div>
                      <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                         {rel.imageUrl ? (
                           <Image src={rel.imageUrl} alt={rel.name} fill className="object-contain drop-shadow-md" />
                         ) : (
                           <ImageOff className="w-8 h-8 text-slate-300" />
                         )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <h3 className="font-bold text-heading text-sm mb-4 leading-snug group-hover:text-primary transition-colors">{rel.name}</h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase">{rel.category}</span>
                        <span className="font-bold text-heading text-sm">₹{rel.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <CTA />
      </main>

      <Footer />
    </>
  );
}
