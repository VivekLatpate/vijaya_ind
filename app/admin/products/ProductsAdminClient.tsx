"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminDrawer from "@/app/admin/components/AdminDrawer";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import StatusBadge from "@/app/admin/components/StatusBadge";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Product = {
  _id: string;
  name: string;
  sku: string;
  category: Category;
  brand: string;
  model: string;
  description: string;
  images: string[];
  price: number;
  gstRate: number;
  moq: number;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
};

const emptyProductForm = {
  name: "",
  sku: "",
  category: "",
  brand: "",
  model: "",
  description: "",
  images: "",
  price: "0",
  gstRate: "18",
  moq: "1",
  stock: "0",
  lowStockThreshold: "5",
  isActive: true,
};

export default function ProductsAdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryName, setCategoryName] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!productsResponse.ok) throw new Error(productsData.error ?? "Failed to load products.");
      if (!categoriesResponse.ok) throw new Error(categoriesData.error ?? "Failed to load categories.");

      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.brand, product.model, product.category?.name]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [products, search]);

  const openCreateDrawer = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category?._id ?? "",
      brand: product.brand,
      model: product.model,
      description: product.description,
      images: product.images.join(", "),
      price: String(product.price),
      gstRate: String(product.gstRate),
      moq: String(product.moq),
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold),
      isActive: product.isActive,
    });
    setDrawerOpen(true);
  };

  const submitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...productForm,
      images: productForm.images
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
    const method = editingProduct ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save product.");

      toast.success(editingProduct ? "Product updated." : "Product created.");
      setDrawerOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product.");
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to delete product.");
      toast.success("Product deleted.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product.");
    }
  };

  const toggleProduct = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to toggle visibility.");
      toast.success(`Product ${product.isActive ? "hidden" : "activated"}.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle visibility.");
    }
  };

  const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create category.");
      setCategoryName("");
      toast.success("Category created.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category.");
    }
  };

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Products"
        title="Catalogue and category management"
        description="Add, edit, hide, or delete products and keep category structure tidy for the website and admin operations."
        action={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCategoryDrawerOpen(true)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-heading hover:bg-slate-50"
            >
              Manage Categories
            </button>
            <button
              type="button"
              onClick={openCreateDrawer}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Add Product
            </button>
          </div>
        }
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, SKU, brand, model, or category"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4 md:max-w-md"
          />
          <p className="text-sm text-foreground">{filteredProducts.length} products shown</p>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Product", "Category", "Pricing", "Stock", "Visibility", "Actions"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-heading">{product.name}</p>
                      <p className="mt-1 text-sm text-foreground">{product.sku}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      <p>Rs. {product.price.toFixed(2)}</p>
                      <p className="mt-1">GST {product.gstRate}%</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      <p>{product.stock} units</p>
                      <p className="mt-1">MOQ {product.moq}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={product.isActive ? "green" : "slate"} label={product.isActive ? "Visible" : "Hidden"} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEditDrawer(product)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Edit</button>
                        <button type="button" onClick={() => void toggleProduct(product)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                          {product.isActive ? "Hide" : "Show"}
                        </button>
                        <button type="button" onClick={() => void removeProduct(product._id)} className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminDrawer
        open={drawerOpen}
        title={editingProduct ? "Edit Product" : "Add Product"}
        description="Maintain product catalogue details, website visibility, and stock defaults."
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={submitProduct} className="grid gap-4">
          {[
            ["name", "Product Name"],
            ["sku", "SKU"],
            ["brand", "Brand"],
            ["model", "Model"],
            ["price", "Selling Price"],
            ["gstRate", "GST Rate"],
            ["moq", "MOQ"],
            ["stock", "Initial Stock"],
            ["lowStockThreshold", "Low Stock Threshold"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium text-heading">
              {label}
              <input
                value={productForm[key as keyof typeof productForm] as string}
                onChange={(event) =>
                  setProductForm((current) => ({ ...current, [key]: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4"
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm font-medium text-heading">
            Category
            <select
              value={productForm.category}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, category: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-heading">
            Description
            <textarea
              value={productForm.description}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-heading">
            Image URLs or paths
            <input
              value={productForm.images}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, images: event.target.value }))
              }
              placeholder="/image-a.png, /image-b.png"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-heading">
            <input
              type="checkbox"
              checked={productForm.isActive}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Product visible on website
          </label>

          <button type="submit" className="rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            {editingProduct ? "Save Changes" : "Create Product"}
          </button>
        </form>
      </AdminDrawer>

      <AdminDrawer
        open={categoryDrawerOpen}
        title="Category Management"
        description="Create categories for your website catalogue and admin workflows."
        onClose={() => setCategoryDrawerOpen(false)}
      >
        <form onSubmit={createCategory} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-heading">
            Category Name
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4"
            />
          </label>
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            Add Category
          </button>
        </form>

        <div className="mt-6 grid gap-3">
          {categories.map((category) => (
            <div key={category._id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <p className="font-semibold text-heading">{category.name}</p>
              <p className="mt-1 text-foreground">{category.slug}</p>
            </div>
          ))}
        </div>
      </AdminDrawer>
    </div>
  );
}
