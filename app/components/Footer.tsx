import { MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-slate-300 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Left */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center hover:bg-primary/90 transition-colors">
                <span className="text-white font-bold text-xl leading-none font-heading">V</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white uppercase">
                Vijaya <span className="text-primary">Industries</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Premium manufacturer of precision automobile clips and fasteners. Trusted by major distributors and workshops for superior reliability.
            </p>
            <div className="flex items-center gap-4">
              {/* Social Placeholders */}
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary text-white transition-colors"><span className="sr-only">LinkedIn</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary text-white transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
            </div>
          </div>

          {/* Middle Links 1 */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Products</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary transition-colors">Bumper Clips</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Fender Linings</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Trim Panels</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Custom Molding</Link></li>
            </ul>
          </div>

          {/* Middle Links 2 */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Quality Control</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Distributor Network</Link></li>
              <li><Link href="/contact-us" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Right Contact */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Contact Details</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">MIDC Phase II, Plot B-45,<br/>Industrial Area,<br/>Maharashtra 400001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+919326000050" className="text-sm hover:text-white transition-colors">+91 93260 00050</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:vijayaindustries.inc@gmail.com" className="text-sm hover:text-white transition-colors">vijayaindustries.inc@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Vijaya Industries. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
