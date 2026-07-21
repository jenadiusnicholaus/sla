<script setup lang="ts">
import { ref } from "vue";
import Header from "../components/Header.vue";
import Hero from "../components/HeroBillionDollar.vue";
import ImageGallery from "../components/ImageGallery.vue";
import About from "../components/About.vue";
import BrandValues from "../components/BrandValues.vue";
import Services from "../components/Services.vue";
import Team from "../components/Team.vue";
import Contact from "../components/Contact.vue";
import Footer from "../components/Footer.vue";
import DonatePage from "../components/DonatePage.vue";
import { useHomepageCms } from "@/composables/useHomepageCms";

const showDonateModal = ref<boolean>(false);
const {
  useLiveHomepage,
  settings,
  announcement,
  hero,
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
} = useHomepageCms();

const heroStats = statsFor("hero");
const aboutStats = statsFor("about");
const headerNav = navFor("header");
const footerNav = navFor("footer");

useLiveHomepage();
</script>

<template>
  <div class="sla-website">
    <Header
      :announcement="announcement"
      :nav="headerNav"
      :settings="settings"
      @open-donate="showDonateModal = true"
    />
    <Hero
      :hero="hero"
      :stats="heroStats"
      @open-donate="showDonateModal = true"
    />
    <ImageGallery :gallery="gallery" />
    <About :about="about" :stats="aboutStats" />
    <BrandValues :values="values" />
    <Services :programs="programs" />
    <Team :org-chart="orgChart" :team="team" :settings="settings" />
    <Contact :settings="settings" :social-links="socialLinks" />
    <Footer
      :settings="settings"
      :nav="footerNav"
      :social-links="socialLinks"
    />

    <transition name="fade">
      <DonatePage
        v-if="showDonateModal"
        :donate="donate"
        @close="showDonateModal = false"
      />
    </transition>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap");
@import "../styles/landing.css";

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
  font-family: "Poppins", system-ui, sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
