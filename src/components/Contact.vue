<script setup lang="ts">
import { ref, computed } from "vue";
import { cmsApi } from "@/api/client";
import LandingHeader from "@/components/landing/LandingHeader.vue";

interface Settings {
  address?: string;
  phone?: string;
  email?: string;
  website_display?: string;
  website_url?: string;
  social_handle?: string;
  response_sla_hours?: number;
}

interface SocialLink {
  platform?: string;
  url: string;
  icon_label?: string;
  show_in_contact?: boolean;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const props = defineProps<{
  settings?: Settings | null;
  socialLinks?: SocialLink[];
}>();

const contactItems = computed(() => [
  { type: "location", label: "Address", value: props.settings?.address || "Morogoro, Tanzania" },
  { type: "phone", label: "Phone", value: props.settings?.phone || "+255 800 123 456" },
  { type: "email", label: "Email", value: props.settings?.email || "info@streetlabsafrica.org" },
  {
    type: "web",
    label: "Website",
    value: props.settings?.website_display || "streetlabsafrica.org",
  },
]);

const socials = computed(() => {
  const list = (props.socialLinks || []).filter((s) => s.show_in_contact !== false);
  if (list.length) return list.map((s) => ({ label: s.icon_label || s.platform || "•", href: s.url }));
  return [
    { label: "f", href: "#" },
    { label: "𝕏", href: "#" },
    { label: "in", href: "#" },
    { label: "▶", href: "#" },
  ];
});

const socialHandle = computed(() => props.settings?.social_handle || "@streetlabsafrica");
const slaHours = computed(() => props.settings?.response_sla_hours || 24);

const form = ref<FormState>({ name: "", email: "", subject: "", message: "" });
const isSending = ref(false);
const isSent = ref(false);
const sendError = ref("");

const sendMessage = async (): Promise<void> => {
  sendError.value = "";
  if (!form.value.name || !form.value.email || !form.value.message) {
    sendError.value = "Please fill in all required fields.";
    return;
  }
  isSending.value = true;
  try {
    await cmsApi.postContact({ ...form.value });
    isSent.value = true;
    form.value = { name: "", email: "", subject: "", message: "" };
  } catch (e: unknown) {
    sendError.value = e instanceof Error ? e.message : "Failed to send message.";
  } finally {
    isSending.value = false;
  }
};
</script>

<template>
  <section id="contact" class="contact">
    <div class="container">
      <LandingHeader
        index="07"
        kicker="Get In Touch"
        title="Contact Us"
        description="Ready to join the digital revolution? We'd love to hear from you."
      />

      <div class="contact-grid">
        <div class="contact-info">
          <h3 class="info-heading">Let's Connect</h3>
          <p class="info-sub">
            Reach out through any of the channels below and our team will
            respond within {{ slaHours }} hours.
          </p>

          <div class="info-items">
            <div
              v-for="item in contactItems"
              :key="item.label"
              class="info-item"
            >
              <div class="info-icon" aria-hidden="true">
                <svg v-if="item.type === 'location'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <svg v-else-if="item.type === 'phone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <svg v-else-if="item.type === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <div>
                <strong>{{ item.label }}</strong>
                <p>{{ item.value }}</p>
              </div>
            </div>
          </div>

          <div class="social-row">
            <a
              v-for="s in socials"
              :key="s.label"
              :href="s.href"
              class="social-btn"
              :aria-label="s.label"
              target="_blank"
              rel="noopener noreferrer"
              >{{ s.label }}</a
            >
          </div>
          <p class="social-handle">{{ socialHandle }}</p>

          <div class="info-stripe">
            <div class="stripe green"></div>
            <div class="stripe white"></div>
            <div class="stripe orange"></div>
          </div>
        </div>

        <!-- Form -->
        <div class="contact-form">
          <template v-if="!isSent">
            <h3 class="form-title">Send a Message</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="contact-name">Full Name *</label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  class="form-input"
                  placeholder="Your Name"
                />
              </div>
              <div class="form-group">
                <label for="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="contact-subject">Subject</label>
              <input
                id="contact-subject"
                v-model="form.subject"
                type="text"
                class="form-input"
                placeholder="How can we help?"
              />
            </div>
            <div class="form-group">
              <label for="contact-message">Message *</label>
              <textarea
                id="contact-message"
                v-model="form.message"
                class="form-input form-textarea"
                rows="5"
                placeholder="Tell us more…"
              ></textarea>
            </div>
            <p v-if="sendError" class="send-error" role="alert">
              {{ sendError }}
            </p>
            <button class="btn-send" :disabled="isSending" @click="sendMessage">
              <span v-if="isSending" class="spinner"></span>
              {{ isSending ? "Sending…" : "Send Message →" }}
            </button>
          </template>

          <div v-else class="sent-success">
            <div class="sent-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>Message Sent!</h3>
            <p>
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: white;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 0.5rem;
}

.container :deep(.landing-header) {
  margin-bottom: 3.5rem;
}

/* Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 4rem;
  align-items: start;
}

/* Info panel */
.contact-info {
  background: #0a1f44;
  color: white;
  padding: 2.25rem;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.info-heading {
  font-family: "Poppins", sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.info-sub {
  font-size: 0.88rem;
  opacity: 0.65;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #ff6a00;
}
.info-icon svg {
  width: 16px;
  height: 16px;
}
.info-item strong {
  display: block;
  font-size: 0.78rem;
  color: #ff6a00;
  margin-bottom: 0.2rem;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.info-item p {
  font-size: 0.9rem;
  opacity: 0.82;
  line-height: 1.5;
}

.social-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.social-btn:hover {
  background: #ff6a00;
  border-color: #ff6a00;
}
.social-handle {
  font-size: 0.82rem;
  opacity: 0.5;
}

.info-stripe {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 4px;
}
.stripe {
  flex: 1;
}
.stripe.green {
  background: #0a7a3d;
}
.stripe.white {
  background: rgba(255, 255, 255, 0.5);
}
.stripe.orange {
  background: #ff6a00;
}

/* Form */
.contact-form {
  padding: 0.5rem 0;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0a1f44;
  font-family: "Poppins", sans-serif;
  margin-bottom: 1.75rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0a1f44;
  font-family: "Poppins", sans-serif;
}
.form-input {
  padding: 0.85rem 1rem;
  border: 1.5px solid rgba(10, 31, 68, 0.15);
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: "Poppins", sans-serif;
  color: #0a1f44;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: white;
}
.form-input:focus {
  border-color: #ff6a00;
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 130px;
}
.send-error {
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.btn-send {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  font-family: "Poppins", sans-serif;
  box-shadow: 0 6px 20px rgba(255, 106, 0, 0.35);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(255, 106, 0, 0.45);
}
.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success */
.sent-success {
  text-align: center;
  padding: 3rem 1rem;
}
.sent-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.sent-success h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0a1f44;
  font-family: "Poppins", sans-serif;
  margin-bottom: 0.5rem;
}
.sent-success p {
  color: #5a6a85;
  line-height: 1.7;
}

/* Responsive */
@media (max-width: 900px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
