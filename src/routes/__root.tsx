import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sivua ei löytynyt</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Etsimääsi sivua ei ole olemassa.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Etusivulle
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sivun lataus epäonnistui
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Yritä uudelleen
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Etusivulle
          </a>
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
      { title: "Minefin — Suomen Minecraft Leaderboardit" },
      {
        name: "description",
        content: "Suomen Minecraft -yhteisön live leaderboardit, hype, kommentit ja serveriprofiilit.",
      },
      { property: "og:title", content: "Minefin — Suomen Minecraft Leaderboardit" },
      { name: "twitter:title", content: "Minefin — Suomen Minecraft Leaderboardit" },
      { name: "description", content: "Minefin — Elzuu1:n luoma suomalainen Minecraft live tracker ja leaderboard-sivusto Suomen suurimmille servuille ja creatoreille." },
      { property: "og:description", content: "Minefin — Elzuu1:n luoma suomalainen Minecraft live tracker ja leaderboard-sivusto Suomen suurimmille servuille ja creatoreille." },
      { name: "twitter:description", content: "Minefin — Elzuu1:n luoma suomalainen Minecraft live tracker ja leaderboard-sivusto Suomen suurimmille servuille ja creatoreille." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ffe868ee-24c7-47cb-84d6-a467a161786d/id-preview-4f672ceb--fb6d1ac1-a76f-423b-bee0-2557c11fe77f.lovable.app-1778828843459.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ffe868ee-24c7-47cb-84d6-a467a161786d/id-preview-4f672ceb--fb6d1ac1-a76f-423b-bee0-2557c11fe77f.lovable.app-1778828843459.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { name: "google-site-verification", content: "google0f7c3fe6d0f37f31" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
