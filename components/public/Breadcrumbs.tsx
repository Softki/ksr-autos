import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  href?: string;
  label: string;
}

interface Props {
  items: Crumb[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Broodkruimels" className="text-[12.5px] label-mono flex items-center flex-wrap gap-1">
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {c.href ? (
            <Link href={c.href} className="hover:text-[var(--color-ink)] transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-[var(--color-ink)] normal-case">{c.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="size-3 text-[var(--color-mute)]" aria-hidden />}
        </span>
      ))}
    </nav>
  );
}
