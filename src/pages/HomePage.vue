<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Hero from '../components/HeroBillionDollar.vue'
import About from '../components/About.vue'
import BrandValues from '../components/BrandValues.vue'
import Services from '../components/Services.vue'
import Team from '../components/Team.vue'
import Contact from '../components/Contact.vue'
import Footer from '../components/Footer.vue'
import DonatePage from '../components/DonatePage.vue'

const showDonateModal = ref<boolean>(false)
</script>

<template>
  <div class="sla-website">
    <Header @open-donate="showDonateModal = true" />
    <Hero @open-donate="showDonateModal = true" />
    <About />
    <BrandValues />
    <Services />
    <Team />
    <Contact />
    <Footer />

    <!-- Donation Form Modal -->
    <transition name="fade">
      <DonatePage v-if="showDonateModal" @close="showDonateModal = false" />
    </transition>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap");

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.sla-website {
  font-family: "Poppins", "Inter", sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Modal Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
