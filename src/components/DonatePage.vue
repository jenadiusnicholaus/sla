<script setup lang="ts">
import { ref, computed } from 'vue'

// ── Types ────────────────────────────────────────────────────────
interface DonationTier {
  amount: number
  label: string
  impact: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

type DonationType = 'once' | 'monthly'

// ── Props / Emits ────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'close'): void
}>()

// ── State ────────────────────────────────────────────────────────
const donationType = ref<DonationType>('once')
const selectedAmount = ref<number>(50)
const customAmount   = ref<string>('')
const selectedMethod = ref<string>('selcom')
const phone          = ref<string>('')
const isProcessing   = ref<boolean>(false)
const isSuccess      = ref<boolean>(false)
const errorMsg       = ref<string>('')

const tiers: DonationTier[] = [
  { amount: 10,  label: '$10',  impact: 'Funds 1 day of digital training' },
  { amount: 25,  label: '$25',  impact: 'Provides data bundle for 5 students' },
  { amount: 50,  label: '$50',  impact: 'Sponsors a full week of learning' },
  { amount: 100, label: '$100', impact: 'Equips a youth with a skill kit' },
  { amount: 250, label: '$250', impact: 'Funds a month of community outreach' },
  { amount: 500, label: '$500', impact: 'Sponsors a trainee for an entire term' },
]

const paymentMethods: PaymentMethod[] = [
  { id: 'selcom',   name: 'Selcom Wallet',   icon: '📱', description: 'Pay via Selcom mobile wallet', color: '#e84a00' },
  { id: 'mpesa',    name: 'M-Pesa',          icon: '📲', description: 'Pay via M-Pesa mobile money',  color: '#00a859' },
  { id: 'airtel',   name: 'Airtel Money',    icon: '📡', description: 'Pay via Airtel Money',          color: '#e00000' },
  { id: 'card',     name: 'Credit / Debit',  icon: '💳', description: 'Visa, Mastercard, Verve',       color: '#163566' },
]

// ── Computed ─────────────────────────────────────────────────────
const finalAmount = computed<number>(() =>
  customAmount.value ? parseFloat(customAmount.value) || 0 : selectedAmount.value
)

const currentTier = computed<DonationTier | undefined>(() =>
  tiers.find(t => t.amount === selectedAmount.value)
)

const selectAmount = (amount: number): void => {
  selectedAmount.value = amount
  customAmount.value   = ''
}

