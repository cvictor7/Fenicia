import { describe, expect, it } from "vitest";
import { podeCancelar, proximoStatus, transicaoPermitida } from "./status-pedido";

describe("status do pedido", () => {
  it("segue o caminho em ordem", () => {
    expect(proximoStatus("novo")).toBe("confirmado");
    expect(proximoStatus("enviado")).toBe("entregue");
    expect(proximoStatus("entregue")).toBeNull();
    expect(proximoStatus("cancelado")).toBeNull();
  });

  it("não pula etapas nem volta", () => {
    expect(transicaoPermitida("novo", "confirmado")).toBe(true);
    expect(transicaoPermitida("novo", "pago")).toBe(false);
    expect(transicaoPermitida("pago", "confirmado")).toBe(false);
    expect(transicaoPermitida("entregue", "enviado")).toBe(false);
  });

  it("cancela só antes de enviar", () => {
    expect(podeCancelar("novo")).toBe(true);
    expect(podeCancelar("pago")).toBe(true);
    expect(podeCancelar("enviado")).toBe(false);
    expect(transicaoPermitida("cancelado", "cancelado")).toBe(false);
  });
});
