import { resolveAsset } from "../src/lib/assets";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-parchment px-6 py-16">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 rounded-3xl border-2 border-gold/60 bg-white/70 p-10 text-center shadow-xl">
        <img
          src={resolveAsset("mascot.placeholder")}
          alt="ตัวอย่างพื้นที่ Mascot ของ HSK Mind"
          className="h-36 w-64 rounded-xl object-cover"
        />
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-vermilion">
            Foundation
          </p>
          <h1 className="text-4xl font-bold text-ink">HSK Mind</h1>
          <p className="mt-4 text-lg text-ink/75">
            รากฐานระบบพร้อมสำหรับ Phase 1 — Authentication และ Onboarding
            จะเริ่มใน Phase 2
          </p>
        </div>
      </section>
    </main>
  );
}
