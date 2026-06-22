<template>
  <section id="contact" class="contact">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Contact Us</h2>
        <div class="title-bar"></div>
        <p class="section-description">
          Ready to join the digital revolution? Get in touch with Street Labs
          today.
        </p>
      </div>
      <div class="contact-grid">
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div>
              <strong>Address</strong>
              <p>123 Innovation Drive, Yaba, Lagos, Nigeria</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <div>
              <strong>Phone</strong>
              <p>+234 800 123 4567</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <div>
              <strong>Email</strong>
              <p>info@streetlabs.africa</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div>
              <strong>Website</strong>
              <p>www.streetlabs.africa</p>
            </div>
          </div>
          <div class="social-links">
            <a class="social-btn" href="#">f</a>
            <a class="social-btn" href="#">𝕏</a>
            <a class="social-btn" href="#">in</a>
            <a class="social-btn" href="#">▶</a>
          </div>
          <p class="social-handle">@streetlabsafrica</p>
        </div>
        <div class="contact-form">
          <h3 class="form-title">Send a Message</h3>
          <div class="form-group">
            <input type="text" class="form-input" placeholder="Your Name" />
          </div>
          <div class="form-group">
            <input
              type="email"
              class="form-input"
              placeholder="Email Address"
            />
          </div>
          <div class="form-group">
            <input type="text" class="form-input" placeholder="Subject" />
          </div>
          <div class="form-group">
            <textarea
              class="form-input form-textarea"
              placeholder="Your Message"
              rows="5"
            ></textarea>
          </div>
          <button class="btn-send">Send Message</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}

.title-bar {
  width: 60px;
  height: 4px;
  background: #ff6a00;
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.section-description {
  font-size: 1.05rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 4rem;
  align-items: start;
}

.contact-info {
  background: #0a1f44;
  color: white;
  padding: 2.5rem;
  border-radius: 14px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.contact-icon {
  font-size: 1.4rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.contact-item strong {
  display: block;
  font-size: 0.85rem;
  color: #ff6a00;
  margin-bottom: 0.2rem;
  font-family: "Poppins", sans-serif;
}

.contact-item p {
  font-size: 0.95rem;
  opacity: 0.85;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #ff6a00;
  border-color: #ff6a00;
}

.social-handle {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.contact-form {
  padding: 0.5rem 0;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 1.5rem;
  font-family: "Poppins", sans-serif;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: "Poppins", sans-serif;
  color: #0a1f44;
  transition: border-color 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #ff6a00;
}

.form-textarea {
  resize: vertical;
}

.btn-send {
  width: 100%;
  padding: 0.9rem;
  background: #ff6a00;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.2s;
}

.btn-send:hover {
  background: #e05e00;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
