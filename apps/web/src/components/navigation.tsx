'use client';

import { signIn, signOut } from '@repo/auth/react';
import type { Session } from '@repo/auth/server';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Loader2, LogIn, Moon, Play, Settings, Settings2, Sun, User } from '@repo/ui/icons';
import type { EdgeConfigItems } from '@vercel/edge-config';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFullscreenSettingsStore } from '~/app/[locale]/challenge/_components/fullscreen';
import { isAdminOrModerator } from '~/utils/auth-guards';

// TODO: move this to a util as it might be used in other places
export function getAdminUrl() {
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://admin.typehero.dev`;
  }

  // assume localhost
  return `http://localhost:3001`;
}

export function Navigation({
  session,
  flags,
}: {
  session: Session | null;
  flags: EdgeConfigItems;
}) {
  const { fssettings } = useFullscreenSettingsStore();
  const pathname = usePathname();

  return (
    <header className="z-0 w-full">
      {!fssettings.isFullscreen && (
        <nav
          className={`flex h-14 items-center text-sm font-medium ${pathname?.startsWith('/challenge') ? 'px-4' : 'container'
            }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="relative flex items-center gap-3">
              <Link
                className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2"
                href="/"
              >
                <svg
                  className="h-8 w-8 rounded-md bg-[#3178C6] p-[2px]"
                  viewBox="0 0 38 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="38" height="38" rx="4.5" fill="#3178C6" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.6947 20.9344H20V18H8V20.9344H12.2842V34H15.6947V20.9344Z"
                    fill="white"
                  />
                  <path
                    d="M22 34V18H25.4511V24.6309H30.5405V18H34V34H30.5405V27.3458H25.4511V34H22Z"
                    fill="white"
                  />
                </svg>

                <span className="font-bold leading-3">
                  type
                  <br />
                  hero
                </span>
              </Link>
              {flags?.exploreButton === true && (
                <Link href="/explore" className="ml-4">
                  <div
                    className={clsx('hover:text-foreground text-foreground/80 transition-colors', {
                      '!text-foreground': pathname === '/explore',
                    })}
                  >
                    Explore
                  </div>
                </Link>
              )}
              {flags?.tracksButton === true && (
                <Link href="/tracks" className="ml-4">
                  <div
                    className={clsx('hover:text-foreground text-foreground/80 transition-colors', {
                      '!text-foreground': pathname === '/tracks',
                    })}
                  >
                    Tracks
                  </div>
                </Link>
              )}
            </div>
            <div className="flex">
              <div className="flex items-center justify-end gap-2">
                <ThemeButton />
                {flags?.loginButton === true && <LoginButton session={session} />}
              </div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function ThemeButton() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted ? (
        <button
          aria-label="theme button"
          className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none focus-visible:ring-2"
          onClick={() => {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          }}
          type="button"
        >
          {resolvedTheme === 'dark' && <Moon aria-hidden="true" className="h-5 w-5" />}
          {resolvedTheme === 'light' && <Sun aria-hidden="true" className="h-5 w-5" />}
        </button>
      ) : null}
    </>
  );
}

function LoginButton({ session }: { session: Session | null }) {
  const [isSigningIn, setSigningIn] = useState(false);
  const router = useRouter();
  const isAdminOrMod = isAdminOrModerator(session);

  // We start the flow client side, then a full page redirect will happen
  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signIn('github', { redirect: false });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  return session ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="profile button"
          className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none focus-visible:ring-2"
        >
          <User className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="mt-[0.33rem] w-56 rounded-xl bg-white/50 backdrop-blur-sm dark:bg-neutral-950/50"
      >
        <Link className="block" href={`/@${session.user.name}`}>
          <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link className="block" href="/settings">
          <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none">
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        {Boolean(isAdminOrMod) && (
          <a className="block" href={getAdminUrl()}>
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </DropdownMenuItem>
          </a>
        )}
        {Boolean(isAdminOrMod) && (
          <a className="block" href="/challenge-playground">
            <DropdownMenuItem className="focus:bg-accent rounded-lg p-2 duration-300 focus:outline-none dark:hover:bg-neutral-700/50">
              <Play className="mr-2 h-4 w-4" />
              <span>Challenge Playground</span>
            </DropdownMenuItem>
          </a>
        )}
        <DropdownMenuSeparator />
        <Button
          className="h-8 w-full justify-start rounded-b-lg rounded-t-sm bg-opacity-50 px-2 text-red-500 hover:bg-red-500/20 hover:text-red-500"
          onClick={handleSignOut}
          variant="ghost"
        >
          <span className="text-red-500">Log out</span>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      disabled={isSigningIn}
      className="focus:bg-accent w-20 rounded-lg bg-transparent p-2 text-black duration-300 hover:bg-gray-200 focus:outline-none dark:text-white hover:dark:bg-gray-800"
      onClick={handleSignIn}
    >
      {isSigningIn ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <div className="flex items-center space-x-2">
          <LogIn className="h-5 w-5" />
          <span className="dark:text-white">Login</span>
        </div>
      )}
    </Button>
  );
}
