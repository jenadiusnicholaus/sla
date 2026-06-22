<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isMenuOpen = ref(false);
const isScrolled = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <div class="logo">
        <span class="logo-street">Street</span>
        <span class="logo-labs">Labs</span>
        <span class="logo-tagline">Street Digital Labs Africa</span>
      </div>
      <nav class="nav" :class="{ 'nav-open': isMenuOpen }">
        <a href="#home" class="nav-link">Home</a>
        <a href="#about" class="nav-link">About</a>
        <a href="#values" class="nav-link">Values</a>
        <a href="#services" class="nav-link">Programs</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
      <div class="header-right">
        <a href="#contact" class="cta-btn">Get Started</a>
        <button class="menu-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: rgba(6, 15, 35, 0.7);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition:
    background 0.35s,
    box-shadow 0.35s;
}

.header.scrolled {
  background: rgba(6, 15, 35, 0.97);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.logo-street {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
}

.logo-labs {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6a00;
  font-family: "Poppins", sans-serif;
}

.logo-tagline {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 400;
  margin-left: 0.75rem;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  gap: 2.25rem;
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.25s;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.01em;
}

.nav-link:hover {
  color: #ff6a00;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cta-btn {
  text-decoration: none;
  background: #ff6a00;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  padding: 0.55rem 1.3rem;
  border-radius: 6px;
  transition:
    background 0.2s,
    transform 0.2s;
  white-space: nowrap;
}

.cta-btn:hover {
  background: #e05e00;
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-toggle span {
  width: 22px;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transition: 0.3s;
}

@media (max-width: 900px) {
  .nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(6, 15, 35, 0.98);
    flex-direction: column;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    gap: 1.25rem;
  }

  .nav-open {
    display: flex;
  }

  .menu-toggle {
    display: flex;
  }

  .logo-tagline {
    display: none;
  }

  .cta-btn {
    display: none;
  }
}
</style>
