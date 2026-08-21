<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import {
  loadPayItSdk,
  PAYIT_SLUG,
  PAYIT_STANDALONE_URL,
  type PayItCheckoutInstance,
  type PayItResult,
} from "@/lib/payit";

const props = withDefaults(
  defineProps<{
    open: boolean;
    slug?: string;
    mode?: "modal" | "inline";
    title?: string;
    description?: string;
  }>(),
  {
    slug: PAYIT_SLUG,
    mode: "modal",
    title: "Support Street Labs Africa",
    description: "Your gift funds digital skills training for young Africans.",
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success", result: PayItResult): void;
}>();

type Phase =
  | "loading"
  | "ready"
  | "processing"
  | "succeeded"
  | "failed"
  | "error";

const containerRef = ref<HTMLElement | null>(null);
const phase = ref<Phase>("loading");
const errorMessage = ref("");
const paymentId = ref("");
const failureStatus = ref("");

let checkout: PayItCheckoutInstance | null = null;
let readyTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * An unauthorized origin (or a disabled embed flag) makes the embed route
 * answer 404, and the SDK then never fires onReady. Without this the dialog
 * would spin indefinitely with no explanation.
 */
const READY_TIMEOUT_MS = 12_000;

function clearReadyTimer(): void {
  if (!readyTimer) return;
  clearTimeout(readyTimer);
  readyTimer = null;
}

const isInline = computed(() => props.mode === "inline");

/**
 * In modal mode the SDK renders its own overlay, so ours must stay out of the
 * way while checkout is on screen and only surface the surrounding states.
 */
const showShell = computed(() => {
  if (!props.open) return false;
  if (isInline.value) return true;
  return phase.value !== "ready" && phase.value !== "processing";
});

function teardown(): void {
  clearReadyTimer();
  if (!checkout) return;
  try {
    checkout.destroy();
  } catch {
    /* SDK already torn down */
  }
  checkout = null;
}

async function mountCheckout(): Promise<void> {
  phase.value = "loading";
  errorMessage.value = "";
  paymentId.value = "";
  failureStatus.value = "";

  let sdk;
  try {
    sdk = await loadPayItSdk();
  } catch {
    phase.value = "error";
    errorMessage.value = "We could not load the secure payment form.";
    return;
  }

  // The dialog may have been closed while the SDK was still loading.
  if (!props.open) return;

  await nextTick();

  let container: HTMLElement | undefined;
  if (isInline.value) {
    if (!containerRef.value) return;
    container = containerRef.value;
  }

  teardown();

  // Hand the SDK modal back the screen before showing one of our own panels.
  const closeSdkModal = (): void => {
    if (isInline.value) return;
    try {
      checkout?.close();
    } catch {
      /* already closed by the hosted page */
    }
  };

  try {
    checkout = sdk.checkout({
      slug: props.slug,
      mode: isInline.value ? "inline" : "modal",
      ...(container ? { container } : {}),
      onReady: () => {
        clearReadyTimer();
        phase.value = "ready";
      },
      onProcessing: (result) => {
        clearReadyTimer();
        phase.value = "processing";
        paymentId.value = result.payment_id;
      },
      onSuccess: (result) => {
        clearReadyTimer();
        phase.value = "succeeded";
        paymentId.value = result.payment_id;
        closeSdkModal();
        emit("success", result);
      },
      onFailure: (result) => {
        clearReadyTimer();
        phase.value = "failed";
        paymentId.value = result.payment_id;
        failureStatus.value = result.status;
        closeSdkModal();
      },
      onClose: (result) => {
        if (result.reason === "iframe_close") emit("close");
      },
    });
    checkout.open();

    clearReadyTimer();
    readyTimer = setTimeout(() => {
      if (phase.value !== "loading") return;
      teardown();
      phase.value = "error";
      errorMessage.value =
        "The secure payment form did not load. You can still donate on the PayIt page.";
    }, READY_TIMEOUT_MS);
  } catch {
    phase.value = "error";
    errorMessage.value = "We could not start the secure payment form.";
  }
}

function close(): void {
  emit("close");
}

function retry(): void {
  teardown();
  void mountCheckout();
}

function onKeydown(event: KeyboardEvent): void {
  // While the SDK modal is on screen it owns Escape; closing here would
  // destroy checkout mid-payment.
  if (event.key === "Escape" && showShell.value) close();
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
      void mountCheckout();
      return;
    }
    document.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
    teardown();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  teardown();
});

const failureCopy: Record<string, string> = {
  ATTEMPTS_EXHAUSTED:
    "Every payment attempt failed. Start a new donation to try again.",
  EXPIRED: "This checkout session expired before it completed.",
  CANCELLED: "The checkout was cancelled.",
};

// Status casing varies by PayIt surface, so never match on one form.
const failureMessage = computed(
  () =>
    failureCopy[failureStatus.value.toUpperCase()] ??
    "The checkout ended without a successful payment.",
);
</script>

