"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ArrowLeft,
  BellRing,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  is_available?: boolean | null;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

const FALLBACK_MENU: MenuItem[] = [
  {
    id: "demo-1",
    name: "Izgara Köfte",
    description: "Özel baharatlı el yapımı köfte, közlenmiş biber ve pilav ile.",
    price: 340,
    category: "Ana Yemekler",
    is_available: true,
  },
  {
    id: "demo-2",
    name: "Tavuk Şiş",
    description: "Marine edilmiş yumuşak tavuk parçaları ve taze yeşillik eşliğinde.",
    price: 290,
    category: "Ana Yemekler",
    is_available: true,
  },
  {
    id: "demo-3",
    name: "Mevsim Salata",
    description: "Taze mevsim yeşillikleri, zeytinyağı ve limon sosu ile.",
    price: 130,
    category: "Başlangıçlar",
    is_available: true,
  },
  {
    id: "demo-4",
    name: "Ayran",
    description: "Soğuk ve köpüklü yayık ayranı.",
    price: 55,
    category: "İçecekler",
    is_available: true,
  },
];

export default function TableMenuPage() {
  const params = useParams<{ id: string }>();
  const tableId = params?.id ?? "1";

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.from("menu_items").select("*");

      if (error || !data || data.length === 0) {
        setMenuItems(FALLBACK_MENU);
      } else {
        const availableItems = data.filter(
          (row: MenuItem) => row.is_available !== false
        );
        setMenuItems(availableItems.length > 0 ? availableItems : FALLBACK_MENU);
      }

      setLoading(false);
    }

    loadMenu();
  }, []);

  function addToCart(item: MenuItem) {
    setOrderSent(false);
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  const totalAmount = cart.reduce(
    (sum, c) => sum + Number(c.item.price || 0) * c.quantity,
    0
  );

  async function handleSendOrder() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      table_number: String(tableId),
      status: "pending",
      total_price: totalAmount,
      items: cart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
      })),
    };

    const { error } = await supabase.from("orders").insert([payload]);

    if (error) {
      setErrorMsg(
        "Sipariş kaydedilirken bir sorun oluştu: " + error.message
      );
      setSubmitting(false);
      return;
    }

    setCart([]);
    setOrderSent(true);
    setSubmitting(false);
  }

  async function handleCallWaiter() {
    setWaiterCalled(true);
    await supabase.from("table_calls").insert([
      {
        table_number: String(tableId),
        status: "calling",
      },
    ]);
    setTimeout(() => setWaiterCalled(false), 4000);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-36">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
              aria-label="Ana Sayfa"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">Masa {tableId}</span>
              </div>
              <p className="text-xs text-slate-500">Dijital QR Menü</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCallWaiter}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{waiterCalled ? "Garson Çağrıldı" : "Garson Çağır"}</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {orderSent && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div className="text-sm font-medium">
              Siparişiniz mutfağa iletildi! En kısa sürede hazırlanacaktır.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Menü yükleniyor...
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">Menü</h2>
            {menuItems.map((item) => {
              const inCart = cart.find((c) => c.item.id === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    {item.category && (
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-900">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="font-bold text-amber-700 text-sm pt-1">
                      {Number(item.price).toFixed(2)} ₺
                    </p>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ekle</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  {cart.reduce((acc, c) => acc + c.quantity, 0)} ürün seçildi
                </p>
                <p className="text-base font-bold text-slate-900">
                  {totalAmount.toFixed(2)} ₺
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSendOrder}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting ? "Gönderiliyor..." : "Siparişi Gönder"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
