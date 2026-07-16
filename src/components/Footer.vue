<script setup lang="ts">
interface FooterLink {
  label: string;
  href: string;
}

const quickLinks: FooterLink[] = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Programs", href: "#services" },
  { label: "Values", href: "#values" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <!-- Top stripe -->
    <div class="footer-stripe">
      <div class="stripe green"></div>
      <div class="stripe white"></div>
      <div class="stripe orange"></div>
    </div>

    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo">
            <img
              src="/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png"
              alt="Street Digital Labs Africa"
              class="footer-logo-img"
            />
            <div class="footer-logo-text">
              <span class="logo-name">Street Digital Labs</span>
              <span class="logo-sub">Africa</span>
            </div>
          </div>
          <p class="footer-tagline">Inclusion for All! 🌍</p>
          <p class="footer-desc">
            A digital skills and innovation hub committed to empowering young
            people and communities across Africa through technology and
            opportunity.
          </p>
          <!-- Social -->
          <div class="social-row">
            <a
              v-for="s in ['f', '𝕏', 'in', '▶']"
              :key="s"
              href="#"
              class="social-btn"
              :aria-label="s"
              >{{ s }}</a
            >
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-nav">
          <h4 class="footer-heading">Quick Links</h4>
          <a
            v-for="link in quickLinks"
            :key="link.label"
            :href="link.href"
            class="footer-link"
            >{{ link.label }}</a
          >
        </div>

        <!-- Contact -->
        <div class="footer-contact">
          <h4 class="footer-heading">Contact</h4>
          <p>📍 Morogoro, Tanzania</p>
          <p>📞 +255 800 123 456</p>
          <p>✉️ info@streetlabsafrica.org</p>
          <p>
            🌐
            <a href="https://streetlabsafrica.org" class="footer-link-inline"
              >streetlabsafrica.org</a
            >
          </p>
        </div>

        <!-- Newsletter -->
        <div class="footer-newsletter">
          <h4 class="footer-heading">Stay Updated</h4>
          <p class="newsletter-desc">
            Get the latest news on our programs and impact.
          </p>
          <div class="newsletter-form">
            <input
              type="email"
              class="newsletter-input"
              placeholder="your@email.com"
              id="footer-newsletter-email"
            />
            <button class="newsletter-btn" id="footer-newsletter-submit">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <p>
          © {{ currentYear }} Street Digital Labs Africa. All rights reserved.
        </p>
        <p class="footer-credit">Made with ❤️ for Africa</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #060f20;
  color: white;
}

/* Stripe */
.footer-stripe {
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
}

/* Grid */
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Brand */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.footer-logo-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}
.footer-logo-text {
  display: flex;
  flex-direction: column;
}
.logo-name {
  font-size: 1rem;
  font-weight: 800;
  color: white;
  font-family: "Poppins", sans-serif;
}
.logo-sub {
  font-size: 0.7rem;
  font-weight: 600;
  color: #ff6a00;
  font-family: "Poppins", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.footer-tagline {
  font-size: 0.85rem;
  color: #0a7a3d;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}
.footer-desc {
  font-size: 0.88rem;
  line-height: 1.75;
  opacity: 0.58;
  margin-bottom: 1.5rem;
}

.social-row {
  display: flex;
  gap: 0.6rem;
}
.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}
.social-btn:hover {
  background: #ff6a00;
  border-color: #ff6a00;
  color: white;
}

/* Nav */
.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.footer-heading {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ff6a00;
  margin-bottom: 1rem;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.footer-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.88rem;
  line-height: 2;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #ff6a00;
}

/* Contact */
.footer-contact p {
  font-size: 0.88rem;
  opacity: 0.65;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}
.footer-link-inline {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link-inline:hover {
  color: #ff6a00;
}

/* Newsletter */
.newsletter-desc {
  font-size: 0.85rem;
  opacity: 0.6;
  margin-bottom: 1rem;
  line-height: 1.6;
}
.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.newsletter-input {
  padding: 0.7rem 1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 0.88rem;
  font-family: "Poppins", sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.newsletter-input:focus {
  border-color: #ff6a00;
}
.newsletter-btn {
  padding: 0.7rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: "Poppins", sans-serif;
  transition: transform 0.2s;
}
.newsletter-btn:hover {
  transform: translateY(-1px);
}

/* Bottom bar */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
  opacity: 0.5;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
}
@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