<template>
  <Teleport to="body">
    <Transition name="donate-fade">
      <div
        v-if="showShell"
        class="donate-overlay"
        :class="{ 'is-status': !isInline }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        @click.self="close"
      >
        <div class="donate-panel">
          <header class="donate-head">
            <div>
              <h2 id="donate-title">{{ title }}</h2>
              <p>{{ description }}</p>
            </div>
            <button
              type="button"
              class="donate-close"
              aria-label="Close donation form"
              @click="close"
            >
              ✕
            </button>
          </header>

          <div class="donate-body">
            <div v-if="phase === 'loading'" class="donate-state">
              <span class="spinner" aria-hidden="true"></span>
              <p>Loading secure checkout…</p>
            </div>

            <div v-else-if="phase === 'error'" class="donate-state">
              <p class="state-title">{{ errorMessage }}</p>
              <div class="state-actions">
                <button type="button" class="btn-primary" @click="retry">
                  Try again
                </button>
                <a
                  :href="PAYIT_STANDALONE_URL"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-ghost"
                >
                  Open PayIt page
                </a>
              </div>
            </div>

            <div v-else-if="phase === 'succeeded'" class="donate-state success">
              <span class="state-mark" aria-hidden="true">✓</span>
              <p class="state-title">Thank you for your donation!</p>
              <p class="state-sub">
                We received your payment. A confirmation follows once the
                transfer settles.
              </p>
              <p v-if="paymentId" class="state-ref">
                Reference: {{ paymentId }}
              </p>
              <button type="button" class="btn-primary" @click="close">
                Done
              </button>
            </div>

            <div v-else-if="phase === 'failed'" class="donate-state">
              <span class="state-mark fail" aria-hidden="true">!</span>
              <p class="state-title">Payment not completed</p>
              <p class="state-sub">{{ failureMessage }}</p>
              <div class="state-actions">
                <button type="button" class="btn-primary" @click="retry">
                  Start again
                </button>
                <button type="button" class="btn-ghost" @click="close">
                  Close
                </button>
              </div>
            </div>

            <p v-else-if="phase === 'processing'" class="donate-note">
              <span class="spinner small" aria-hidden="true"></span>
              Confirming your payment — approve the prompt on your phone and
              keep this window open.
            </p>

            <!-- Inline mode only: the SDK injects its iframe here and it must
                 stay mounted across phases. Modal mode needs no container. -->
            <div
              v-if="isInline"
              v-show="phase === 'ready' || phase === 'processing'"
              ref="containerRef"
              class="donate-frame"
            ></div>
          </div>

          <footer class="donate-foot">
            <span class="lock" aria-hidden="true">🔒</span>
            Payments are processed securely by PayIt. Amounts are in TSh.
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.donate-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(6, 18, 44, 0.62);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.donate-panel {
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 28px 70px rgba(6, 18, 44, 0.32);
  font-family: "Poppins", system-ui, sans-serif;
}

/* Modal mode only renders status panels, so it needs no iframe-sized shell. */
.donate-overlay.is-status .donate-panel {
  max-width: 420px;
}
.donate-overlay.is-status .donate-body {
  min-height: 0;
}

.donate-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.4rem 1rem;
  border-bottom: 1px solid #eef1f6;
}
.donate-head h2 {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
  color: #0a1f44;
}
.donate-head p {
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  color: #5b6b82;
  line-height: 1.5;
}
.donate-close {
  border: 0;
  background: #f2f5f9;
  color: #5b6b82;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  flex-shrink: 0;
  transition:
    background 0.2s,
    color 0.2s;
}
.donate-close:hover {
  background: #e6ebf2;
  color: #0a1f44;
}

.donate-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.4rem 1.25rem;
  min-height: 260px;
}

.donate-frame {
  width: 100%;
}
.donate-frame :deep(iframe) {
  width: 100%;
  border: 0;
  display: block;
}

.donate-state {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  text-align: center;
  padding: 2.25rem 0.5rem;
  color: #5b6b82;
}
.state-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0a1f44;
}
.state-sub {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.55;
  max-width: 34ch;
}
.state-ref {
  margin: 0;
  font-size: 0.76rem;
  color: #8b98a9;
  word-break: break-all;
}
.state-mark {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.3rem;
  font-weight: 800;
  background: #ecfdf3;
  color: #0a7a3d;
}
.state-mark.fail {
  background: #fef3f2;
  color: #b42318;
}
.state-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.3rem;
}

.btn-primary,
.btn-ghost {
  font: inherit;
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.btn-primary {
  border: 0;
  background: #ff6a00;
  color: #fff;
}
.btn-primary:hover {
  background: #e85f00;
}
.btn-ghost {
  border: 1.5px solid #e0e6ee;
  background: #fff;
  color: #0a1f44;
}
.btn-ghost:hover {
  border-color: #ff6a00;
  color: #ff6a00;
}

.donate-note {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 0.85rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 0.82rem;
  line-height: 1.5;
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid #ffe1cc;
  border-top-color: #ff6a00;
  animation: donate-spin 0.8s linear infinite;
}
.spinner.small {
  width: 15px;
  height: 15px;
  border-width: 2px;
  flex-shrink: 0;
}
@keyframes donate-spin {
  to {
    transform: rotate(360deg);
  }
}

.donate-foot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 1.4rem;
  border-top: 1px solid #eef1f6;
  background: #fafbfd;
  font-size: 0.74rem;
  color: #5b6b82;
}

.donate-fade-enter-active,
.donate-fade-leave-active {
  transition: opacity 0.22s ease;
}
.donate-fade-enter-from,
.donate-fade-leave-to {
  opacity: 0;
}

@media (max-width: 560px) {
  .donate-overlay {
    padding: 0;
    place-items: stretch;
  }
  .donate-panel {
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
