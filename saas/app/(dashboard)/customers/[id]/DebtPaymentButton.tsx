"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatUzs } from "@/lib/utils";

interface DebtPaymentButtonProps {
  customerId: string;
  debtAmount: number;
}

export function DebtPaymentButton({ customerId, debtAmount }: DebtPaymentButtonProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Укажите сумму оплаты");
      return;
    }
    if (value > debtAmount) {
      toast.error("Сумма превышает долг");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/debt-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      if (res.ok) {
        toast.success("Оплата долга записана");
        setShowForm(false);
        setAmount("");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex-shrink-0"
      >
        Записать оплату долга
      </button>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <input
        type="number"
        placeholder={`Макс: ${formatUzs(debtAmount)}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none w-48"
      />
      <button
        onClick={() => setShowForm(false)}
        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
      >
        Отмена
      </button>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "..." : "Оплатить"}
      </button>
    </div>
  );
}
