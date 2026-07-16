<template>
  <section class="org-structure-section" data-fade-gallery>
    <div class="section-header">
      <h2 class="section-title">Company Structure</h2>
      <div class="title-bar"></div>
    </div>
    <div class="image-wrapper">
      <img src="/images/org_structure.PNG" alt="Company organization structure" class="responsive-img" />
    </div>
  </section>
</template>

<script setup lang="ts">
// No script needed for static image
</script>

<style scoped>
.org-structure-section {
  padding: 2rem 0.5rem;
  background: #ffffff;
  text-align: center;
}
.section-header {
  margin-bottom: 2rem;
}
.section-title {
  font-family: "Poppins", "Inter", sans-serif;
  font-size: 2rem;
  color: #212121;
}
.title-bar {
  width: 80px;
  height: 4px;
  background: #ff6f61;
  margin: 0.5rem auto;
}
.image-wrapper {
  display: flex;
  justify-content: center;
}
.responsive-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
