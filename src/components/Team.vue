<script setup lang="ts">
import { useFadeUp } from '@/composables/useFadeUp'

interface TeamMember {
  name: string
  role: string
  initials: string
  color: string
  bio: string
  socials: { icon: string; label: string }[]
}

const team: TeamMember[] = [
  {
    name: 'Amara Okafor',
    role: 'Executive Director',
    initials: 'AO',
    color: '#ff6a00',
    bio: 'Visionary leader with 12 years driving digital inclusion across West Africa.',
    socials: [{ icon: 'in', label: 'LinkedIn' }, { icon: '𝕏', label: 'Twitter' }],
  },
  {
    name: 'Chisom Nwosu',
    role: 'Head of Programs',
    initials: 'CN',
    color: '#0a7a3d',
    bio: 'Curriculum architect passionate about hands-on tech education for youth.',
    socials: [{ icon: 'in', label: 'LinkedIn' }, { icon: '𝕏', label: 'Twitter' }],
  },
  {
    name: 'Emeka Adeyemi',
    role: 'Tech Lead & Mentor',
    initials: 'EA',
    color: '#163566',
    bio: 'Full-stack engineer and coach who has mentored 500+ junior developers.',
    socials: [{ icon: 'in', label: 'LinkedIn' }, { icon: 'gh', label: 'GitHub' }],
  },
  {
    name: 'Fatima Al-Hassan',
    role: 'Community Manager',
    initials: 'FA',
    color: '#7c3aed',
    bio: 'Builds and nurtures communities that turn learners into leaders.',
    socials: [{ icon: 'in', label: 'LinkedIn' }, { icon: '𝕏', label: 'Twitter' }],
  },
  {
    name: 'Kelechi Obi',
    role: 'Partnerships Lead',
    initials: 'KO',
    color: '#0891b2',
    bio: 'Connects Street Labs with NGOs, corporates, and government bodies.',
    socials: [{ icon: 'in', label: 'LinkedIn' }],
  },
  {
    name: 'Ngozi Eze',
    role: 'Creative Director',
    initials: 'NE',
    color: '#dc2626',
    bio: 'Design thinker who crafts compelling stories that inspire impact.',
    socials: [{ icon: 'in', label: 'LinkedIn' }, { icon: '𝕏', label: 'Twitter' }],
  },
]

useFadeUp('[data-fade-team]')
</script>

<template>
  <section id="team" class="team-section">
    <div class="container">
      <!-- Header -->
      <div class="section-header" data-fade-team>
        <span class="eyebrow">The People</span>
        <h2 class="section-title">Meet Our Team</h2>
        <div class="title-bar"></div>
        <p class="section-desc">
          Passionate changemakers dedicated to transforming digital access across Africa.
        </p>
      </div>

      <!-- Team grid -->
      <div class="team-grid">
        <article
          v-for="member in team"
          :key="member.name"
          class="member-card"
          data-fade-team
        >
          <!-- Avatar -->
          <div class="avatar-wrap">
            <div
              class="avatar"
              :style="{ background: member.color + '22', borderColor: member.color + '55' }"
            >
              <span class="avatar-initials" :style="{ color: member.color }">
                {{ member.initials }}
              </span>
            </div>
            <div class="avatar-ring" :style="{ borderColor: member.color }"></div>
          </div>

          <!-- Info -->
          <div class="member-info">
            <h3 class="member-name">{{ member.name }}</h3>
            <span class="member-role" :style="{ color: member.color }">{{ member.role }}</span>
            <p class="member-bio">{{ member.bio }}</p>
          </div>

          <!-- Socials -->
          <div class="member-socials">
            <a
              v-for="s in member.socials"
              :key="s.label"
              href="#"
              class="social-btn"
              :aria-label="s.label"
            >{{ s.icon }}</a>
          </div>
        </article>
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
.team-section { background: #f4f7fb; }

.container { max-width: 1200px; margin: 0 auto; padding: 6rem 2rem; }

/* Header */
.section-header { text-align: center; margin-bottom: 4rem; }
.eyebrow {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase; color: #0a7a3d;
  background: rgba(10,122,61,0.08); border: 1px solid rgba(10,122,61,0.2);
  padding: 0.3rem 1rem; border-radius: 50px; margin-bottom: 1rem;
  font-family: 'Poppins', sans-serif;
}
.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; color: #0a1f44;
  margin-bottom: 0.75rem; font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;
}
.title-bar {
  width: 56px; height: 4px;
  background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.5rem; border-radius: 2px;
}
.section-desc { font-size: 1.05rem; color: #5a6a85; max-width: 600px; margin: 0 auto; line-height: 1.8; }

/* Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem; margin-bottom: 4rem;
}

/* Card */
.member-card {
  background: white; border-radius: 20px;
  padding: 2rem; text-align: center;
  box-shadow: 0 2px 20px rgba(10,31,68,0.07);
  border: 1px solid rgba(10,31,68,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.member-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(10,31,68,0.14); }

/* Avatar */
.avatar-wrap { position: relative; width: 88px; height: 88px; }
.avatar {
  width: 88px; height: 88px; border-radius: 50%;
  border: 2px solid; display: flex; align-items: center; justify-content: center;
}
.avatar-initials { font-size: 1.6rem; font-weight: 800; font-family: 'Poppins', sans-serif; }
.avatar-ring {
  position: absolute; inset: -5px; border-radius: 50%;
  border: 2px solid; opacity: 0.25;
}

/* Info */
.member-info { width: 100%; }
.member-name {
  font-size: 1.1rem; font-weight: 700; color: #0a1f44;
  font-family: 'Poppins', sans-serif; margin-bottom: 0.25rem;
}
.member-role {
  display: block; font-size: 0.8rem; font-weight: 600;
  letter-spacing: 0.04em; margin-bottom: 0.75rem;
  font-family: 'Poppins', sans-serif;
}
.member-bio { font-size: 0.88rem; color: #5a6a85; line-height: 1.7; }

/* Socials */
.member-socials { display: flex; gap: 0.5rem; justify-content: center; }
.social-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 8px;
  border: 1.5px solid rgba(10,31,68,0.12);
  color: #5a6a85; text-decoration: none;
  font-size: 0.8rem; font-weight: 700;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.social-btn:hover { background: #ff6a00; color: white; border-color: #ff6a00; }

/* Join CTA */
.join-cta {
  text-align: center; padding: 3rem 2rem;
  background: linear-gradient(135deg, #0a1f44, #163566);
  border-radius: 20px; color: white;
}
.join-text { font-size: 1.2rem; font-weight: 500; margin-bottom: 1.5rem; opacity: 0.85; }
.join-btn {
  display: inline-block; text-decoration: none;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white; font-size: 1rem; font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 0.85rem 2.5rem; border-radius: 50px;
  box-shadow: 0 6px 24px rgba(255,106,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.join-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,106,0,0.5); }

/* Fade-up */
[data-fade-team] {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
[data-fade-team].is-visible { opacity: 1; transform: translateY(0); }

@media (max-width: 640px) {
  .team-grid { grid-template-columns: 1fr; }
}
</style>
