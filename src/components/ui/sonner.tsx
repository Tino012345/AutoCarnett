import { Toaster as Sonner } from "sonner";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-zinc-900 border-zinc-800 text-white",
          description: "text-zinc-400",
          actionButton: "bg-red-600 text-white",
          cancelButton: "bg-zinc-800 text-zinc-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
