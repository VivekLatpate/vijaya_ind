import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#e6f7fa] rounded-[2rem] p-10 md:p-16 text-center border border-primary/20 shadow-sm relative overflow-hidden">
          {/* Decorative Abstract Shape */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-6 leading-tight">
              Looking for a reliable automobile clip supplier?
            </h2>
            <p className="text-lg text-foreground mb-10 max-w-2xl mx-auto">
              Get in touch with our sales team today to discuss bulk pricing,
              custom manufacturing runs, and fast dispatch options.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className="w-full sm:w-auto flex items-center justify-center bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95">
                <Link href={`/cart`}>
                  Place Order Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center bg-white border border-border hover:bg-muted text-heading px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
