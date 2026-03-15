"use client";
import { createContext, useContext } from "react";

interface PageData {
  revenue?: number;
  expenses?: number;
  profit?: number;
  salesCountToday?: number;
  salesCountWeek?: number;
  salesCountMonth?: number;
  lowStockCount?: number;
  cancelledSales?: number;
  topProducts?: { name: string; total: number }[];
  totalItems?: number;
  lowStockItems?: { name: string; qty: number; min: number }[];
  monthTotal?: number;
  monthCount?: number;
  pendingPurchases?: number;
  totalCustomers?: number;
  totalDebt?: number;
  openShift?: boolean;
}

const CopilotDataContext = createContext<PageData>({});

export function CopilotDataProvider({ data, children }: { data: PageData; children: React.ReactNode }) {
  return <CopilotDataContext.Provider value={data}>{children}</CopilotDataContext.Provider>;
}

export function useCopilotData() {
  return useContext(CopilotDataContext);
}
