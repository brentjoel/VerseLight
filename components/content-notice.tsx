import Link from "next/link";
import { Constellation } from "@/components/constellation";

export function ContentNotice({ children, loading = false }: Readonly<{ children: React.ReactNode; loading?: boolean }>) {
  return (
    <div className={`content-notice${loading ? " skeleton" : ""}`} role={loading ? "status" : undefined}>
      {!loading && <Constellation />}
      <p>{children}</p>
      <Link href="/" className="back-link mt-3 inline-flex">Choose another feeling</Link>
    </div>
  );
}