// ── Selcom integration (stubbed — replace with real API calls) ───
const processDonation = async (): Promise<void> => {
  errorMsg.value = ''

  if (finalAmount.value < 1) {
    errorMsg.value = 'Please enter a valid donation amount.'
    return
  }
  if (['selcom', 'mpesa', 'airtel'].includes(selectedMethod.value) && !phone.value) {
    errorMsg.value = 'Please enter your mobile phone number.'
    return
  }

  isProcessing.value = true

  try {
    /**
     * TODO: Replace with real Selcom API integration.
     * Selcom API endpoint: https://apigw.selcommobile.com/v1/
     * Required: vendor_id, order_id, buyer_msisdn, amount, currency
     * Docs: https://developer.selcom.net/
     */
    await new Promise<void>((resolve) => setTimeout(resolve, 2200))

    isSuccess.value = true
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error
      ? err.message
      : 'Payment failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const resetForm = (): void => {
  isSuccess.value      = false
  isProcessing.value   = false
  selectedAmount.value = 50
  customAmount.value   = ''
  phone.value          = ''
  errorMsg.value       = ''
}
</script>

<template>
  <!-- Backdrop -->
  <div class="donate-backdrop" @click.self="emit('close')" role="dialog" aria-modal="true" aria-label="Donation form">

    <div class="donate-modal">

      <!-- Close button -->
      <button class="close-btn" @click="emit('close')" aria-label="Close donation modal">✕</button>

      <!-- ── Success state ───────────────── -->
      <div v-if="isSuccess" class="success-screen">
        <div class="success-icon">💚</div>
        <h2 class="success-title">Thank You!</h2>
        <p class="success-sub">
          Your donation of <strong>${{ finalAmount }}</strong> is making a real
          difference for young Africans learning digital skills.
        </p>
        <p class="success-ref">Transaction reference: <code>SLA-{{ Date.now() }}</code></p>
        <div class="success-actions">
          <button class="btn-another" @click="resetForm">Make Another Donation</button>
          <button class="btn-close-success" @click="emit('close')">Close</button>
        </div>
      </div>

      <!-- ── Donation form ───────────────── -->
      <template v-else>
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-logo">
            <img src="/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png" alt="SLA Logo" class="modal-logo-img" />
          </div>
          <div>
            <h2 class="modal-title">Make a Donation</h2>
            <p class="modal-sub">Your gift empowers Africa's next digital generation.</p>
          </div>
        </div>

        <!-- Donation type toggle -->
        <div class="type-toggle" role="group" aria-label="Donation frequency">
          <button
            class="toggle-btn"
            :class="{ active: donationType === 'once' }"
            @click="donationType = 'once'"
            id="toggle-once"
          >Give Once</button>
          <button
            class="toggle-btn"
            :class="{ active: donationType === 'monthly' }"
            @click="donationType = 'monthly'"
            id="toggle-monthly"
          >Give Monthly ♻️</button>
        </div>

        <!-- Tier amounts -->
        <div class="amount-grid" role="group" aria-label="Donation amount">
          <button
            v-for="tier in tiers"
            :key="tier.amount"
            class="tier-btn"
            :class="{ active: selectedAmount === tier.amount && !customAmount }"
            @click="selectAmount(tier.amount)"
          >
            <span class="tier-amount">{{ tier.label }}</span>
            <span class="tier-impact">{{ tier.impact }}</span>
          </button>
        </div>

        <!-- Custom amount -->
        <div class="custom-wrap">
          <span class="custom-prefix">$</span>
          <input
            v-model="customAmount"
            type="number"
            class="custom-input"
            placeholder="Enter custom amount"
            min="1"
            id="custom-amount-input"
          />
        </div>

        <!-- Impact line -->
        <p v-if="currentTier && !customAmount" class="impact-hint">
          ✅ {{ currentTier.impact }}
        </p>

        <!-- Payment Methods -->
        <h3 class="method-label">Payment Method</h3>
        <div class="methods-grid">
          <button
            v-for="method in paymentMethods"
            :key="method.id"
            class="method-btn"
            :class="{ active: selectedMethod === method.id }"
            @click="selectedMethod = method.id"
            :id="`method-${method.id}`"
          >
            <span class="method-icon">{{ method.icon }}</span>
            <div class="method-info">
              <span class="method-name">{{ method.name }}</span>
              <span class="method-desc">{{ method.description }}</span>
            </div>
            <span
              class="method-check"
              :class="{ visible: selectedMethod === method.id }"
              aria-hidden="true"
            >✓</span>
          </button>
        </div>

        <!-- Mobile number (for mobile money) -->
        <div
          v-if="['selcom','mpesa','airtel'].includes(selectedMethod)"
          class="phone-wrap"
        >
          <label for="phone-input" class="phone-label">Mobile Number</label>
          <div class="phone-input-wrap">
            <span class="phone-flag">🇹🇿 +255</span>
            <input
              id="phone-input"
              v-model="phone"
              type="tel"
              class="phone-input"
              placeholder="7XX XXX XXXX"
              maxlength="10"
            />
          </div>
          <p class="selcom-notice">
            🔒 Powered by <strong>Selcom</strong> — Tanzania's trusted payment gateway.
            A USSD push will be sent to your phone to confirm payment.
          </p>
        </div>

        <!-- Error message -->
        <p v-if="errorMsg" class="error-msg" role="alert">⚠️ {{ errorMsg }}</p>

        <!-- Submit -->
        <button
          class="donate-submit-btn"
          :disabled="isProcessing"
          @click="processDonation"
          id="donate-submit-btn"
        >
          <span v-if="isProcessing" class="spinner" aria-hidden="true"></span>
          <span v-if="isProcessing">Processing…</span>
          <span v-else>
            ❤️ Donate ${{ finalAmount > 0 ? finalAmount : '—' }}
            {{ donationType === 'monthly' ? '/month' : '' }}
          </span>
        </button>

        <p class="secure-note">🔒 Secure 256-bit SSL encrypted transaction</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Backdrop ────────────────────────────────────────── */
.donate-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(4, 12, 32, 0.75);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: bdFadeIn 0.25s ease;
}
@keyframes bdFadeIn { from{opacity:0;} to{opacity:1;} }

