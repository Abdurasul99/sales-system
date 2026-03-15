"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Bot, X, Send, Loader2, Minimize2, Maximize2,
  Sparkles, ChevronRight, RotateCcw, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_SUGGESTIONS } from "@/lib/ai/copilot-context";
import { useCopilotData } from "./CopilotDataProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface CopilotUser {
  fullName: string;
  role: string;
  planName: string | null;
  organizationName: string | null;
}

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
}

interface AICopilotProps {
  user: CopilotUser;
  pageData?: PageData;
}

const PAGE_TITLES: Record<string, string> = {
  analytics: "Аналитика",
  sales: "Продажи / POS",
  products: "Товары",
  categories: "Категории",
  warehouse: "Склад",
  expenses: "Расходы",
  income: "Доходы",
  suppliers: "Поставщики",
  customers: "Клиенты",
  currency: "Обмен валют",
  shifts: "Смены",
  notifications: "Уведомления",
  settings: "Настройки",
  superadmin: "Суперадмин",
};

function getPageFromPath(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean);
  return seg[seg.length - 1] || "analytics";
}

export function AICopilot({ user, pageData }: AICopilotProps) {
  const pathname = usePathname();
  const currentPage = getPageFromPath(pathname);
  const contextData = useCopilotData();
  const effectivePageData = pageData ?? contextData;
  const pageTitle = PAGE_TITLES[currentPage] ?? "Система";

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggestions = PAGE_SUGGESTIONS[currentPage] ?? PAGE_SUGGESTIONS.default;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Reset unread on open
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Greet on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        role: "assistant",
        content: `Привет, ${user.fullName.split(" ")[0]}! 👋 Я ваш AI-копилот.\n\nСейчас вы на странице **${pageTitle}**. Чем могу помочь?\n\nМожете написать вопрос или выбрать подсказку ниже.`,
      };
      setMessages([greeting]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const assistantMsg: Message = { role: "assistant", content: "", isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages
      .filter(m => !m.isStreaming)
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: text.trim(),
          pageContext: {
            page: currentPage,
            pageTitle,
            data: effectivePageData ?? {},
          },
          history,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === "AI_NOT_CONFIGURED") {
          setNotConfigured(true);
          setMessages(prev => prev.slice(0, -1).concat({
            role: "assistant",
            content: "⚠️ AI-копилот не настроен. Добавьте OPENAI_API_KEY в переменные окружения Vercel.",
          }));
          return;
        }
        throw new Error(err.message ?? "Ошибка запроса");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: fullContent };
              return updated;
            });
            if (!isOpen) setHasUnread(true);
            break;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: `❌ Ошибка AI: ${parsed.error}` };
                return updated;
              });
              return;
            }
            if (parsed.text) {
              fullContent += parsed.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullContent, isStreaming: true };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      // If stream ended without any content or [DONE], show fallback
      if (!fullContent) {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.isStreaming) {
            updated[updated.length - 1] = { role: "assistant", content: "Нет ответа от AI. Проверьте OPENAI_API_KEY." };
          }
          return updated;
        });
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages(prev => prev.slice(0, -1).concat({
        role: "assistant",
        content: "Произошла ошибка. Попробуйте ещё раз.",
      }));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentPage, pageTitle, effectivePageData, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-2xl shadow-xl shadow-purple-200 transition-all hover:scale-105 active:scale-95"
        title="AI Копилот"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:block">AI Копилот</span>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl shadow-purple-100/50 border border-purple-100 transition-all duration-200",
        isMinimized
          ? "w-72 h-14"
          : "w-80 sm:w-96 h-[520px] sm:h-[580px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-none">AI Копилот</p>
          {!isMinimized && (
            <p className="text-white/70 text-xs mt-0.5 truncate">{pageTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <button
              onClick={resetChat}
              className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              title="Новый диалог"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(m => !m)}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isMinimized ? null : (
        <>
          {/* Not configured warning */}
          {notConfigured && (
            <div className="flex items-start gap-2 mx-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>Добавьте OPENAI_API_KEY в переменные окружения для активации AI.</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-sm"
                      : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100",
                  )}
                >
                  <MessageContent content={msg.content} />
                  {msg.isStreaming && (
                    <span className="inline-block w-1 h-3.5 bg-purple-400 animate-pulse ml-0.5 rounded-sm" />
                  )}
                </div>
              </div>
            ))}

            {/* Suggestions (shown after greeting) */}
            {messages.length === 1 && (
              <div className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="flex items-center gap-2 w-full text-left text-xs px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors border border-purple-100"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Спросите что-нибудь..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
              >
                {isLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-300 mt-1.5">
              Enter — отправить · Shift+Enter — новая строка
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Renders markdown-like formatting (bold, lists, line breaks)
function MessageContent({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Bold: **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Bullet list
        if (line.match(/^[-•*]\s/)) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•*]\s/, "") }} />
            </div>
          );
        }

        // Numbered list
        if (line.match(/^\d+\.\s/)) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="shrink-0 text-purple-500 font-medium">{line.match(/^\d+/)?.[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, "") }} />
            </div>
          );
        }

        return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}
