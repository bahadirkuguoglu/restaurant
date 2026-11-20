"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ClipboardList,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  RefreshCw,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  table_number: string;
  status: string;
  total_price: number;
  items: OrderItem[];
  created_at?: string;
}

interface TableCall {
  id: string;
  table_number: string;
  status: string;
  created_at?: string;
}

export default function PanelPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<TableCall[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: callData } = await supabase
      .from("table_calls")
      .select("*")
      .eq("status", "calling")
      .order("created_at", { ascending: false });

    if (orderData) setOrders(orderData as Order[]);
    if (callData) setCalls(callData as TableCall[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("restaurant-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "table_calls" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateOrderStatus(orderId: string, nextStatus: string) {
    await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId);
    fetchData();
  }

  async function resolveCall(callId: string) {
    await supabase
      .from("table_calls")
      .update({ status: "resolved" })
      .eq("id", callId);
    fetchData();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-900">
                Mutfak &amp; Sipariş Takip Paneli
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yenile</span>
          </button>
        </header>

        {calls.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <BellRing className="w-4 h-4 text-amber-600" />
              <span>Aktif Garson Çağrıları</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-3 bg-white border border-amber-200 px-3 py-2 rounded-xl text-sm"
                >
                  <span className="font-bold text-slate-900">
                    Masa {call.table_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => resolveCall(call.id)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
                  >
                    İlgilenildi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Siparişler yükleniyor...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <p className="font-semibold text-slate-800">Henüz aktif sipariş yok</p>
            <p className="text-sm text-slate-500">
              Herhangi bir masa ekranından (/masa/1) sipariş verildiğinde burada anında görünecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-sm font-bold">
                      Masa {order.table_number}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "preparing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status === "completed"
                        ? "Teslim Edildi"
                        : order.status === "preparing"
                        ? "Hazırlanıyor"
                        : "Yeni Sipariş"}
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-100 text-sm">
                    {Array.isArray(order.items) &&
                      order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="py-2 flex items-center justify-between"
                        >
                          <span>
                            <strong className="text-slate-900">
                              {item.quantity}x
                            </strong>{" "}
                            {item.name}
                          </span>
                          <span className="text-slate-600">
                            {(Number(item.price) * item.quantity).toFixed(2)} ₺
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    Toplam: {Number(order.total_price || 0).toFixed(2)} ₺
                  </span>

                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Hazırla</span>
                      </button>
                    )}

                    {order.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Teslim Et</span>
                      </button>
                    )}

                    {order.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tamamlandı</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