/* ── Modal ───────────────────────────────────────────── */
.donate-modal {
  background: white; border-radius: 24px;
  width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 32px 80px rgba(4,12,32,0.4);
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes modalSlideUp { from{opacity:0;transform:translateY(32px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }

/* Scrollbar */
.donate-modal::-webkit-scrollbar { width: 4px; }
.donate-modal::-webkit-scrollbar-thumb { background: rgba(10,31,68,0.15); border-radius: 4px; }

/* ── Close btn ───────────────────────────────────────── */
.close-btn {
  position: absolute; top: 1.25rem; right: 1.25rem;
  background: rgba(10,31,68,0.06); border: none; cursor: pointer;
  width: 32px; height: 32px; border-radius: 8px;
  font-size: 0.8rem; color: #5a6a85;
  transition: background 0.2s, color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { background: rgba(10,31,68,0.1); color: #0a1f44; }

/* ── Modal header ────────────────────────────────────── */
.modal-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; }
.modal-logo-img { width: 52px; height: 52px; object-fit: contain; }
.modal-title { font-size: 1.5rem; font-weight: 800; color: #0a1f44; font-family: 'Poppins', sans-serif; margin-bottom: 0.2rem; }
.modal-sub { font-size: 0.88rem; color: #5a6a85; }

/* ── Toggle ──────────────────────────────────────────── */
.type-toggle {
  display: flex; background: #f4f7fb; border-radius: 12px;
  padding: 4px; gap: 4px; margin-bottom: 1.5rem;
}
.toggle-btn {
  flex: 1; padding: 0.6rem 1rem; border: none; cursor: pointer;
  border-radius: 9px; font-size: 0.88rem; font-weight: 600;
  font-family: 'Poppins', sans-serif; color: #5a6a85;
  background: transparent; transition: all 0.25s;
}
.toggle-btn.active { background: white; color: #0a1f44; box-shadow: 0 2px 8px rgba(10,31,68,0.12); }

/* ── Tier grid ───────────────────────────────────────── */
.amount-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem; margin-bottom: 1rem;
}
.tier-btn {
  padding: 0.85rem 0.5rem; border-radius: 12px;
  border: 1.5px solid rgba(10,31,68,0.12);
  cursor: pointer; background: white; text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  display: flex; flex-direction: column; gap: 0.2rem;
}
.tier-btn:hover { border-color: #ff6a00; }
.tier-btn.active { border-color: #ff6a00; background: rgba(255,106,0,0.05); box-shadow: 0 0 0 3px rgba(255,106,0,0.15); }
.tier-amount { font-size: 1.1rem; font-weight: 800; color: #0a1f44; font-family: 'Poppins', sans-serif; }
.tier-impact { font-size: 0.68rem; color: #5a6a85; line-height: 1.3; }

/* ── Custom amount ───────────────────────────────────── */
.custom-wrap {
  display: flex; align-items: center;
  border: 1.5px solid rgba(10,31,68,0.15); border-radius: 12px;
  overflow: hidden; margin-bottom: 0.75rem;
  transition: border-color 0.2s;
}
.custom-wrap:focus-within { border-color: #ff6a00; box-shadow: 0 0 0 3px rgba(255,106,0,0.12); }
.custom-prefix {
  padding: 0 1rem; font-size: 1.1rem; font-weight: 700;
  color: #0a1f44; background: #f4f7fb; border-right: 1.5px solid rgba(10,31,68,0.1);
  align-self: stretch; display: flex; align-items: center;
}
.custom-input {
  flex: 1; padding: 0.85rem 1rem; border: none; outline: none;
  font-size: 1rem; font-family: 'Poppins', sans-serif; color: #0a1f44;
}

.impact-hint { font-size: 0.82rem; color: #0a7a3d; font-weight: 600; margin-bottom: 1.25rem; }

/* ── Payment methods ─────────────────────────────────── */
.method-label { font-size: 0.9rem; font-weight: 700; color: #0a1f44; margin-bottom: 0.75rem; font-family: 'Poppins', sans-serif; }
.methods-grid { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; }
.method-btn {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 0.85rem 1rem; border-radius: 12px;
  border: 1.5px solid rgba(10,31,68,0.12);
  cursor: pointer; background: white;
  transition: border-color 0.2s, box-shadow 0.2s; text-align: left;
}
.method-btn:hover { border-color: #ff6a00; }
.method-btn.active { border-color: #ff6a00; background: rgba(255,106,0,0.04); box-shadow: 0 0 0 3px rgba(255,106,0,0.12); }
.method-icon { font-size: 1.4rem; flex-shrink: 0; }
.method-info { display: flex; flex-direction: column; flex: 1; }
.method-name { font-size: 0.88rem; font-weight: 700; color: #0a1f44; font-family: 'Poppins', sans-serif; }
.method-desc { font-size: 0.75rem; color: #5a6a85; }
.method-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: #ff6a00; color: white;
  font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; flex-shrink: 0;
}
.method-check.visible { opacity: 1; }

/* ── Phone input ─────────────────────────────────────── */
.phone-wrap { margin-bottom: 1.25rem; }
.phone-label { display: block; font-size: 0.85rem; font-weight: 600; color: #0a1f44; margin-bottom: 0.5rem; font-family: 'Poppins', sans-serif; }
.phone-input-wrap {
  display: flex; align-items: center;
  border: 1.5px solid rgba(10,31,68,0.15); border-radius: 12px; overflow: hidden;
}
.phone-input-wrap:focus-within { border-color: #ff6a00; box-shadow: 0 0 0 3px rgba(255,106,0,0.12); }
.phone-flag {
  padding: 0 1rem; font-size: 0.88rem; font-weight: 600;
  color: #5a6a85; background: #f4f7fb; border-right: 1.5px solid rgba(10,31,68,0.1);
  align-self: stretch; display: flex; align-items: center; white-space: nowrap;
}
.phone-input { flex: 1; padding: 0.85rem 1rem; border: none; outline: none; font-size: 1rem; font-family: 'Poppins', sans-serif; }
.selcom-notice {
  margin-top: 0.6rem; font-size: 0.78rem; color: #5a6a85;
  background: #f4f7fb; border-radius: 8px; padding: 0.6rem 0.85rem;
  line-height: 1.5; border-left: 3px solid #ff6a00;
}

/* ── Error ───────────────────────────────────────────── */
.error-msg { color: #dc2626; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }

/* ── Submit ──────────────────────────────────────────── */
.donate-submit-btn {
  width: 100%; padding: 1.1rem;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white; border: none; border-radius: 50px; cursor: pointer;
  font-size: 1.05rem; font-weight: 700;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(255,106,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.donate-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,106,0,0.5); }
.donate-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,0.4); border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.secure-note { text-align: center; font-size: 0.78rem; color: #5a6a85; }

/* ── Success screen ──────────────────────────────────── */
.success-screen { text-align: center; padding: 1rem 0; }
.success-icon { font-size: 4rem; margin-bottom: 1rem; animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes successPop { from{transform:scale(0.5);opacity:0;} to{transform:scale(1);opacity:1;} }
.success-title { font-size: 2rem; font-weight: 800; color: #0a1f44; font-family: 'Poppins', sans-serif; margin-bottom: 0.75rem; }
.success-sub { color: #5a6a85; line-height: 1.7; margin-bottom: 1rem; }
.success-ref { font-size: 0.82rem; color: #5a6a85; margin-bottom: 2rem; }
.success-ref code { background: #f4f7fb; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
.success-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-another {
  padding: 0.7rem 1.75rem; border-radius: 50px;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white; border: none; cursor: pointer;
  font-size: 0.9rem; font-weight: 700; font-family: 'Poppins', sans-serif;
  transition: transform 0.2s;
}
.btn-another:hover { transform: translateY(-2px); }
.btn-close-success {
  padding: 0.7rem 1.75rem; border-radius: 50px;
  border: 1.5px solid rgba(10,31,68,0.15); background: white;
  color: #0a1f44; cursor: pointer;
  font-size: 0.9rem; font-weight: 600; font-family: 'Poppins', sans-serif;
  transition: background 0.2s;
}
.btn-close-success:hover { background: #f4f7fb; }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 480px) {
  .donate-modal { padding: 1.75rem 1.25rem; }
  .amount-grid  { grid-template-columns: repeat(2, 1fr); }
}
</style>
