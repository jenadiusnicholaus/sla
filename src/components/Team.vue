<script setup lang="ts">
import { useFadeUp } from "@/composables/useFadeUp";

useFadeUp("[data-fade-team]");

const directorCards = [
  {
    title: "Director of Operations",
    icon: "⚙️",
    color: "#0a1f44",
    accent: "#163566",
  },
  {
    title: "Director of Corporate Events",
    icon: "📅",
    color: "#ff6a00",
    accent: "#e04500",
  },
  {
    title: "Director of Innovation",
    icon: "💡",
    color: "#0a7a3d",
    accent: "#085e2f",
  },
  {
    title: "Chief Financial Officer",
    icon: "📈",
    color: "#0a7a3d",
    accent: "#085e2f",
  },
  {
    title: "Chief Technology Officer",
    icon: "💻",
    color: "#0a1f44",
    accent: "#163566",
  },
  {
    title: "Director of Creative",
    icon: "🎨",
    color: "#ff6a00",
    accent: "#e04500",
  },
];

const teamMembers = [
  {
    name: "Anna Joseph Msulla",
    role: "Chief Operating Officer",
    bio: "Brief bio placeholder describing expertise and vision for digital transformation in Africa.",
    initials: "AM",
    color: "#0a1f44",
  },
  {
    name: "Abud Hamidu Abdu",
    role: "Director of Operations",
    bio: "Brief bio placeholder describing operational leadership and commitment to youth empowerment.",
    initials: "AA",
    color: "#0a7a3d",
  },
  {
    name: "Vicent Johanes Mirumbe",
    role: "Director of Corporate Events",
    bio: "Brief bio placeholder covering tech strategy and innovation across programs.",
    initials: "VM",
    color: "#ff6a00",
  },
  {
    name: "Mahmoud Mohamed Mahmoud",
    role: "Director of Innovation",
    bio: "Brief bio placeholder highlighting program delivery and community impact.",
    initials: "MM",
    color: "#0a1f44",
  },
  {
    name: "Gervass Orgeness Urassa",
    role: "Director of Creative",
    bio: "Brief bio placeholder for creative direction and brand storytelling.",
    initials: "GU",
    color: "#ff6a00",
  },
  {
    name: "Jenadius Nicholaus Kaimkilwa",
    role: "Chief Technology Officer",
    bio: "Brief bio placeholder for financial stewardship and sustainable growth.",
    initials: "JK",
    color: "#0a7a3d",
  },
];
</script>

<template>
  <section id="team" class="team-section">
    <div class="container">
      <!-- Section header -->
      <div class="section-header" data-fade-team>
        <img
          src="/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png"
          alt="Street Digital Labs Africa Logo"
          class="team-logo"
        />
        <span class="eyebrow">Leadership</span>
        <h2 class="section-title">Our Team Structure</h2>
        <div class="title-bar"></div>
        <p class="section-desc">
          The dedicated leaders driving digital transformation across Africa.
        </p>
      </div>

      <!-- Org chart -->
      <div class="org-chart" data-fade-team>
        <!-- Level 1: Think Tank -->
        <div class="level level-1">
          <div class="org-card card-navy">
            <div class="card-icon-wrap icon-navy">
              <span class="card-icon">👥</span>
            </div>
            <div class="card-body">
              <span class="card-title">AFRICA THINK TANK<br />COMMISSION</span>
            </div>
          </div>
        </div>

        <!-- Connector L1 → L2 -->
        <div class="connector-v"></div>

        <!-- Level 2: CEO -->
        <div class="level level-2">
          <div class="org-card card-orange">
            <div class="card-icon-wrap icon-orange">
              <span class="card-icon">👤</span>
            </div>
            <div class="card-body">
              <span class="card-title">CHIEF EXECUTIVE OFFICER</span>
              <span class="card-sub">(CEO)</span>
            </div>
          </div>
        </div>

        <!-- Connector L2 → L3 -->
        <div class="connector-v"></div>

        <!-- Level 3: COO -->
        <div class="level level-3">
          <div class="org-card card-green">
            <div class="card-icon-wrap icon-green">
              <span class="card-icon">👤</span>
            </div>
            <div class="card-body">
              <span class="card-title">CHIEF OPERATING OFFICER</span>
              <span class="card-sub">(COO)</span>
            </div>
          </div>
        </div>

        <!-- Connector L3 → L4 horizontal branch -->
        <div class="branch-connector">
          <div class="branch-v-top"></div>
          <div class="branch-h"></div>
          <div class="branch-dots">
            <span v-for="n in 6" :key="n" class="branch-dot"></span>
          </div>
        </div>

        <!-- Level 4: Directors -->
        <div class="level level-4">
          <div
            v-for="dir in directorCards"
            :key="dir.title"
            class="director-card"
            :style="{ '--accent': dir.color, '--accent2': dir.accent }"
          >
            <div class="dir-icon-wrap" :style="{ background: dir.color }">
              <span class="dir-icon">{{ dir.icon }}</span>
            </div>
            <span class="dir-title">{{ dir.title }}</span>
          </div>
        </div>
      </div>

      <!-- Team members grid -->
      <div class="members-header" data-fade-team>
        <h3 class="members-title">Meet the Team</h3>
        <p class="members-sub">
          The passionate people behind Street Digital Labs Africa.
        </p>
      </div>

      <div class="members-grid" data-fade-team>
        <div
          v-for="member in teamMembers"
          :key="member.name"
          class="member-card"
        >
          <div class="member-avatar" :style="{ background: member.color }">
            <svg class="member-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <h4 class="member-name">{{ member.name }}</h4>
          <span class="member-role">{{ member.role }}</span>
        </div>
      </div>

      <!-- Join CTA -->
      <div class="join-cta" data-fade-team>
        <p class="join-text">Want to be part of the mission?</p>
        <a href="#contact" class="join-btn">Join Our Team →</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team-section {
  background: #f4f7fb;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 0.5rem;
}

