import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Try again</button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CAPMAP India — Climate Action Plans of Indian Cities" },
      { name: "description", content: "Interactive map and dashboard of Climate Action Plans (CAPs) published by Indian cities, states, towns, wards and villages." },
      { property: "og:title", content: "CAPMAP India — Climate Action Plans of Indian Cities" },
      { property: "og:description", content: "Interactive map and dashboard of Climate Action Plans published across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="bg-header text-header-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-header font-bold text-sm shadow">
            CAP
          </div>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">CAPMAP India</div>
            <div className="text-lg font-semibold"> Climate Action Plans Dashboard</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/resources">CAP Resources</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-[var(--geo-state)] via-[var(--geo-city)] to-[var(--geo-village)]" />
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded px-3 py-2 text-white/85 hover:text-white hover:bg-white/10 transition"
      activeProps={{ className: "rounded px-3 py-2 bg-[var(--header-accent)] text-header font-semibold" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">Disclaimer</p>
        <p>
          The information present is entirely based on the review of publicly available Climate Action Plan (CAP)
          documents, information provided by municipalities or organizations developing the CAP documents,
          and thus does not necessarily reflect the most recent status of progress. If you detect any
          incorrect information on this page, please {" "}
          <a href="mailto:work20042026@gmail.com" className="underline text-primary">contact us</a>{" "}
          to amend it.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} CAPMAP India</p>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1"><Outlet /></main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
