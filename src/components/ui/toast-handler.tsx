"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

function Handler() {
  const params   = useSearchParams();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const msg  = params.get("toast");
    const type = params.get("toast_type") ?? "success";
    if (!msg) return;

    if (type === "error")        toast.error(msg);
    else if (type === "warning") toast.warning(msg);
    else                         toast.success(msg);

    // URL'den toast parametresini temizle
    const sp = new URLSearchParams(params.toString());
    sp.delete("toast");
    sp.delete("toast_type");
    const clean = sp.toString() ? `${pathname}?${sp}` : pathname;
    router.replace(clean, { scroll: false });
  }, [params, router, pathname]);

  return null;
}

export function ToastHandler() {
  return (
    <Suspense fallback={null}>
      <Handler />
    </Suspense>
  );
}
