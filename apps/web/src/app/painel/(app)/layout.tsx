import { Navegacao } from "@/components/navegacao";

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-md px-4 pb-28 pt-6">{children}</main>
      <Navegacao />
    </>
  );
}
