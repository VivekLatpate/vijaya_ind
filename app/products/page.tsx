import { Metadata } from "next";
import TrustBar from "../components/TrustBar";
import Navbar from "../components/Navbar";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import ClientCatalogueLive from "./ClientCatalogueLive";
import { connectToDatabase } from "@/lib/db";
import { ProductModel } from "@/models/Product";

export const metadata: Metadata = {
  title: "Product Catalogue | Vijaya Industries",
  description: "Explore our complete range of automobile clips and fastening solutions. Reliable inventory ready for distributors and assembly lines.",
};

export default async function ProductsPage() {
  await connectToDatabase();

  const products = await ProductModel.find({ isActive: true })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();

  const catalogueProducts = products.map((product) => ({
    id: String(product._id),
    name: product.name,
    brand: product.brand,
    category:
      typeof product.category === "object" && product.category && "name" in product.category
        ? product.category.name
        : "Uncategorized",
    price: product.price,
    imageUrl: product.images[0] ?? null,
    moq: product.moq,
    stock: product.stock,
    description: product.description,
    model: product.model,
  }));

  return (
    <>
      <TrustBar />
      <Navbar />

      <main className="flex-grow bg-[#f8fafc]">
        {/* 1. Page Header */}
        <section className="bg-white border-b border-border py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-heading mb-4">
                Product <span className="text-primary">Catalogue</span>
              </h1>
              <p className="text-lg text-foreground">
                Explore our complete range of precision automobile clips and fastening solutions. Available for bulk ordering to serve workshops and major distributors nationwide.
              </p>
            </div>
          </div>
        </section>

        <ClientCatalogueLive products={catalogueProducts} />

        <CTA />
      </main>

      <Footer />
    </>
  );
}
