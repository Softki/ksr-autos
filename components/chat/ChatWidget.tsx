"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";

import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface Msg { role: "user" | "assistant"; content: string }

interface State {
  messages: Msg[];
  pending: boolean;
  error?: string;
}

type Action =
  | { type: "user"; content: string }
  | { type: "reply"; content: string }
  | { type: "error"; content: string }
  | { type: "clear-error" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "user":
      return { ...state, messages: [...state.messages, { role: "user", content: action.content }], pending: true, error: undefined };
    case "reply":
      return { ...state, messages: [...state.messages, { role: "assistant", content: action.content }], pending: false };
    case "error":
      return { ...state, pending: false, error: action.content };
    case "clear-error":
      return { ...state, error: undefined };
  }
}

const INITIAL_GREETING: Msg = {
  role: "assistant",
  content: "Hallo! Ik help met vragen over ons aanbod, openingstijden en contact. Twijfel? App of bel ons gerust.",
};

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, { messages: [INITIAL_GREETING], pending: false });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.messages.length, state.pending]);

  if (pathname.startsWith("/admin")) return null;

  async function send() {
    const value = input.trim();
    if (!value || state.pending) return;
    setInput("");
    dispatch({ type: "user", content: value });

    try {
      const recent = state.messages.slice(-6).filter((m) => m !== INITIAL_GREETING);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history: recent }),
      });
      const data = await res.json();
      dispatch({ type: "reply", content: data.reply ?? `Neem gerust contact op via ${BUSINESS.phone}.` });
    } catch {
      dispatch({ type: "error", content: `Verbinding mislukt — bel ons op ${BUSINESS.phone}.` });
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-panel"
        className={cn(
          "fixed z-[55] bottom-5 md:bottom-6 right-4 md:right-6",
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-ink)] text-white text-[13px] font-semibold shadow-card",
          "hover:bg-[var(--color-graphite)] transition-colors",
        )}
        initial={false}
        whileTap={{ scale: 0.97 }}
      >
        <MessageCircle className="size-4" aria-hidden />
        Hulp nodig?
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id="chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Chat met KSR Auto's"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[60] bottom-20 md:bottom-24 right-4 md:right-6 w-[min(360px,90vw)] max-h-[70vh] rounded-md overflow-hidden shadow-elevated bg-[var(--color-paper)] border border-[var(--color-line)] flex flex-col"
          >
            <header className="surface-graphite dark-section px-4 py-3 flex items-center justify-between">
              <div>
                <div className="label-mono text-white/60">Assistent</div>
                <div className="font-semibold text-white text-[14px]">KSR Auto&apos;s</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluit chat"
                className="text-white/80 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--color-surface)]">
              {state.messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn("max-w-[85%] text-[14px] leading-relaxed", m.role === "user" ? "ml-auto" : "")}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-md inline-block",
                      m.role === "user"
                        ? "bg-[var(--color-ink)] text-white rounded-br-sm"
                        : "bg-[var(--color-paper)] border border-[var(--color-line)] rounded-bl-sm",
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {state.pending && (
                <div className="px-3 py-2 text-[12px] text-[var(--color-steel)]">Denkt na…</div>
              )}
              {state.error && (
                <div className="px-3 py-2 text-[13px] text-[var(--color-error)]">{state.error}</div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="p-3 border-t border-[var(--color-line)] flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input text-[14px] min-h-[40px] py-2"
                placeholder="Vraag over aanbod of openingstijden…"
                maxLength={600}
                aria-label="Bericht"
              />
              <button type="submit" className="btn btn-dark btn-sm px-3" disabled={state.pending} aria-label="Verstuur">
                <Send className="size-4" aria-hidden />
              </button>
            </form>

            <p className="text-center text-[10.5px] tracking-wide text-[var(--color-steel)] py-2 px-3 border-t border-[var(--color-line)]">
              Alleen bedrijfsinfo + actuele voorraad. Twijfel? Bel <a href={BUSINESS.telHref} className="link tabular">{BUSINESS.phone}</a>.
            </p>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
