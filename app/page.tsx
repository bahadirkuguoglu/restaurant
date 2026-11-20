import Link from "next/link";
import { UtensilsCrossed, QrCode, ClipboardList, ArrowRight } from "lucide-react";

export default function HomePage() {
  const sampleTables = [1, 2, 3, 4];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6">
      <div className="max-w-3xl w-full mx-auto pt-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
          <UtensilsCrossed className="w-4 h-4" />
          <span>Restaurant OS</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            QR Dijital Menü, Masa Yönetimi ve Anlık Sipariş Takibi
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">
            Masalara özel QR menü ekranlarını test etmek veya anlık sipariş akışını görüntülemek için aşağıdaki bağlantıları kullanabilirsin.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <QrCode className="w-5 h-5 text-amber-600" />
              <span>Örnek Masa Ekranları</span>
            </div>
            <span className="text-xs text-slate-400">Canlı Test</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sampleTables.map((tableNo) => (
              <Link
                key={tableNo}
                href={`/masa/${tableNo}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group"
              >
                <span className="font-medium text-slate-800 group-hover:text-amber-700">
                  Masa {tableNo}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <span>Sipariş ve Masa Takip Paneli</span>
            </div>
            <p className="text-sm text-slate-500">
              Gelen siparişleri ve masa durumlarını gerçek zamanlı izle.
            </p>
          </div>
          <Link
            href="/panel"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
          >
            <span>Panele Git</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <footer className="max-w-3xl w-full mx-auto pt-10 pb-4 text-center text-xs text-slate-400">
        Restaurant OS • Supabase &amp; Next.js Altyapısı
      </footer>
    </main>
  );
}
