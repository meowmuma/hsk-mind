import type { ReactNode } from "react";

export function AuthShell({
  children,
  title,
  eyebrow,
  background = "/design-reference/auth/login/Background.png",
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  background?: string;
}) {
  return (
    <main
      className="auth-stage"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(31,18,15,.82), rgba(73,32,25,.45)), url('${background}')`,
      }}
    >
      <section className="auth-card" aria-labelledby="auth-title">
        <img
          className="auth-logo"
          src="/design-reference/auth/login/logo.png"
          alt="HSK Mind"
        />
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}
