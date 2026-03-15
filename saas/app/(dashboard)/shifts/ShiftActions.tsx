"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OpenProps {
  mode: "open";
  defaultBranchId: string;
  branches: { id: string; name: string }[];
}

interface CloseProps {
  mode: "close";
  shiftId: string;
}

type ShiftActionsProps = OpenProps | CloseProps;

export function ShiftActions(props: ShiftActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(
    props.mode === "open" ? props.defaultBranchId : ""
  );
  const [showCloseForm, setShowCloseForm] = useState(false);

  async function handleOpenShift() {
    if (!openingBalance) {
      toast.error("Укажите начальный баланс");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingBalance: Number(openingBalance),
          branchId: selectedBranch,
        }),
      });
      if (res.ok) {
        toast.success("Смена открыта");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseShift() {
    if (!closingBalance) {
      toast.error("Укажите конечный баланс");
      return;
    }
    if (props.mode !== "close") return;
    setLoading(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftId: props.shiftId,
          closingBalance: Number(closingBalance),
          notes: notes || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Смена закрыта");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  }

  if (props.mode === "open") {
    return (
      <div className="flex flex-col gap-3 min-w-[260px]">
        {props.branches.length > 1 && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {props.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Начальный баланс (сум)"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleOpenShift}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Открыть смену"}
          </button>
        </div>
      </div>
    );
  }

  if (!showCloseForm) {
    return (
      <button
        onClick={() => setShowCloseForm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
      >
        Закрыть смену
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 min-w-[280px]">
      <input
        type="number"
        placeholder="Конечный баланс (сум)"
        value={closingBalance}
        onChange={(e) => setClosingBalance(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
      />
      <textarea
        placeholder="Заметки (необязательно)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setShowCloseForm(false)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          onClick={handleCloseShift}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Закрыть"}
        </button>
      </div>
    </div>
  );
}
