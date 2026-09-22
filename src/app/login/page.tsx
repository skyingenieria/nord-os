import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya hay sesión, no mostrar el login.
  if (user) redirect("/admin");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            nord-os
          </p>
          <h1 className="text-2xl font-semibold mt-1">Iniciar sesión</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
