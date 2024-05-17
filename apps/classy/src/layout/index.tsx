import Logo from "@/components/logo";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  useClassyParams,
  cn,
  useClassyConfig,
  gitFetchFunc,
} from "@classy/lib";
import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useMatch } from "react-router-dom";

import { Link } from "react-router-dom";
import { Loading } from "./loading";
import { ExternalLink, Menu } from "lucide-react";
import { User } from "@classy/types";
import { Footer } from "./footer";
import { Separator } from "@/components/ui/separator";
import ErrorBoundary from "@/components/error-boundary";
import UserCard from "@/components/user-card";

export function Layout() {
  const { user } = useClassyParams();

  const matchUserPage = useMatch("/:user");

  const [userinfo, setUserinfo] = useState<User | null>(null);
  const classyConfig = useClassyConfig(user);

  useEffect(() => {
    (async () => {
      const data = await gitFetchFunc.userinfo(user);
      setUserinfo(data);
    })();
  }, [user]);

  const { links } = classyConfig;

  const blogUrl = userinfo?.blog?.startsWith("http")
    ? userinfo.blog
    : `http://${userinfo?.blog}`;

  return (
    <div
      className={"wrapper min-h-screen dark:bg-black"}
      style={{ gridTemplateRows: "auto 1fr auto" }}
    >
      <div
        className={cn(
          "pointer-events-none dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center",
          "fixed inset-0"
        )}
      />

      <header className="full-bleed sticky top-0 z-50 w-full">
        <div
          className={cn(
            "flex justify-between items-center mx-auto h-14 px-2 sm:px-8",
            "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          )}
        >
          <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
            <Link to="/">
              <Logo />
            </Link>

            <NavLink
              to={`/${user}/repos`}
              className={({ isActive }) =>
                isActive ? "font-bold" : "hover:text-blue-500"
              }
            >
              Repos
            </NavLink>

            <NavLink
              to={`/${user}/gists`}
              className={({ isActive }) =>
                isActive ? "font-bold" : "hover:text-blue-500"
              }
            >
              Gists
            </NavLink>

            {userinfo?.blog && (
              <Link to={blogUrl} target="_blank">
                <p className="flex items-center gap-1 hover:text-blue-500">
                  <span>Website</span>
                  <ExternalLink size={12} />
                </p>
              </Link>
            )}
          </nav>

          <Drawer>
            <DrawerTrigger>
              <Menu role="button" className="block md:hidden cursor-pointer" />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  <Link to="/">
                    <Logo />
                  </Link>
                </DrawerTitle>
              </DrawerHeader>

              <Separator />

              <div className="flex flex-col justify-center items-center gap-4 my-8">
                <NavLink
                  to={`/${user}/repos`}
                  className={({ isActive }) =>
                    isActive ? "font-bold" : "hover:text-blue-500"
                  }
                >
                  <DrawerClose>Repos</DrawerClose>
                </NavLink>

                <NavLink
                  to={`/${user}/gists`}
                  className={({ isActive }) =>
                    isActive ? "font-bold" : "hover:text-blue-500"
                  }
                >
                  <DrawerClose>Gists</DrawerClose>
                </NavLink>

                {userinfo?.blog && (
                  <Link to={blogUrl} target="_blank">
                    <DrawerClose>
                      <p className="flex items-center gap-1 hover:text-blue-500">
                        <span>Website</span>
                        <ExternalLink size={12} />
                      </p>
                    </DrawerClose>
                  </Link>
                )}
              </div>
            </DrawerContent>
          </Drawer>

          <Link to={`/${user}`}>
            <span className="text-sm md:text-lg">
              {userinfo?.name || userinfo?.login || user}
            </span>
          </Link>
        </div>
      </header>

      <div className="relative flex gap-4">
        <div className="w-full grow flex flex-col">
          <Suspense
            fallback={
              <div className="w-full grow flex justify-center items-center bg-white/85 dark:bg-zinc-900/80">
                <Loading />
              </div>
            }
          >
            <main
              className={cn(
                "relative grow p-6",
                "bg-white/85 ring-1 ring-zinc-100 dark:bg-zinc-900/80 dark:ring-zinc-400/20"
              )}
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          </Suspense>

          <Footer links={links} />
        </div>

        {matchUserPage && (
          <div className="hidden sm:sticky sm:block h-fit top-14 py-4">
            <UserCard userinfo={userinfo} />

            <div className="flex gap-2 mt-2">
              <Link
                to={`/${user}/repos`}
                className="w-full flex flex-col items-center py-2 px-6 border rounded-lg bg-gray-50 hover:shadow-sm"
              >
                <span>Repos</span>
                <strong>{userinfo?.public_repos}</strong>
              </Link>

              <Link
                to={`/${user}/gists`}
                className="w-full flex flex-col items-center py-2 px-6 border rounded-lg bg-gray-50 hover:shadow-sm"
              >
                <span>Gists</span>
                <strong>{userinfo?.public_gists}</strong>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Layout;
