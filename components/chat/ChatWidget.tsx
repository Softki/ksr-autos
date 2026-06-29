"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

import { BUSINESS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Msg {
  role: "user" | "assistant";
  content: string;
  /** true while the assistant message is still streaming in */
  streaming?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Quick-reply chips shown on a fresh conversation                           */
/* -------------------------------------------------------------------------- */

const QUICK_REPLIES = [
  "Wat hebben jullie op voorraad?",
  "Openingstijden?",
  "Waar zitten jullie?",
  "Auto inruilen?",
];

/* -------------------------------------------------------------------------- */
/*  Greeting                                                                  */
/* -------------------------------------------------------------------------- */

const INITIAL_GREETING: Msg = {
  role: "assistant",
  content:
    "Hallo! Ik help met vragen over ons aanbod, openingstijden en contact. Twijfel? App of bel ons gerust.",
};

/* -------------------------------------------------------------------------- */
/*  Linkify: turn URLs / /aanbod... paths into <a> elements                  */
/* -------------------------------------------------------------------------- */

function Linkified({ text }: { text: string }) {
  // Match http(s) URLs and relative /... paths
  const parts = text.split(/(https?:\/\/[^\s]+|\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="link underline">
              {part}
            </a>
          );
        }
        if (/^\/[^\s]/.test(part)) {
          return (
            <a key={i} href={part} className="link underline">
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Typing indicator (three animated dots)                                    */
/* -------------------------------------------------------------------------- */

function TypingDots() {
  return (
    <div className="flex items-center gap-[3px] px-3 py-2.5" aria-label="KSR Assistent typt…" role="status">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block size-[6px] rounded-full bg-[var(--color-mute)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ChatWidget                                                                */
/* -------------------------------------------------------------------------- */

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INITIAL_GREETING]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [chipsUsed, setChipsUsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Auto-scroll to bottom whenever messages change or streaming updates
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [shouldReduceMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pending, scrollToBottom]);

  // Global event: other components can open the chat with `ksr:open-chat`
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ksr:open-chat", handler);
    return () => window.removeEventListener("ksr:open-chat", handler);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  /* ---------------------------------------------------------------------- */
  /*  Send message + consume streaming response                              */
  /* ---------------------------------------------------------------------- */

  async function send(overrideValue?: string) {
    const value = (overrideValue ?? input).trim();
    if (!value || pending) return;
    setInput("");
    setError(undefined);
    if (overrideValue) setChipsUsed(true);

    setMessages((prev) => [...prev, { role: "user", content: value }]);
    setPending(true);

    // Add a placeholder assistant message that we'll stream into
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      const recent = messages
        .slice(-6)
        .filter((m) => m !== INITIAL_GREETING)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history: recent }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        accumulated += dec.decode(chunk, { stream: true });

        // Snapshot so the updater closure captures an immutable value instead of
        // the reassigned `accumulated` binding (React Compiler safety).
        const snapshot = accumulated;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: snapshot, streaming: true };
          }
          return copy;
        });
        scrollToBottom();
      }

      // Mark streaming as finished
      const finalText = accumulated || `Neem gerust contact op via ${BUSINESS.phone}.`;
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = {
            role: "assistant",
            content: finalText,
            streaming: false,
          };
        }
        return copy;
      });
    } catch {
      // Remove the empty streaming placeholder, show error inline
      setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.streaming && m.content === "")));
      setError(`Verbinding mislukt — bel ons op ${BUSINESS.phone}.`);
    } finally {
      setPending(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Show chips when: panel freshly opened + only greeting + chips not used */
  /* ---------------------------------------------------------------------- */
  const showChips = !chipsUsed && messages.length === 1 && messages[0] === INITIAL_GREETING;

  /* ---------------------------------------------------------------------- */
  /*  Motion variants                                                        */
  /* ---------------------------------------------------------------------- */
  const panelVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20, scale: 0.96 },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, scale: 1 },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 20, scale: 0.96 },
  };

  const bubbleVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <>
      {/* ---- Launcher button ---- */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Chat sluiten" : "Chat openen"}
        className={cn(
          "fixed z-[55] bottom-5 md:bottom-6 right-4 md:right-6",
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-[var(--color-ink)] text-white text-[13px] font-semibold shadow-elevated",
          "hover:bg-[var(--color-graphite)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
        initial={false}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <ChevronDown className="size-4" aria-hidden />
              Sluiten
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="size-4" aria-hidden />
              <span>Hulp nodig?</span>
              {/* online dot */}
              <span className="size-2 rounded-full bg-[var(--color-whatsapp)] shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ---- Chat panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.aside
            id="chat-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Chat met KSR Auto's"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[60] bottom-[72px] md:bottom-[80px] right-4 md:right-6 w-[min(380px,92vw)] max-h-[72vh] rounded-xl overflow-hidden shadow-elevated bg-[var(--color-paper)] border border-[var(--color-line)] flex flex-col"
          >
            {/* Header */}
            <header className="surface-graphite dark-section px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Avatar / icon */}
                <div className="size-8 rounded-full bg-[var(--color-red)] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="size-4 text-white" aria-hidden />
                </div>
                <div>
                  <div className="font-semibold text-white text-[14px] leading-tight">KSR Assistent</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-[var(--color-whatsapp)]" aria-hidden />
                    <span className="text-white/60 text-[11px] label-mono">Online</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluit chat"
                className="text-white/70 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X className="size-5" aria-hidden />
              </button>
            </header>

            {/* Message list */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--color-surface)]"
              aria-live="polite"
              aria-atomic="false"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.18, delay: i === messages.length - 1 ? 0 : 0 }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[82%] px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed",
                      m.role === "user"
                        ? "bg-[var(--color-ink)] text-white rounded-br-sm"
                        : "bg-[var(--color-paper)] border border-[var(--color-line)] text-[var(--color-ink)] rounded-bl-sm",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <>
                        <Linkified text={m.content} />
                        {m.streaming && m.content && (
                          // Blinking cursor while streaming
                          <motion.span
                            className="inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle opacity-70"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                            aria-hidden
                          />
                        )}
                      </>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator: show while pending AND the last msg has no content yet */}
              {pending && messages[messages.length - 1]?.streaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-paper)] border border-[var(--color-line)] rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <div className="px-3 py-2 text-[13px] text-[var(--color-red)] bg-[var(--color-red-tint)] rounded-lg border border-[var(--color-red-soft)]/40">
                  {error}
                </div>
              )}

              {/* Quick-reply chips */}
              {showChips && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setChipsUsed(true);
                        void send(q);
                      }}
                      className="chip text-[12px] hover:bg-[var(--color-red-tint)] hover:border-[var(--color-red-soft)] hover:text-[var(--color-red)] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="p-3 border-t border-[var(--color-line)] flex gap-2 flex-shrink-0 bg-[var(--color-paper)]"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input text-[13.5px] min-h-[40px] py-2 flex-1"
                placeholder="Vraag over aanbod of openingstijden…"
                maxLength={600}
                aria-label="Bericht"
                disabled={pending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <motion.button
                type="submit"
                className={cn(
                  "btn btn-dark btn-sm px-3 flex-shrink-0 transition-opacity",
                  pending && "opacity-50",
                )}
                disabled={pending}
                aria-label="Verstuur bericht"
                whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
              >
                <Send className="size-4" aria-hidden />
              </motion.button>
            </form>

            {/* Disclaimer footer */}
            <p className="text-center text-[10.5px] tracking-wide text-[var(--color-steel)] py-2 px-3 border-t border-[var(--color-line)] flex-shrink-0 bg-[var(--color-paper)]">
              Alleen bedrijfsinfo + actuele voorraad. Twijfel?{" "}
              <a href={BUSINESS.telHref} className="link tabular">
                Bel {BUSINESS.phone}
              </a>
              .
            </p>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
