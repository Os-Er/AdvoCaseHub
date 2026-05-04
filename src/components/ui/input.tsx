"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

/**
 * Base UI'ın "A component is changing the default value state of an
 * uncontrolled FieldControl" uyarısını kalıcı olarak çözer.
 *
 * Strateji — "internally-controlled" pattern:
 *   • InputPrimitive'e HİÇBİR ZAMAN defaultValue geçilmez.
 *   • value prop'u dışarıdan geldiyse (controlled): value ?? ""
 *   • Sadece defaultValue geldiyse (uncontrolled): kendi state'imiz ile
 *     her zaman controlled olarak tutulur, dışarıya uncontrolled gibi davranır.
 *
 * Böylece Base UI, ilk render'dan sonra hiç "defaultValue değişti" uyarısı
 * görmez; FormData tabanlı form submit'leri bozulmadan çalışmaya devam eder.
 */
function Input({
  className,
  type,
  value: valueProp,
  defaultValue,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  // Dışarıdan value geçildiyse controlled mod
  const isControlled = valueProp !== undefined;

  // Uncontrolled kullanım için dahili state —
  // defaultValue'dan başlatılır, InputPrimitive'e HİÇ defaultValue gitmez.
  const [internalValue, setInternalValue] = React.useState<string>(
    () => String(valueProp ?? defaultValue ?? "")
  );

  // Farklı bir kaydın düzenlenmesi gibi durumlarda defaultValue değişirse senkronize et
  React.useEffect(() => {
    if (!isControlled) {
      setInternalValue(String(defaultValue ?? ""));
    }
    // isControlled kasıtlı omit edildi — flip-flop'u önler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      // Her zaman value= ile controlled — defaultValue HİÇ geçilmez
      value={isControlled ? (valueProp ?? "") : internalValue}
      onChange={handleChange}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Input };
