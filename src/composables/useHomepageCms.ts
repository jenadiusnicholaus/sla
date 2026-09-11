import {
  ref,
  computed,
  readonly,
  onMounted,
  onUnmounted,
  type Ref,
  type ComputedRef,
} from "vue";
import { cmsApi } from "@/api/client";
import { sortNavByLandingOrder, type NavLink } from "@/lib/landingNav";

const CHANNEL = "sla-cms-updated";
const STORAGE_KEY = "sla_cms_updated_at";
const POLL_MS = 30_000;

const homepage = ref<Record<string, unknown> | null>(null);
const loading = ref(false);
const refreshing = ref(false);
const error = ref<string | null>(null);
const lastFetchedAt = ref<number | null>(null);
let loadPromise: Promise<unknown> | null = null;
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL);
  return channel;
}

function bumpSyncSignal(): void {
  const stamp = String(Date.now());
  try {
    localStorage.setItem(STORAGE_KEY, stamp);
  } catch {
    /* private mode / blocked storage */
  }
  getChannel()?.postMessage({ type: "cms-updated", at: stamp });
}

interface FetchOptions {
  force?: boolean;
  soft?: boolean;
}

async function fetchHomepage({
  force = false,
  soft = true,
}: FetchOptions = {}): Promise<unknown> {
  if (!force && homepage.value) return homepage.value;
  if (loadPromise) {
    if (!force) return loadPromise;
    await loadPromise.catch(() => null);
  }

  const isInitial = !homepage.value;
  if (isInitial) loading.value = true;
  else refreshing.value = true;
  if (isInitial) error.value = null;

  loadPromise = cmsApi
    .homepage()
    .then((data) => {
      homepage.value = data as Record<string, unknown>;
      lastFetchedAt.value = Date.now();
      error.value = null;
      return data;
    })
    .catch((err: unknown) => {
      if (!homepage.value || !soft) {
        error.value = err instanceof Error ? err.message : "Failed to load CMS";
      }
      if (!homepage.value) throw err;
      return homepage.value;
    })
    .finally(() => {
      loading.value = false;
      refreshing.value = false;
      loadPromise = null;
    });

  return loadPromise;
}

export async function invalidateHomepageCms(): Promise<unknown> {
  bumpSyncSignal();
  try {
    return await fetchHomepage({ force: true, soft: true });
  } catch {
    return homepage.value;
  }
}

interface LiveSyncOptions {
  pollMs?: number;
}

export function useHomepageCms() {
  async function load(force = false): Promise<unknown> {
    return fetchHomepage({ force, soft: true });
  }

  async function refresh(): Promise<unknown> {
    return fetchHomepage({ force: true, soft: true });
  }

  function startLiveSync(options: LiveSyncOptions = {}): () => void {
    const pollMs = options.pollMs ?? POLL_MS;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let lastStorageStamp: string | null = null;
    try {
      lastStorageStamp = localStorage.getItem(STORAGE_KEY);
    } catch {
      lastStorageStamp = null;
    }

    const safeRefresh = (): void => {
      refresh().catch(() => {
        /* keep previous data / fallbacks */
      });
    };

    const onVisibility = (): void => {
      if (document.visibilityState === "visible") safeRefresh();
    };

    const onFocus = (): void => safeRefresh();

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      if (event.newValue === lastStorageStamp) return;
      lastStorageStamp = event.newValue;
      safeRefresh();
    };

    const onBroadcast = (): void => safeRefresh();

    const startPoll = (): void => {
      stopPoll();
      if (!pollMs) return;
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") safeRefresh();
      }, pollMs);
    };

    const stopPoll = (): void => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    safeRefresh();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    getChannel()?.addEventListener("message", onBroadcast);
    startPoll();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      getChannel()?.removeEventListener("message", onBroadcast);
      stopPoll();
    };
  }

  function useLiveHomepage(options?: LiveSyncOptions): void {
    let stop: (() => void) | null = null;
    onMounted(() => {
      stop = startLiveSync(options);
    });
    onUnmounted(() => {
      stop?.();
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.settings ?? null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const announcement = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.announcement ?? null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.nav ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hero = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.hero ?? null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.stats ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gallery = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.gallery ?? null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const about = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.about ?? null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.values ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const programs = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.programs ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgChart = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.org_chart ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const team = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.team ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socialLinks = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.social_links ?? [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const donate = computed<any>(
    () => (homepage.value as Record<string, unknown>)?.donate ?? null,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function statsFor(placement: string): ComputedRef<any[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return computed<any[]>(() =>
      (
        ((homepage.value as Record<string, unknown>)?.stats as Record<
          string,
          unknown
        >[]) ?? []
      )
        .filter((s) => s.placement === placement)
        .sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0)),
    );
  }

  function navFor(placement: string): ComputedRef<NavLink[]> {
    return computed(() =>
      sortNavByLandingOrder(
        (
          ((homepage.value as Record<string, unknown>)?.nav as Record<
            string,
            unknown
          >[]) ?? []
        )
          .filter((n) => n.placement === placement || n.placement === "both")
          .sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0))
          .map((n) => ({ label: String(n.label), href: String(n.href) })),
      ),
    );
  }

  return {
    homepage: readonly(homepage),
    loading: readonly(loading),
    refreshing: readonly(refreshing),
    error: readonly(error),
    lastFetchedAt: readonly(lastFetchedAt),
    load,
    refresh,
    invalidate: invalidateHomepageCms,
    startLiveSync,
    useLiveHomepage,
    settings,
    announcement,
    nav,
    hero,
    stats,
    gallery,
    about,
    values,
    programs,
    orgChart,
    team,
    socialLinks,
    donate,
    statsFor,
    navFor,
  };
}
