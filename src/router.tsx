import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del } from "idb-keyval";
import { routeTree } from "./routeTree.gen";

// Adapter for IndexedDB
const idbStorage = {
  getItem: async (key: string) => {
    const val = await get(key);
    return val ? val : null;
  },
  setItem: async (key: string, value: any) => await set(key, value),
  removeItem: async (key: string) => await del(key),
};

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias em cache
        staleTime: 1000 * 60, // 1 minuto
      },
    },
  });

  if (typeof window !== "undefined") {
    const persister = createAsyncStoragePersister({
      storage: idbStorage,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // Persiste por 7 dias
    });
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: "/meu-amigo-espirito-santo.",
  });

  return router;
};
