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
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { PageTransition } from "@/components/transitions/PageTransition";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-sky px-4">
      <div className="glass rounded-3xl p-10 max-w-md text-center">
        <h1 className="font-display text-6xl text-gradient">404</h1>
        <h2 className="mt-3 text-xl font-display">Caminho não encontrado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe — mas a jornada continua.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center gradient-sky px-4">
      <div className="glass rounded-3xl p-8 max-w-md text-center">
        <h1 className="text-xl font-display">Algo não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Respire fundo e tente novamente.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-2xl border px-4 py-2 text-sm hover:bg-accent">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#3B82F6" },
      { title: "Amigo, Espírito Santo — Caminhando com Deus um dia de cada vez" },
      { name: "description", content: "Aplicativo cristão para leitura, oração, estudos e desafios — uma jornada acolhedora com o Espírito Santo." },
      { property: "og:title", content: "Amigo, Espírito Santo — Caminhando com Deus um dia de cada vez" },
      { property: "og:description", content: "Aplicativo cristão para leitura, oração, estudos e desafios — uma jornada acolhedora com o Espírito Santo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Amigo, Espírito Santo — Caminhando com Deus um dia de cada vez" },
      { name: "twitter:description", content: "Aplicativo cristão para leitura, oração, estudos e desafios — uma jornada acolhedora com o Espírito Santo." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3cec1fac-f087-4fda-905e-ec9b10b0e727/id-preview-3f27b590--e70efc3b-e5f3-41a1-a2df-cbb165df23ad.lovable.app-1781892893707.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3cec1fac-f087-4fda-905e-ec9b10b0e727/id-preview-3f27b590--e70efc3b-e5f3-41a1-a2df-cbb165df23ad.lovable.app-1781892893707.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
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
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <PageTransition>
          <Outlet />
        </PageTransition>
        <Toaster richColors position="top-center" />
      </AudioProvider>
    </QueryClientProvider>
  );
}
