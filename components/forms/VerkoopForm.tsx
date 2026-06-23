"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Search, Check, Upload, X, Loader2, RotateCw } from "lucide-react";

import { submitInquiryAction } from "@/lib/actions/inquiries";
import { initialInquiryState } from "@/lib/actions/state";
import { BUSINESS } from "@/lib/constants";

const CONDITIONS = ["Zo goed als nieuw", "Gebruikte auto", "Heeft mankementen", "Schade auto"];

const STEPS = [
  { no: "1", t: "Meld uw auto aan", d: "Vul het formulier in met merk, model en een paar foto's." },
  { no: "2", t: "Ontvang een indicatie", d: "Wij bekijken uw auto en nemen snel contact met u op." },
  { no: "3", t: "Langskomen & afronden", d: "Akkoord? Dan regelen we de overname snel en zonder gedoe." },
];

type LookupState = "idle" | "loading" | "done" | "notfound" | "error";
type UploadItem = { id: string; previewUrl: string; url?: string; status: "uploading" | "done" | "error" };

export function VerkoopForm() {
  const [state, formAction] = useActionState(submitInquiryAction, initialInquiryState);
  const formRef = useRef<HTMLFormElement>(null);
  const [ts, setTs] = useState("");

  const [kenteken, setKenteken] = useState("");
  const [lookup, setLookup] = useState<LookupState>("idle");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState("Gebruikte auto");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadConfigured, setUploadConfigured] = useState(true);

  useEffect(() => {
    setTs(String(Date.now()));
  }, []);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      formRef.current?.reset();
      setKenteken("");
      setBrand("");
      setModel("");
      setYear("");
      setCondition("Gebruikte auto");
      setUploads([]);
      setLookup("idle");
    }
  }, [state]);

  async function runLookup() {
    const k = kenteken.replace(/[^A-Za-z0-9]/g, "");
    if (k.length < 4) {
      setLookup("error");
      return;
    }
    setLookup("loading");
    try {
      const res = await fetch(`/api/rdw?kenteken=${encodeURIComponent(k)}`);
      const data = await res.json();
      if (data.found) {
        if (data.brand) setBrand(data.brand);
        if (data.model) setModel(data.model);
        if (data.year) setYear(data.year);
        setLookup("done");
      } else {
        setLookup("notfound");
      }
    } catch {
      setLookup("error");
    }
  }

  async function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, 10 - uploads.length));
    if (files.length === 0) return;

    const items: UploadItem[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      previewUrl: URL.createObjectURL(f),
      status: "uploading",
    }));
    setUploads((prev) => [...prev, ...items]);

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/sell-photos", { method: "POST", body: fd });
      const data = await res.json();
      if (data.configured === false) {
        setUploadConfigured(false);
        setUploads((prev) => prev.map((u) => (items.some((i) => i.id === u.id) ? { ...u, status: "error" } : u)));
        return;
      }
      const urls: string[] = data.urls ?? [];
      let idx = 0;
      setUploads((prev) =>
        prev.map((u) => {
          if (items.some((i) => i.id === u.id)) {
            const url = urls[idx++];
            return url ? { ...u, status: "done", url } : { ...u, status: "error" };
          }
          return u;
        }),
      );
    } catch {
      setUploads((prev) => prev.map((u) => (items.some((i) => i.id === u.id) ? { ...u, status: "error" } : u)));
    }
  }

  const photoUrls = uploads.filter((u) => u.status === "done" && u.url).map((u) => u.url!);

  return (
    <div>
      {/* Kenteken lookup */}
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[linear-gradient(135deg,#FFFDF8,#F6EFE3)] shadow-[var(--shadow-card-hover)] p-7 md:p-10 text-center mb-10">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none [background-image:radial-gradient(rgba(209,87,40,0.06)_1.5px,transparent_1.5px)] [background-size:26px_26px]"
        />
        <div
          aria-hidden
          className="absolute w-[420px] h-[420px] rounded-full right-[-160px] top-[-200px] pointer-events-none [background:radial-gradient(circle,rgba(247,208,0,0.16),transparent_70%)]"
        />
        <div className="relative">
          <div className="lbl text-[11px] text-[var(--color-tan)] inline-flex items-center gap-2.5">
            <span className="w-6 h-0.5 bg-[var(--color-red)]" /> Kenteken check <span className="w-6 h-0.5 bg-[var(--color-red)]" />
          </div>
          <h2 className="font-display font-extrabold text-[clamp(24px,3vw,34px)] tracking-tight mt-3.5">Vul uw kenteken in</h2>
          <p className="mt-2.5 text-[15px] text-[var(--color-steel)] max-w-[34em] mx-auto">
            Wij halen automatisch het merk, model en bouwjaar van uw auto op — zo bent u binnen een minuut klaar.
          </p>

          <div className="flex gap-3.5 justify-center items-center flex-wrap mt-7">
            <div className="inline-flex items-stretch h-16 rounded-[10px] overflow-hidden border-[2.5px] border-[#111] bg-[#F7D000] shadow-[0_12px_26px_-10px_rgba(247,208,0,0.7)]">
              <div className="w-9 bg-[#0A39B8] flex flex-col items-center justify-center gap-[3px]">
                <span className="text-[#F7D000] text-[10px] leading-none tracking-[-0.1em]">★★★</span>
                <span className="text-white font-display font-extrabold text-[13px] leading-none">NL</span>
              </div>
              <input
                value={kenteken}
                onChange={(e) => setKenteken(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runLookup();
                  }
                }}
                maxLength={8}
                placeholder="XX-123-X"
                aria-label="Kenteken"
                className="w-[170px] sm:w-[210px] bg-[#F7D000] border-0 outline-none font-display font-extrabold text-[26px] sm:text-[30px] tracking-[0.06em] uppercase text-[#111] text-center placeholder:text-[#111]/40"
              />
            </div>
            <button type="button" onClick={runLookup} className="btn btn-primary h-16 px-7 gap-2.5 text-[15.5px]">
              {lookup === "loading" ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : <RotateCw className="size-[18px]" aria-hidden />}
              Gegevens ophalen
            </button>
          </div>

          {lookup === "done" && (
            <div className="inline-flex items-center gap-2.5 mt-5 rounded-[var(--radius-md)] border border-[#BFE6CC] bg-[var(--color-success-tint)] text-[var(--color-success)] px-4 py-3 text-[14px] font-semibold">
              <Check className="size-[18px]" strokeWidth={2.4} aria-hidden />
              Gegevens gevonden — we hebben het formulier hieronder alvast ingevuld.
            </div>
          )}
          {lookup === "notfound" && (
            <p className="mt-5 text-[13.5px] text-[var(--color-steel)]">
              Geen gegevens gevonden voor dit kenteken. Vul de gegevens hieronder handmatig in.
            </p>
          )}
          {lookup === "error" && (
            <p className="mt-5 text-[13.5px] text-[var(--color-error)]">
              Controleer het kenteken en probeer het opnieuw.
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start">
        {/* Steps + contact */}
        <div className="flex flex-col gap-4">
          <div className="surface-ink rounded-[var(--radius-xl)] p-6 dark-section">
            <div className="lbl text-[10.5px] text-[var(--color-red-soft)] mb-5">Zo werkt het</div>
            <div className="flex flex-col gap-[18px]">
              {STEPS.map((s) => (
                <div key={s.no} className="flex gap-3.5 items-start">
                  <span className="size-[34px] rounded-[10px] bg-[rgba(209,87,40,0.18)] text-[var(--color-red-soft)] grid place-items-center font-display font-extrabold text-[15px] shrink-0">
                    {s.no}
                  </span>
                  <div>
                    <div className="font-bold text-[15px] text-[var(--color-canvas)]">{s.t}</div>
                    <div className="text-[13px] text-[#9A948B] mt-0.5 leading-snug">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="font-bold text-[15px]">Liever direct contact?</div>
            <p className="text-[13.5px] text-[var(--color-steel)] mt-1.5 leading-relaxed">
              Bel of app ons voor een snelle indicatie of een afspraak.
            </p>
            <div className="flex gap-2.5 mt-4">
              <a href={BUSINESS.telHref} className="flex-1 btn btn-secondary">Bel ons</a>
              <a href={BUSINESS.whatsapp} target="_blank" rel="noopener" className="flex-1 btn btn-primary">WhatsApp</a>
            </div>
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} action={formAction} className="card p-6 md:p-8">
          <input type="hidden" name="type" value="trade_in" />
          <input type="hidden" name="ts" value={ts} />
          <input type="hidden" name="kenteken" value={kenteken} />
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="condition" value={condition} />
          <input type="hidden" name="photos" value={photoUrls.length ? JSON.stringify(photoUrls) : ""} />
          <div className="hp-field" aria-hidden>
            <label>
              Website (niet invullen)
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <h2 className="font-display text-[24px] md:text-[26px] font-extrabold tracking-tight">Uw auto aanmelden</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <Field label="Merk" required>
              <input name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="Bijv. Volkswagen" className="input" />
            </Field>
            <Field label="Model" required>
              <input name="model" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="Bijv. Golf" className="input" />
            </Field>
            <Field label="Kilometerstand">
              <input name="mileage" inputMode="numeric" placeholder="Bijv. 145.000" className="input" />
            </Field>
            <Field label="Gewenste vraagprijs">
              <input name="asking_price" inputMode="numeric" placeholder="Bijv. € 4.500" className="input" />
            </Field>
          </div>

          <div className="mt-5">
            <div className="field-label">Conditie</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={condition === c}
                  onClick={() => setCondition(c)}
                  className="chip"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Field label="Omschrijving">
              <textarea name="message" rows={4} placeholder="Vertel iets over de auto: opties, onderhoud, eventuele gebreken…" className="input" />
            </Field>
          </div>

          <div className="h-px bg-[var(--color-line)] my-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Naam" required>
              <input name="name" required autoComplete="name" placeholder="Uw naam" className="input" />
            </Field>
            <Field label="Telefoon">
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 …" className="input" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="E-mailadres" required>
              <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="naam@email.nl" className="input" />
            </Field>
          </div>

          {/* Photos */}
          <div className="mt-5">
            <div className="field-label">
              Foto&rsquo;s <span className="text-[var(--color-mute)] font-medium">(maximaal 10)</span>
            </div>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="block border-[1.5px] border-dashed border-[var(--color-line-strong)] rounded-[var(--radius-md)] p-6 text-center bg-[var(--color-surface)] cursor-pointer hover:border-[var(--color-red)] transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <span className="inline-grid place-items-center size-[46px] rounded-[var(--radius-md)] bg-[var(--color-red-tint)] text-[var(--color-red)] mb-2.5">
                <Upload className="size-[22px]" aria-hidden />
              </span>
              <div className="text-[14px] font-bold">Sleep foto&rsquo;s hierheen of klik om te selecteren</div>
              <div className="text-[12.5px] text-[var(--color-mute)] mt-1">JPG, PNG of WEBP — max. 10 stuks</div>
            </label>

            {!uploadConfigured && (
              <p className="mt-2 text-[12.5px] text-[var(--color-steel)]">
                Direct uploaden is nu niet beschikbaar — u kunt foto&rsquo;s na het indienen via WhatsApp sturen.
              </p>
            )}

            {uploads.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 mt-3">
                {uploads.map((u) => (
                  <div
                    key={u.id}
                    className="relative aspect-square rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.previewUrl} alt="" className="w-full h-full object-cover" />
                    {u.status === "uploading" && (
                      <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
                        <Loader2 className="size-5 animate-spin" aria-hidden />
                      </div>
                    )}
                    {u.status === "error" && (
                      <div className="absolute inset-0 grid place-items-center bg-[var(--color-error)]/70 text-white text-[10px] font-bold px-1 text-center">
                        mislukt
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}
                      aria-label="Verwijder foto"
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/60 hover:bg-black/80 text-white grid place-items-center"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.message && !state.ok && (
            <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-error-tint)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-[13.5px] px-3 py-2">
              {state.message}
            </div>
          )}

          <SubmitButton />

          <p className="mt-3.5 text-[11.5px] text-[var(--color-mute)] leading-relaxed">
            Uw gegevens worden alleen gebruikt om contact met u op te nemen over de inkoop van uw auto. Zie onze{" "}
            <a href="/privacyverklaring" className="link">privacyverklaring</a>.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required && <span aria-hidden className="text-[var(--color-red)] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full mt-5" disabled={pending} aria-disabled={pending}>
      {pending ? "Versturen…" : "Verstuur aanmelding"}
    </button>
  );
}
