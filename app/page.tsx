import Image from "next/image";
import {
  Wrench,
  ShieldCheck,
  Package,
  ArrowRight,
  CheckCircle2,
  Truck,
  Settings,
  Search,
  ShoppingCart,
} from "lucide-react";

import TrustBar from "./components/TrustBar";
import Navbar from "./components/Navbar";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <TrustBar />
      <Navbar />

      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="relative bg-white overflow-hidden py-16 sm:py-24 lg:py-32 border-b border-border">
          {/* Subtle geometric pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Trusted Tier-1 Supplier
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-heading leading-[1.15] mb-6">
                  Precision Automobile <br />
                  <span className="text-primary">Clip Manufacturing</span>
                </h1>
                <p className="text-lg sm:text-xl text-foreground mb-8 text-balance max-w-lg">
                  High-quality, durable fastening solutions trusted by workshops
                  and distributors across India. Export-quality materials built
                  to last.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-lg font-medium transition-all shadow-sm hover:translate-y-[-2px] active:scale-95">
                    <Link href="/products">Request a Quote</Link>
                  </button>
                  <button className="flex items-center justify-center bg-transparent border-2 border-border hover:border-primary/30 hover:bg-muted text-heading px-6 py-3.5 rounded-lg font-medium transition-all active:scale-95">
                    <Link href="/products">View Products</Link>
                  </button>
                </div>
              </div>

              {/* Enhanced Hero Image Area */}
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                <div className="relative w-full aspect-square lg:aspect-auto lg:h-[500px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 rounded-[40px] mix-blend-multiply border border-primary/10"></div>
                  {/* Floating Elements Animation */}
                  <div className="relative w-4/5 h-4/5 animate-[float_6s_ease-in-out_infinite]">
                    {/* Replace with an actual product group image if possible, utilizing one of the main items or a composite */}
                    <Image
                      src="/Maruti Bumper & Grill Clip.png"
                      alt="Precision Automobile Clips"
                      fill
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Product Categories Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-heading mb-4">
                Our Core Categories
              </h2>
              <p className="text-foreground text-lg">
                Engineered perfectly for specific automotive applications and
                maximum hold strength.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                {
                  name: "Bumper Clips",
                  icon: ShieldCheck,
                  img: "/Maruti Bumper & Grill Clip.png",
                },
                {
                  name: "Fender Clips",
                  icon: Settings,
                  img: "/Maruti Fender Lining Clip.png",
                },
                {
                  name: "Door Trim Clips",
                  icon: Wrench,
                  img: "/Door Trim Clip .png",
                },
                {
                  name: "Dikky Trim Clips",
                  icon: Package,
                  img: "/Dikky Trim Clip Big.png",
                },
                {
                  name: "Bidding Clips",
                  icon: CheckCircle2,
                  img: "/Bidding Clip.png",
                },
              ].map((cat, i) => (
                <a
                  href="#"
                  key={i}
                  className="group flex flex-col items-center bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    {/* Fallback to icon if image fails, but here we enforce images */}
                    <div className="relative w-12 h-12">
                      <Image
                        src={cat.img}
                        alt={cat.name}
                        fill
                        className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-heading text-center group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Why Choose Us */}
        <section className="py-24 bg-white border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-heading mb-4">
                Why B2B Leaders Choose Us
              </h2>
              <p className="text-foreground text-lg">
                We deliver consistency, reliability, and precision at scale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "High Durability Materials",
                  desc: "Virgin plastics and toughened nylons ensuring maximum shear strength.",
                  icon: ShieldCheck,
                },
                {
                  title: "Precision Manufacturing",
                  desc: "Injection molding with exact tolerances for zero-rattle fitment.",
                  icon: Settings,
                },
                {
                  title: "Wide Compatibility",
                  desc: "Perfectly engineered for Maruti, Hyundai, Tata, and more.",
                  icon: CheckCircle2,
                },
                {
                  title: "Bulk Order Support",
                  desc: "Streamlined logistics for distributors and wholesale orders.",
                  icon: Package,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col p-6 rounded-2xl bg-muted/50 border border-transparent hover:border-border transition-colors"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-border flex items-center justify-center mb-5 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-heading mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Featured Products Preview */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-heading mb-4">
                  Featured Catalogue
                </h2>
                <p className="text-foreground text-lg">
                  Top-selling clips requested by mechanics and assembly lines
                  nationwide.
                </p>
              </div>
              <button className="hidden md:flex items-center text-primary font-semibold hover:text-primary/80 transition-colors">
                View Full Catalogue <ArrowRight className="ml-1.5 w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[
                {
                  name: "Hyundai Fender Lining Clip",
                  brand: "Hyundai",
                  img: "/Hyundai Fender Lining Clip.png",
                },
                {
                  name: "Maruti Fender Lining Clip",
                  brand: "Maruti",
                  img: "/Maruti Fender Lining Clip.png",
                },
                {
                  name: "Dikky Trim Clip Big",
                  brand: "Universal",
                  img: "/Dikky Trim Clip Big.png",
                },
                {
                  name: "Dikky Trim Clip Small",
                  brand: "Universal",
                  img: "/Dikky Trim Clip Small.png",
                },
                {
                  name: "Door Trim Clip",
                  brand: "Universal",
                  img: "/Door Trim Clip .png",
                },
                {
                  name: "Bidding Clip",
                  brand: "Universal",
                  img: "/Bidding Clip.png",
                },
                {
                  name: "Maruti Bumper & Grill Clip",
                  brand: "Maruti",
                  img: "/Maruti Bumper & Grill Clip.png",
                },
                {
                  name: "Standard Fender Clip",
                  brand: "Tata",
                  img: "/Maruti Fender Lining Clip.png",
                }, // Reused image for demo visual filling
              ].map((product, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="aspect-square bg-muted relative p-8 flexitems-center justify-center border-b border-border">
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-[10px] font-bold text-heading uppercase tracking-wider shadow-sm">
                      {product.brand}
                    </div>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={product.img}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                      />
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-semibold text-heading leading-tight mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-foreground mb-4">
                        Industrial Grade Plastic/Nylon
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm font-semibold text-heading">
                        Request Bulk Price
                      </span>
                      <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-foreground">
                        <Link href={`/products`}>
                          <span className="sr-only">Add to Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-10 w-full md:hidden flex items-center justify-center bg-muted hover:bg-muted/80 text-heading px-6 py-4 rounded-xl font-medium transition-all">
              View Full Catalogue{" "}
              <ArrowRight className="ml-2 w-4 h-4 text-primary" />
            </button>
          </div>
        </section>

        {/* 7. Process Section */}
        <section className="py-24 bg-secondary text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          ></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Streamlined B2B Ordering
              </h2>
              <p className="text-slate-400 text-lg">
                Procurement made simple for workshops and mass distributors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Optional Connecting Line for Desktop */}
              <div className="hidden md:block absolute top-[44px] left-1/8 right-1/8 h-0.5 bg-slate-800 z-0"></div>

              {[
                {
                  title: "Browse Products",
                  desc: "Select components by vehicle make or clip type.",
                  icon: Search,
                },
                {
                  title: "Request Quote",
                  desc: "Add items to your inquiry for volume pricing.",
                  icon: ShoppingCart,
                },
                {
                  title: "Confirm Order",
                  desc: "Approve the proforma invoice and terms.",
                  icon: CheckCircle2,
                },
                {
                  title: "Fast Delivery",
                  desc: "Priority dispatch with trusted logistic partners.",
                  icon: Truck,
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-secondary flex items-center justify-center mb-6 shadow-xl relative">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-secondary">
                      {i + 1}
                    </div>
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed max-w-[240px]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTA />
      </main>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `,
        }}
      />
    </>
  );
}
