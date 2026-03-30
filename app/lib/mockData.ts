export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string | null;
  moq: number;
  stock: number;
  description: string;
  specs: {
    material: string;
    usageArea: string;
    durability: string;
    fitType: string;
  };
};

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: "p1", name: "Hyundai Fender Lining Clip", brand: "Hyundai", category: "Fender", price: 2.50, imageUrl: "/Hyundai Fender Lining Clip.png",
    moq: 500, stock: 15000,
    description: "High-grade OEM equivalent fender lining replacement clip specifically designed to match Hyundai tolerance standards. Engineered for rigorous impact and all-weather structural integrity.",
    specs: { material: "Toughened POM (Acetal)", usageArea: "Exterior Fender Well", durability: "High-impact Weather Resistant", fitType: "Direct OEM Fit" }
  },
  { 
    id: "p2", name: "Maruti Fender Lining Clip", brand: "Maruti", category: "Fender", price: 2.00, imageUrl: "/Maruti Fender Lining Clip.png",
    moq: 1000, stock: 50000,
    description: "Universally trusted Maruti architecture fender lining clip. Ideal for intense aftermarket distribution due to high replacement frequency per vehicle service interval.",
    specs: { material: "Durable Nylon", usageArea: "Exterior Fender Well", durability: "Standard OEM Specification", fitType: "Direct OEM Fit" }
  },
  { 
    id: "p3", name: "Dikky Trim Clip Big", brand: "Universal", category: "Trim", price: 3.50, imageUrl: "/Dikky Trim Clip Big.png",
    moq: 200, stock: 8000,
    description: "Robust boot/dikky interior trim fastener ensuring vibration-free acoustics in the rear luggage compartment.",
    specs: { material: "Reinforced POM", usageArea: "Interior Boot Panel", durability: "Anti-vibration specific", fitType: "Universal 8mm Hole" }
  },
  { 
    id: "p4", name: "Dikky Trim Clip Small", brand: "Universal", category: "Trim", price: 1.80, imageUrl: "/Dikky Trim Clip Small.png",
    moq: 500, stock: 0, // Demonstrating Out of Stock
    description: "Compact interior trim retainer strictly rated for smaller boot panel architectures where space clearance is minimal.",
    specs: { material: "Nylon 66", usageArea: "Interior Trim", durability: "Medium Stress", fitType: "Universal 6mm Hole" }
  },
  { 
    id: "p5", name: "Door Trim Clip", brand: "Universal", category: "Door", price: 2.20, imageUrl: "/Door Trim Clip .png",
    moq: 1000, stock: 25000,
    description: "Industry standard universal door card trim clip. Engineered to lock firmly without acoustic rattling while remaining serviceable and non-destructive on removal.",
    specs: { material: "Flexible POM", usageArea: "Interior Door Panel", durability: "Thousands of insertion cycles", fitType: "Universal Push-fit" }
  },
  { 
    id: "p6", name: "Bidding Clip", brand: "Universal", category: "Bidding", price: 1.50, imageUrl: "/Bidding Clip.png",
    moq: 2000, stock: 40000,
    description: "Crucial weather-stripping/biding profile retainer to guarantee cabin insulation from moisture and road noise.",
    specs: { material: "UV Resistant Nylon", usageArea: "Exterior Window Bidding", durability: "High UV/Thermal Tolerance", fitType: "Universal Channel Lock" }
  },
  { 
    id: "p7", name: "Maruti Bumper & Grill Clip", brand: "Maruti", category: "Bumper", price: 3.00, imageUrl: "/Maruti Bumper & Grill Clip.png",
    moq: 500, stock: 12000,
    description: "Heavy-duty dual-action bumper and front grill retainer. The critical locking mechanism handles frontal aerodynamic shear forces excellently.",
    specs: { material: "Impact-modified POM", usageArea: "Front Bumper / Radiator Grill", durability: "Severe vibration resilience", fitType: "Exact Maruti Spec" }
  },
  { 
    id: "p8", name: "Tata Heavy Duty Bumper Clip", brand: "Tata", category: "Bumper", price: 4.50, imageUrl: null,
    moq: 300, stock: 5000,
    description: "Commercial vehicle and SUV grade bumper structurally rated fastener. Massively thick center pin to reduce shearing on heavy impacts.",
    specs: { material: "Glass-filled Nylon", usageArea: "Heavy Chassis Bumper", durability: "Extreme impact rating", fitType: "Tata CV/SUV fitment" }
  },
  { 
    id: "p9", name: "Mahindra Exterior Retainer", brand: "Mahindra", category: "Fender", price: 2.80, imageUrl: null,
    moq: 400, stock: 9500,
    description: "Rugged exterior molding clip suited for the aggressive styling and panel gaps intrinsic to off-road application vehicles.",
    specs: { material: "Toughened POM", usageArea: "Exterior Cladding", durability: "Mud/Water resistant geometry", fitType: "Utility Vehicle Standard" }
  },
  { 
    id: "p10", name: "Universal Door Panel Pin", brand: "Universal", category: "Door", price: 1.20, imageUrl: null,
    moq: 2500, stock: 100000,
    description: "Extremely cost-effective bulk solution for independent service garages performing massive volumes of interior card removals.",
    specs: { material: "Recycled Nylon Blend", usageArea: "General Cabin Panels", durability: "Standard Use", fitType: "Universal 7mm/8mm adapt" }
  },
  { 
    id: "p11", name: "Hyundai Underbody Shield Fastener", brand: "Hyundai", category: "Bumper", price: 5.00, imageUrl: null,
    moq: 250, stock: 3000, // Demonstrating limited stock
    description: "Critical aerodynamic and thermal shield fastener located immediately beneath the engine bay requiring massive heat tolerance.",
    specs: { material: "High-Temp Specialized Polymer", usageArea: "Engine Undershield", durability: "Thermal radiation resistant", fitType: "Hyundai Sedan Spec" }
  },
  { 
    id: "p12", name: "Maruti Roof Lining Button", brand: "Maruti", category: "Trim", price: 1.90, imageUrl: null,
    moq: 400, stock: 12000,
    description: "Aesthetically pleasing headliner mounting button featuring a textured surface to blend invisibly into cabin fabrics.",
    specs: { material: "Textured ABS Plastic", usageArea: "Interior Roof/Headliner", durability: "Aesthetic fade-resistant", fitType: "Push-in lock" }
  },
];

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

export function getRelatedProducts(category: string, excludeId: string): Product[] {
  return MOCK_PRODUCTS.filter(p => p.category === category && p.id !== excludeId).slice(0, 4);
}
