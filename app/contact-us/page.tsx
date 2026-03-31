import { Phone, Mail, Send, Clock, Building, Globe, FileCheck } from "lucide-react";

import TrustBar from "../components/TrustBar";
import Navbar from "../components/Navbar";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export const metadata = {
  title: "Contact Us | Vijaya Industries",
  description: "Reach out to Vijaya Industries for bulk orders, quotations, and product inquiries regarding precision automobile clips.",
};

export default function ContactUs() {
  return (
    <>
      <TrustBar />
      <Navbar />

      <main className="flex-grow bg-[#f8fafc]">
        {/* 1. Hero Section (Top Banner) */}
        <section className="relative bg-[#0f172a] text-white py-16 md:py-24 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-2/3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-primary mb-6">
                  Get in Touch
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  Contact <span className="text-primary">Vijaya Industries</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-xl text-balance">
                  Reach out for bulk orders, custom tooling quotations, and product compatibility inquiries. Our sales engineering team is ready to assist.
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* 2. Main Contact Section (Core Layout) */}
        <section className="py-20 bg-[#f8fafc] -mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              {/* LEFT: Contact Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-heading mb-2">Send an Enquiry</h2>
                  <p className="text-foreground text-sm">Please fill out the form below. For bulk orders, mention the OEM part number or clip type.</p>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-heading">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                        placeholder="John Doe"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-semibold text-heading">Company Name</label>
                      <input 
                        type="text" 
                        id="company" 
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                        placeholder="Automotive Works Ltd."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-heading">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                        placeholder="john@example.com"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-heading">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" 
                        placeholder="+91 98765 43210"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-heading">Message / Requirement Details</label>
                    <textarea 
                      id="message" 
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none" 
                      placeholder="Please explicitly state if you are looking for bulk quantities of specific Bumper, Fender, or Trim clips..."
                      required 
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#0596ad] text-white px-6 py-4 rounded-lg font-bold text-base transition-all shadow-sm active:scale-[0.98]"
                  >
                    Send Enquiry <Send className="w-4 h-4 ml-1" />
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" /> All information is kept strictly confidential.
                  </p>
                </form>
              </div>

              {/* RIGHT: Contact Information */}
              <div className="flex flex-col gap-6">
                 {/* Direct Contact Card */}
                 <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
                   <h3 className="text-xl font-bold text-heading mb-6 border-b border-border pb-4">Contact Information</h3>
                   
                   <div className="space-y-6">
                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-heading mb-1">Phone Enquiries</p>
                          <a href="tel:+919326000050" className="text-foreground text-lg hover:text-primary transition-colors block">
                            +91 93260 00050
                          </a>
                          <span className="text-xs text-slate-400">Available Mon-Sat, 9AM-7PM</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-heading mb-1">Email Support</p>
                          <a href="mailto:vijayaindustries.inc@gmail.com" className="text-foreground lg:text-lg hover:text-primary transition-colors block break-all">
                            vijayaindustries.inc@gmail.com
                          </a>
                          <span className="text-xs text-slate-400">Response within 2-4 hours</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-heading mb-1">Website</p>
                          <a href="#" className="text-foreground text-lg hover:text-primary transition-colors block">
                            www.vijayaindustries.in
                          </a>
                        </div>
                      </div>
                   </div>
                 </div>

                 {/* Corporate Details & Hours Card */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                    {/* GST & Corporate Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-4">
                         <Building className="w-5 h-5 text-primary" />
                         <h4 className="font-bold text-heading">Corporate Info</h4>
                       </div>
                       <div className="mb-3">
                         <span className="block text-xs text-slate-400 mb-0.5">GST Registration</span>
                         <span className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded inline-block">27AQXPC1055E1ZW</span>
                       </div>
                    </div>

                    {/* Business Hours */}
                    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-center">
                       <div className="flex items-center gap-3 mb-4">
                         <Clock className="w-5 h-5 text-primary" />
                         <h4 className="font-bold text-heading">Operating Hours</h4>
                       </div>
                       <ul className="space-y-2 text-sm">
                         <li className="flex justify-between items-center text-foreground">
                           <span>Mon - Sat:</span>
                           <span className="font-semibold">9:00 AM - 7:00 PM</span>
                         </li>
                         <li className="flex justify-between items-center pt-2 border-t border-border mt-2">
                           <span className="text-slate-500">Sunday:</span>
                           <span className="text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded text-xs">Closed</span>
                         </li>
                       </ul>
                    </div>
                 </div>

              </div>
            </div>
          </div>
        </section>

        {/* 3. Google Maps Section */}
        <section className="py-12 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-border overflow-hidden">
                <div className="w-full h-[400px] bg-muted rounded-[1.5rem] relative overflow-hidden flex items-center justify-center">
                  {/* Using an iframe to realistically embed map. 
                      Since no specific coords are supplied, placing a marker in Maharashtra MIDC */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8197793399435!2d72.9998670742517!3d19.071683952110292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c13482fc606b%3A0xeebd1217e65a04cc!2sNavi%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1711200000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vijaya Industries Location Map"
                  ></iframe>
                </div>
            </div>
          </div>
        </section>

        <CTA />
      </main>

      <Footer />
    </>
  );
}
