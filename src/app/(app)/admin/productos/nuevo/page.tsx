import Link from "next/link";
import { getActiveSchool } from "@/lib/school";
import { ProductForm } from "./product-form";

export default async function NuevoProductoPage() {
  const school = await getActiveSchool();

  return (
    <div className="px-6 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/productos" className="text-sm text-neutral-500">
          ← Productos
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Nueva prenda</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Se crea en {school?.name ?? "el colegio activo"}. Los talles y el SKU
          se cargan después, en el detalle de la prenda.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
