import type { Metadata } from "next";
import Link from "next/link";
import Tailor from "./Tailor";
import "./app.css";

export const metadata: Metadata = { title: "Tailor your résumé — Resumera" };

export default function AppPage() {
  return (
    <main className="tool">
      <header className="nav w">
        <Link className="logo" href="/">Resumera</Link>
        <Link className="btn soft" href="/">Back to home</Link>
      </header>
      <Tailor />
    </main>
  );
}
