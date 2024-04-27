import Logo from "@/components/logo";
import { useClassyParams } from "@/lib/hooks";
import { PropsWithChildren, Suspense } from "react";
import { Outlet } from "react-router";

import { Link, LinkProps, useMatch } from "react-router-dom";
import { Loading } from "./loading";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({ to, children }: PropsWithChildren<{ to: LinkProps["to"] }>) {
  const match = useMatch(typeof to === "string" ? to : to.pathname!);

  return (
    <Link to={to} className={cn({ "font-bold": match })}>
      {children}
    </Link>
  );
}

export function NormalLayout() {
  const { user } = useClassyParams();

  return (
    <main
      className="wrapper min-h-screen"
      style={{ gridTemplateRows: "auto 1fr auto" }}
    >
      <header className="full-bleed sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mx-auto h-14 px-8 max-w-screen-xl items-center">
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link to="/">
              <Logo />
            </Link>

            <NavLink to={`/${user}/gists`}>Gists</NavLink>

            <Link to={""} target="_blank">
              <p className="flex items-center gap-1">
                <span>Website</span>
                <ExternalLink size={12} />
              </p>
            </Link>
          </nav>

          <Link to={`/${user}`}>
            <h1>{user}</h1>
          </Link>
        </div>
      </header>

      <Suspense fallback={<Loading />}>
        <div>
          <Outlet />
        </div>
      </Suspense>

      <footer className="p-2">footer</footer>
    </main>
  );
}

export default NormalLayout;