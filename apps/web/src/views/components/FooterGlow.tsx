import Image from "next/image";

export default function FooterGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center">
      <div className="mb-[-24px] z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur">
        <Image src="/images/logoSide.svg" alt="Zuptos monograma" width={28} height={28} />
      </div>
      <div className="relative h-[320px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_farthest-corner_at_100%_100%,rgba(142,45,226,0.95)_10%,rgba(55,0,110,0.85)_15%,rgba(20,0,40,0.8)_25%,rgba(6,0,12,0.7)_80%,rgba(3,0,4,0.3)_80%,transparent_100%)] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#030103]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030104] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030103]/70" />
      </div>
    </div>
  );
}
