"use client";
import { useState } from "react";
import { CheckCircle, Package, Tag, ShoppingCart, Building2, ArrowRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "Добро пожаловать!", icon: Building2, desc: "Давайте настроим систему за 4 шага" },
  { id: 2, title: "Добавьте категорию", icon: Tag, desc: "Например: Напитки, Молочные, Бакалея" },
  { id: 3, title: "Добавьте первый товар", icon: Package, desc: "Введите название и цену продажи" },
  { id: 4, title: "Вы готовы!", icon: ShoppingCart, desc: "Система настроена и готова к работе" },
];

interface OnboardingWizardProps {
  organizationId: string;
  onComplete: () => void;
}

export function OnboardingWizard({ organizationId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");

  async function createCategory() {
    if (!categoryName.trim()) { toast.error("Введите название категории"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim(), organizationId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      setCategoryId(data.id);
      setStep(3);
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  async function createProduct() {
    if (!productName.trim() || !productPrice) { toast.error("Введите название и цену"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName.trim(), sellingPrice: parseFloat(productPrice), costPrice: 0, unit: "шт", categoryId, organizationId, minStockLevel: 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      setStep(4);
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {STEPS.map((s) => (
            <div key={s.id} className={cn("w-2.5 h-2.5 rounded-full transition-all", s.id === step ? "bg-purple-600 w-6" : s.id < step ? "bg-purple-300" : "bg-gray-200")} />
          ))}
        </div>

        <div className="px-8 pb-8 pt-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentStep.title}</h2>
            <p className="text-gray-500 text-sm mt-1">{currentStep.desc}</p>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-sm text-purple-800">Аккаунт создан • 30 дней бесплатно</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Tag className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-600">Создайте категорию товаров</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Package className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-600">Добавьте первый товар</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-600">Начните продавать</span>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 mt-4">
                Начать настройку <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onComplete} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                Пропустить, настрою позже
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название категории</label>
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createCategory()}
                  placeholder="Например: Напитки"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Напитки", "Молочные", "Бакалея", "Снеки", "Хозтовары"].map((s) => (
                  <button key={s} onClick={() => setCategoryName(s)} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100">
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={createCategory} disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Далее</>}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название товара</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Например: Вода 0.5л"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена продажи (сум)</label>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="3000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button onClick={createProduct} disabled={saving} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" />Добавить товар</>}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm">Категория и товар созданы. Теперь откройте смену и начните продавать!</p>
              <button onClick={onComplete} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold">
                Начать работу 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
