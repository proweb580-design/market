import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-text">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-text">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
