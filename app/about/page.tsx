import Image from "next/image";
import { CheckCircle2, Factory, ShieldCheck, TrendingUp, Users, Target, Cog, PackageSearch, Award, Truck } from "lucide-react";
import TrustBar from "../components/TrustBar";
import Navbar from "../components/Navbar";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "About Us | Vijaya Industries",
  description: "Learn about Vijaya Industries, a trusted manufacturer of precision automobile clips and fastening solutions in India.",
};

export default function About() {
  return (
    <>
      <TrustBar />
      <Navbar />

      <main className="flex-grow bg-[#f8fafc]">
        {/* 1. Hero Section */}
        <section className="relative bg-white py-20 border-b border-border overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: "linear-gradient(45deg, #0f172a 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-3/5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-6">
                  Company Profile
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-heading leading-[1.15] mb-6">
                  About <span className="text-primary">Vijaya Industries</span>
                </h1>
                <p className="text-lg sm:text-xl text-foreground text-balance max-w-2xl">
                  Delivering precision automobile clip solutions with steadfast reliability, consistency, and uncompromising quality for the B2B sector.
                </p>
              </div>
              <div className="md:w-2/5 flex justify-end">
                 <div className="relative w-full max-w-sm aspect-video bg-muted rounded-2xl overflow-hidden border border-border shadow-sm flex items-center justify-center p-8">
                    <Image src="/Maruti Bumper & Grill Clip.png" alt="Automobile Clip Presentation" fill className="object-contain drop-shadow-lg opacity-90 scale-110" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Company Overview */}
        <section className="py-24 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-heading mb-6">Who We Are</h2>
                <div className="space-y-6 text-lg text-foreground leading-relaxed">
                  <p>
                    Vijaya Industries is a premier manufacturer specializing in high-grade automobile clips, fasteners, and interior trim fittings. Serving distributors and workshops nationwide, we sit at the intersection of heavy-duty manufacturing and precision engineering.
                  </p>
                  <p>
                    Our core focus lies in absolute durability and seamless compatibility. We understand that a fastener is not just a piece of plastic; it is an critical component that dictates assembly integrity and acoustic perfection in modern vehicles. That is why every batch undergoes rigorous tolerance testing before dispatch.
                  </p>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-primary">
                      <Factory className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-heading">In-house Production</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border shadow-sm flex items-center justify-center text-primary">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-heading">Quality Assured</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-full relative">
                <div className="bg-white border border-border rounded-2xl p-6 flex flex-col justify-center shadow-sm h-64 lg:mt-12">
                   <div className="relative w-full h-32 mb-4">
                     <Image src="/Door Trim Clip .png" alt="Trim Clip" fill className="object-contain" />
                   </div>
                   <h3 className="text-center font-bold text-heading">Interior Fittings</h3>
                </div>
                <div className="bg-white border border-border rounded-2xl p-6 flex flex-col justify-center shadow-sm h-64">
                   <div className="relative w-full h-32 mb-4">
                     <Image src="/Hyundai Fender Lining Clip.png" alt="Fender Clip" fill className="object-contain" />
                   </div>
                   <h3 className="text-center font-bold text-heading">Exterior Retainers</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Mission & Vision */}
        <section className="py-20 bg-white border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission */}
              <div className="bg-muted/30 border border-border rounded-2xl p-10 lg:p-12 relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-border mb-8">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-heading mb-4">Our Mission</h3>
                <p className="text-lg text-foreground leading-relaxed">
                  To deliver high-quality, reliable structural fastening solutions for the automobile industry. We commit to continuous improvement in material science and injection molding techniques to exceed client expectations.
                </p>
                <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 translate-x-1/4 translate-y-1/4 group-hover:scale-[1.6] transition-transform duration-700">
                  <Target className="w-64 h-64 text-primary" />
                </div>
              </div>

              {/* Vision */}
              <div className="bg-muted/30 border border-border rounded-2xl p-10 lg:p-12 relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-border mb-8">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-heading mb-4">Our Vision</h3>
                <p className="text-lg text-foreground leading-relaxed">
                  To become the universally trusted Tier-1 supplier across India for durable, precision-engineered clips—driving efficiency for assembly lines and aftermarket distributors nationwide.
                </p>
                <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 translate-x-1/4 translate-y-1/4 group-hover:scale-[1.6] transition-transform duration-700">
                  <TrendingUp className="w-64 h-64 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Manufacturing & Capabilities */}
        <section className="py-24 bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Manufacturing & Capabilities</h2>
              <p className="text-slate-400 text-lg">Infrastructure built for precision. Systems built for scale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {[
                { title: "Precision Injection Molding", desc: "Automated hydraulic machinery maintaining micron-level tolerances for structural integrity.", icon: Cog },
                { title: "High-Quality Raw Materials", desc: "Sourcing premium Nylons, POM, and toughened polymers to prevent thermal fatigue.", icon: ShieldCheck },
                { title: "Extensive Compatibility", desc: "Direct OEM-equivalent fits for Maruti Suzuki, Hyundai, Tata Motors, and commercial M&HCVs.", icon: PackageSearch },
                { title: "Bulk Production Pipeline", desc: "Optimized cycle times enabling massive output runs with strict batch-level tracking.", icon: Factory },
              ].map((cap, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <cap.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{cap.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm lg:text-base">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Why Choose Vijaya Industries */}
        <section className="py-24 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-heading mb-4">The Vijaya Advantage</h2>
              <p className="text-foreground text-lg">Why supply chains trust our components.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
              {[
                { title: "Consistent Quality", desc: "Zero-compromise QA ensuring uniformity.", icon: CheckCircle2 },
                { title: "Competitive Pricing", desc: "Aggressive B2B volume tiering.", icon: TrendingUp },
                { title: "Reliable Supply", desc: "Maintained inventory for rapid dispatch.", icon: Truck },
                { title: "Industry Experience", desc: "Decades of automotive sector acumen.", icon: Users },
              ].map((adv, i) => (
                <div key={i} className="bg-white border border-border p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary mb-6">
                    <adv.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-heading mb-3">{adv.title}</h3>
                  <p className="text-foreground text-sm leading-relaxed">{adv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTA />
      </main>

      <Footer />
    </>
  );
}
