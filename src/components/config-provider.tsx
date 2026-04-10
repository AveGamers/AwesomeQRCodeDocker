"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublicConfig } from "@/types/config";

const ConfigContext = createContext<PublicConfig | null>(null);

export function ConfigProvider({
  config,
  children,
}: {
  config: PublicConfig;
  children: ReactNode;
}) {
  const [runtimeConfig, setRuntimeConfig] = useState(config);

  useEffect(() => {
    let cancelled = false;

    async function refreshConfig() {
      try {
        const res = await fetch("/api/public-config", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const nextConfig = (await res.json()) as PublicConfig;
        if (!cancelled) {
          setRuntimeConfig(nextConfig);
        }
      } catch {
        // Keep initial server-provided config if runtime refresh fails.
      }
    }

    void refreshConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ConfigContext.Provider value={runtimeConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): PublicConfig {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}
