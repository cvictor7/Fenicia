/**
 * Ilustração do fluxo feita só com HTML: post do Instagram → produto → mensagem no WhatsApp.
 * Sem imagem para baixar: carrega na hora e fica nítida em qualquer tela.
 */
export function Demonstracao() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[340px] select-none">
      {/* post do Instagram */}
      <div className="w-[72%] -rotate-3 rounded-2xl bg-white p-2.5 text-tinta shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)]">
        <div className="flex items-center gap-2 px-0.5 pb-2">
          <span className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#f9b234] via-[#e1306c] to-[#833ab4] p-[2px]">
            <span className="block h-full w-full rounded-full border-2 border-white bg-[#0f6e56]" />
          </span>
          <span className="text-[11px] font-semibold">mare.atelie</span>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[#e9dfd3]">
          <span className="absolute bottom-0 left-1/2 h-[78%] w-[46%] -translate-x-1/2 bg-[#2f2b2a] [clip-path:polygon(32%_0,68%_0,74%_22%,100%_100%,0_100%,26%_22%)]" />
        </div>
        <p className="px-0.5 pt-2 text-[11px] leading-snug">
          <b>mare.atelie</b> Vestido midi de linho 🌿 Tam: P, M e G. Cores: preto e areia.{" "}
          <span className="rounded bg-murex/60 px-0.5">R$ 129,90</span>
        </p>
      </div>

      {/* produto montado */}
      <div className="-mt-16 ml-auto w-[64%] rotate-2 rounded-[6px_20px_20px_20px] bg-sobre-purpura p-3 text-tinta shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)]">
        <p className="font-titulo text-[15px] font-bold leading-tight">Vestido midi de linho</p>
        <p className="mt-0.5 font-titulo text-lg font-extrabold">R$ 129,90</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {["P", "M", "G"].map((t) => (
            <span key={t} className="rounded-full border border-purpura-200 px-2 text-[11px] font-semibold">{t}</span>
          ))}
          {["Preto", "Areia"].map((t) => (
            <span key={t} className="rounded-full bg-purpura-700 px-2 text-[11px] font-semibold text-sobre-purpura">{t}</span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-tinta-suave">6 variações · estoque por tamanho e cor</p>
      </div>

      {/* mensagem no WhatsApp */}
      <div className="-mt-3 w-[70%] -rotate-1 rounded-[4px_16px_16px_16px] bg-[#d9fdd3] px-3 py-2 text-[12px] leading-snug text-[#111b21] shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)]">
        Olá! Quero fazer o pedido #0012:
        <br />• 1x Vestido midi de linho (M · Preto)
        <br />
        <b>Total: R$ 129,90</b>
        <span className="mt-0.5 block text-right text-[10px] text-[#667781]">21:08 ✓✓</span>
      </div>
    </div>
  );
}
