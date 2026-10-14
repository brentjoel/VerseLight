import Link from "next/link";

export function ContentNotice({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-2xl border bg-card p-6 text-sm leading-7 text-muted-foreground">
      <p>{children}</p>
      <Link href="/" className="back-link mt-3 inline-flex">Choose another feeling</Link>
    </div>
  );
}
