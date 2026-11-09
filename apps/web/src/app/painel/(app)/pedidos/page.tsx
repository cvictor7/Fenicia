import type { Metadata } from "next";
import { Vazio } from "@/components/cabecalho-loja";

export const metadata: Metadata = { title: "Pedidos" };

export default function PaginaPedidos() {
  return (
    <>
      <h1 className="font-titulo text-2xl font-semibold tracking-tight">Pedidos</h1>
      <div className="mt-5">
        <Vazio
          letra="𐤂"
          titulo="Nenhum pedido ainda"
          texto="Quando um cliente pedir pela vitrine, o pedido aparece aqui e a mensagem chega no seu WhatsApp."
        />
      </div>
    </>
  );
}
