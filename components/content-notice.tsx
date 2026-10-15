import Link from "next/link";

export function ContentNotice({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="content-notice">
      <p>{children}</p>
      <Link href="/" className="back-link mt-3 inline-flex">Choose another feeling</Link>
    </div>
  );
}
