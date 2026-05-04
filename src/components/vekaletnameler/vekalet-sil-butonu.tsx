"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVekaletname } from "@/lib/actions/vekaletnameler";

export function VekaletSilButonu({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Bu vekâletnameyi silmek istediğinize emin misiniz?\nİlişkili dosya bağlantıları da kaldırılacak.")) return;
    startTransition(async () => {
      const result = await deleteVekaletname(id);
      if (result?.success) {
        toast.warning("Vekâletname silindi");
        router.push("/vekaletnameler");
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
