import { Mail, Phone, Factory } from "lucide-react";

export default function TrustBar() {
  return (
    <div className="bg-secondary text-white py-2 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <span className="font-semibold text-primary">GST:</span> 27AQXPC1055E1ZW
          </span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Factory className="w-3.5 h-3.5" /> Industrial Supplier
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:+919326000050" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Phone className="w-3.5 h-3.5" /> +91 93260 00050
          </a>
          <span className="hidden sm:inline opacity-40">|</span>
          <a href="mailto:vijayaindustries.inc@gmail.com" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Mail className="w-3.5 h-3.5" /> vijayaindustries.inc@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
