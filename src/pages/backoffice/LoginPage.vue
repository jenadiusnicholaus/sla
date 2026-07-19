<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { login, loading } = useAuth()
const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await login(username.value, password.value)
    router.push(route.query.next || '/backoffice')
  } catch (e) {
    error.value = e.message || 'Login failed'
  }
}
</script>

<template>
  <div class="login">
    <div class="atmosphere" aria-hidden="true">
      <span class="orb orb-a" />
      <span class="orb orb-b" />
      <span class="orb orb-c" />
      <span class="grid" />
    </div>

    <div class="shell">
      <aside class="brand-panel">
        <img
          src="/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png"
          alt="Street Digital Labs Africa"
          class="logo"
        />
        <p class="eyebrow">Street Digital Labs Africa</p>
        <h1>Command center for the mission</h1>
        <p class="lede">
          Manage the website, Smart QR platform, and community profiles from one secure workspace.
        </p>
        <ul class="chips">
          <li>Website CMS</li>
          <li>Smart QR</li>
          <li>Profiles</li>
          <li>Meetings</li>
        </ul>
      </aside>

      <section class="form-panel">
        <div class="form-card">
          <header class="form-head">
            <p class="form-kicker">Backoffice</p>
            <h2>Sign in</h2>
            <p class="form-sub">Use your organisation admin account to continue.</p>
          </header>

          <form class="form" @submit.prevent="submit">
            <label>
              <span>Username</span>
              <input
                v-model="username"
                type="text"
                autocomplete="username"
                placeholder="Enter username"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <div class="password-field">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  class="toggle"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <VaIcon :name="showPassword ? 'visibility_off' : 'visibility'" size="20px" />
                </button>
              </div>
            </label>

            <p v-if="error" class="error" role="alert">{{ error }}</p>

            <button type="submit" class="submit" :disabled="loading">
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <p class="footer-link">
            <a href="/">← Back to streetlabsafrica.org</a>
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login {
  --navy: #0a1f44;
  --navy-deep: #061427;
  --orange: #ff6a00;
  --green: #0a7a3d;
  --muted: rgba(255, 255, 255, 0.68);

  position: relative;
  isolation: isolate;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  overflow: hidden;
  font-family: 'Poppins', system-ui, sans-serif;
  background: radial-gradient(1200px 700px at 20% 20%, #163566 0%, transparent 55%),
    radial-gradient(900px 600px at 90% 10%, rgba(255, 106, 0, 0.18) 0%, transparent 45%),
    linear-gradient(160deg, var(--navy-deep), var(--navy) 55%, #102848);
  color: #fff;
}

.atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.45;
  animation: drift 14s ease-in-out infinite alternate;
}
.orb-a {
  width: 280px;
  height: 280px;
  background: rgba(255, 106, 0, 0.35);
  top: -60px;
  right: 12%;
}
.orb-b {
  width: 320px;
  height: 320px;
  background: rgba(10, 122, 61, 0.28);
  bottom: -80px;
  left: 8%;
  animation-delay: -4s;
}
.orb-c {
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.12);
  top: 42%;
  left: 45%;
  animation-delay: -7s;
}
.grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  opacity: 0.5;
}

@keyframes drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(18px, -22px, 0) scale(1.08); }
}

.shell {
  position: relative;
  z-index: 1;
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  overflow: hidden;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.brand-panel {
  padding: 2.5rem 2.25rem;
  background:
    linear-gradient(160deg, rgba(255, 106, 0, 0.16), transparent 42%),
    linear-gradient(20deg, rgba(10, 122, 61, 0.12), transparent 40%),
    rgba(6, 20, 39, 0.55);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.85rem;
}
.logo {
  width: 72px;
  height: auto;
  object-fit: contain;
  margin-bottom: 0.35rem;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.eyebrow {
  margin: 0;
  color: var(--orange);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 700;
}
.brand-panel h1 {
  margin: 0;
  font-size: clamp(1.7rem, 3vw, 2.25rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  font-weight: 700;
}
.lede {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
  font-size: 0.98rem;
  max-width: 34ch;
}
.chips {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.chips li {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
}

.form-panel {
  display: grid;
  place-items: center;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
}
.form-card {
  width: min(360px, 100%);
}
.form-head {
  margin-bottom: 1.4rem;
}
.form-kicker {
  margin: 0 0 0.35rem;
  color: var(--orange);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.form-head h2 {
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
}
.form-sub {
  margin: 0.4rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.form {
  display: grid;
  gap: 0.95rem;
}
label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.82);
}
input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(6, 20, 39, 0.55);
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  color: #fff;
  font: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
input:focus {
  border-color: rgba(255, 106, 0, 0.7);
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.18);
}
.password-field {
  position: relative;
}
.password-field input {
  padding-right: 2.8rem;
}
.toggle {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.submit {
  width: 100%;
  margin-top: 0.25rem;
  border: 0;
  border-radius: 999px;
  padding: 0.95rem 1rem;
  background: linear-gradient(135deg, var(--orange), #e04500);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(255, 106, 0, 0.35);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}
.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px rgba(255, 106, 0, 0.45);
}
.submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.error {
  margin: 0;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  background: rgba(180, 35, 24, 0.2);
  border: 1px solid rgba(255, 180, 168, 0.35);
  color: #ffd2cb;
  font-size: 0.86rem;
}

.footer-link {
  margin: 1.35rem 0 0;
  text-align: center;
}
.footer-link a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.86rem;
}
.footer-link a:hover {
  color: #fff;
}

@media (max-width: 820px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.75rem 1.5rem 1.4rem;
    text-align: center;
    align-items: center;
  }
  .lede {
    max-width: 40ch;
  }
  .chips {
    justify-content: center;
  }
  .form-panel {
    padding: 1.5rem 1.25rem 1.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shell,
  .orb {
    animation: none;
  }
}
</style>