/* Header */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}
.team-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto 1.5rem;
  display: block;
}
.eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0a7a3d;
  background: rgba(10, 122, 61, 0.08);
  border: 1px solid rgba(10, 122, 61, 0.2);
  padding: 0.3rem 1rem;
  border-radius: 50px;
  margin-bottom: 1rem;
  font-family: "Poppins", sans-serif;
}
.section-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: #0a1f44;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}
.title-bar {
  width: 56px;
  height: 4px;
  background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.25rem;
  border-radius: 2px;
}
.section-desc {
  font-size: 1rem;
  color: #5a6a85;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.7;
}

/* Org chart layout */
.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 3rem;
}

/* Levels */
.level {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Base card */
.org-card {
  display: flex;
  align-items: center;
  gap: 0;
  border-radius: 14px;
  overflow: hidden;
  min-width: 320px;
  max-width: 380px;
  box-shadow: 0 4px 20px rgba(10, 31, 68, 0.12);
  border: 2px solid transparent;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.org-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(10, 31, 68, 0.18);
}

.card-icon-wrap {
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
}
.card-icon {
  font-size: 1.6rem;
  filter: brightness(1.8) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}
.card-body {
  background: #ffffff;
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-title {
  font-family: "Poppins", sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
  color: #0a1f44;
  letter-spacing: 0.02em;
  line-height: 1.3;
}
.card-sub {
  font-family: "Poppins", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 0.2rem;
}

/* Card color variants */
.card-navy {
  border-color: #0a1f44;
}
.icon-navy {
  background: #0a1f44;
}
.icon-navy .card-icon {
  filter: invert(1);
}

.card-orange {
  border-color: #ff6a00;
}
.icon-orange {
  background: #ff6a00;
}
.card-orange .card-sub {
  color: #ff6a00;
}

.card-green {
  border-color: #0a7a3d;
}
.icon-green {
  background: #0a7a3d;
}
.icon-green .card-icon {
  filter: invert(1);
}
.card-green .card-sub {
  color: #0a7a3d;
}

/* Vertical connectors */
.connector-v {
  width: 2px;
  height: 36px;
  background: #0a7a3d;
  position: relative;
}
.connector-v::before,
.connector-v::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0a7a3d;
  left: 50%;
  transform: translateX(-50%);
}
.connector-v::before {
  top: -5px;
}
.connector-v::after {
  bottom: -5px;
}

/* Branch connector (COO → directors) */
.branch-connector {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.branch-v-top {
  width: 2px;
  height: 30px;
  background: #0a7a3d;
}
.branch-h {
  width: 90%;
  height: 2px;
  background: #0a7a3d;
}
.branch-dots {
  width: 90%;
  display: flex;
  justify-content: space-between;
  margin-top: -1px;
}
.branch-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0a7a3d;
  margin-top: -4px;
}

/* Directors grid */
.level-4 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  width: 90%;
  margin-top: 0.5rem;
  align-items: start;
}

.director-card {
  background: #ffffff;
  border: 2px solid var(--accent);
  border-radius: 14px;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  box-shadow: 0 3px 12px rgba(10, 31, 68, 0.08);
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.director-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(10, 31, 68, 0.15);
}
.dir-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dir-icon {
  font-size: 1.5rem;
  filter: brightness(1.5) drop-shadow(0 0 3px rgba(255, 255, 255, 0.4));
}
.dir-title {
  font-family: "Poppins", sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0a1f44;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

/* Join CTA */
.join-cta {
  text-align: center;
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, #0a1f44, #163566);
  border-radius: 20px;
  color: white;
}
.join-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
  opacity: 0.9;
}
.join-btn {
  display: inline-block;
  text-decoration: none;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: "Poppins", sans-serif;
  padding: 0.8rem 2.25rem;
  border-radius: 50px;
  box-shadow: 0 6px 24px rgba(255, 106, 0, 0.4);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.join-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 106, 0, 0.5);
}

/* Fade-up */
[data-fade-team] {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}
[data-fade-team].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Team members grid */
.members-header {
  text-align: center;
  margin: 3rem 0 2rem;
}
.members-title {
  font-family: "Poppins", sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: #0a1f44;
  margin-bottom: 0.5rem;
}
.members-sub {
  font-size: 0.95rem;
  color: #5a6a85;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.member-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 3px 14px rgba(10, 31, 68, 0.08);
  border: 1px solid rgba(10, 31, 68, 0.06);
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(10, 31, 68, 0.14);
}

.member-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.member-icon {
  width: 48px;
  height: 48px;
  color: #ffffff;
}

.member-name {
  font-family: "Poppins", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 0.3rem;
}
.member-role {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ff6a00;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Responsive */
@media (max-width: 900px) {
  .level-4 {
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
  }
  .branch-h,
  .branch-dots {
    width: 100%;
  }
  .org-card {
    min-width: 260px;
  }
  .members-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 580px) {
  .level-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .org-card {
    min-width: 220px;
    max-width: 100%;
  }
  .branch-dots {
    display: none;
  }
  .branch-h {
    display: none;
  }
  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
