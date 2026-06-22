<script setup>
import Header from "../components/Header.vue";
import Hero from "../components/HeroBillionDollar.vue";
import About from "../components/About.vue";
import BrandValues from "../components/BrandValues.vue";
import Services from "../components/Services.vue";
import Contact from "../components/Contact.vue";
import Footer from "../components/Footer.vue";
</script>

<template>
  <div class="sla-website">
    <Header />
    <Hero />
    <About />
    <BrandValues />
    <Services />
    <Contact />
    <Footer />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sla-website {
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
