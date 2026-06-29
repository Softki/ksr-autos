/**
 * Renders the full car description text — no collapse, no fade, no toggle.
 */
export function CarDescription({ text }: { text: string }) {
  return (
    <p className="mt-3 text-[15.5px] leading-[1.7] text-[var(--color-charcoal)] whitespace-pre-line max-w-prose">
      {text}
    </p>
  );
}
