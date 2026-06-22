<template>
  <footer class="footer">
    <div class="footer-stripe">
      <div class="stripe stripe-orange"></div>
      <div class="stripe stripe-white"></div>
      <div class="stripe stripe-green"></div>
    </div>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-street">Street</span>
            <span class="logo-labs">Labs</span>
          </div>
          <p class="footer-tagline">
            Street Digital Labs Africa, Inclusion for All!
          </p>
          <p class="footer-desc">
            A digital skills and innovation hub committed to empowering young
            people and communities across Africa.
          </p>
        </div>
        <div class="footer-nav">
          <h4 class="footer-heading">Quick Links</h4>
          <a href="#home" class="footer-link">Home</a>
          <a href="#about" class="footer-link">About Us</a>
          <a href="#values" class="footer-link">Brand Values</a>
          <a href="#services" class="footer-link">Programs</a>
          <a href="#contact" class="footer-link">Contact</a>
        </div>
        <div class="footer-contact">
          <h4 class="footer-heading">Contact</h4>
          <p>📍 123 Innovation Drive, Yaba, Lagos, Nigeria</p>
          <p>📞 +234 800 123 4567</p>
          <p>✉️ info@streetlabs.africa</p>
          <p>🌐 www.streetlabs.africa</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Street Digital Labs Africa. All rights reserved.</p>
        <p class="footer-social">@streetlabsafrica</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #0a1f44;
  color: white;
}

.footer-stripe {
  display: flex;
  height: 5px;
}

.stripe {
  flex: 1;
}
.stripe-orange {
  background: #ff6a00;
}
.stripe-white {
  background: #ffffff;
}
.stripe-green {
  background: #0a7a3d;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3.5rem 2rem 1.5rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2.5rem;
}

.footer-logo {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.logo-street {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
}

.logo-labs {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ff6a00;
  font-family: "Poppins", sans-serif;
}

.footer-tagline {
  font-size: 0.85rem;
  color: #0a7a3d;
  font-weight: 500;
  margin-bottom: 1rem;
  font-family: "Poppins", sans-serif;
}

.footer-desc {
  font-size: 0.9rem;
  line-height: 1.7;
  opacity: 0.7;
}

.footer-heading {
  font-size: 1rem;
  font-weight: 700;
  color: #ff6a00;
  margin-bottom: 1rem;
  font-family: "Poppins", sans-serif;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.75;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.footer-link:hover {
  opacity: 1;
  color: #ff6a00;
}

.footer-contact p {
  font-size: 0.9rem;
  opacity: 0.75;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
  opacity: 0.6;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 768px) {
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
