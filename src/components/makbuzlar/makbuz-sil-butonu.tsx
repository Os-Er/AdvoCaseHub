"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMakbuz } from "@/lib/actions/makbuzlar";

export function MakbuzSilButonu({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Bu makbuzu silmek istediğinize emin misiniz?\nİlişkili dosya bağlantıları da kaldırılacak.")) return;
    startTransition(async () => {
      const result = await deleteMakbuz(id);
      if (result?.success) {
        toast.warning("Makbuz silindi");
        router.push("/makbuzlar");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
    >
      <Trash2 className="w-4 h-4 mr-1.5" />
      {pending ? "Siliniyor..." : "Sil"}
    </Button>
  );
}
