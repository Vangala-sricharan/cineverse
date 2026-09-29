/**
 * DEV ONLY: Phase 1 Cinematic Visual Assets
 * 
 * High-fidelity, self-contained SVG & vector cinematic artworks for Phase 1.
 * Guaranteed 100% uptime, zero external network fragility, instant rendering,
 * and seamless fallback protection.
 * In Phase 2, live TMDB images will take precedence, with these remaining as fallback.
 */

// Helper to create an encoded SVG data URI
function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Ultra-detailed Joker Hero Cinematic Visual (Matching Screen 1)
export const JOKER_HERO_BACKDROP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="100%" height="100%">
  <defs>
    <radialGradient id="skyGlow" cx="70%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#142c38" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#0e1b24" stop-opacity="0.8"/>
      <stop offset="85%" stop-color="#07080b" stop-opacity="1"/>
    </radialGradient>

    <radialGradient id="faceLight" cx="62%" cy="32%" r="28%">
      <stop offset="0%" stop-color="#fdfcf8" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#e2e8ea" stop-opacity="0.85"/>
      <stop offset="85%" stop-color="#8a999e" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b5e39"/>
      <stop offset="50%" stop-color="#0f3b23"/>
      <stop offset="100%" stop-color="#081e12"/>
    </linearGradient>

    <linearGradient id="suitRed" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#c92237"/>
      <stop offset="40%" stop-color="#931324"/>
      <stop offset="100%" stop-color="#4d0710"/>
    </linearGradient>

    <linearGradient id="vestYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>

    <linearGradient id="greenShirt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>

    <filter id="cinematicGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="softSmoke" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <!-- Dark Atmospheric Background -->
  <rect width="1200" height="700" fill="#07080b"/>
  <rect width="1200" height="700" fill="url(#skyGlow)"/>

  <!-- Distant Gotham City Silhouettes & Rain streaks -->
  <g opacity="0.25">
    <rect x="520" y="120" width="45" height="380" fill="#09141c"/>
    <rect x="580" y="160" width="60" height="340" fill="#0c1922"/>
    <rect x="660" y="80" width="80" height="420" fill="#081017"/>
    <rect x="760" y="140" width="55" height="360" fill="#0d1c26"/>
    <rect x="830" y="190" width="70" height="310" fill="#071017"/>
    <rect x="920" y="110" width="90" height="390" fill="#0a151e"/>

    <!-- Subtle Amber/Cyan Window Lights -->
    <circle cx="540" cy="180" r="1.5" fill="#fef08a" opacity="0.6"/>
    <circle cx="550" cy="220" r="1.5" fill="#fef08a" opacity="0.5"/>
    <circle cx="680" cy="140" r="2" fill="#38bdf8" opacity="0.7"/>
    <circle cx="780" cy="190" r="1.5" fill="#fef08a" opacity="0.6"/>
    <circle cx="950" cy="160" r="2" fill="#f43f5e" opacity="0.8"/>
  </g>

  <!-- Atmospheric Light Fog / Rim Backlight behind Arthur -->
  <ellipse cx="780" cy="300" rx="340" ry="260" fill="#38bdf8" opacity="0.08" filter="url(#cinematicGlow)"/>
  <ellipse cx="680" cy="260" rx="220" ry="180" fill="#f43f5e" opacity="0.07" filter="url(#cinematicGlow)"/>

  <!-- Character: Arthur Fleck / The Joker Profile Composition -->
  <g transform="translate(60, -10)">
    <!-- Red Suit Coat Shoulders & Torso -->
    <path d="M 520,700 L 530,510 Q 560,440 640,400 Q 720,380 800,390 Q 880,420 950,510 L 980,700 Z" fill="url(#suitRed)"/>

    <!-- Suit Coat Lapels & Shading -->
    <path d="M 640,400 Q 690,480 720,580 L 680,700 L 620,530 Z" fill="#6b0d19" opacity="0.7"/>
    <path d="M 800,390 Q 750,470 720,580 L 760,700 L 820,520 Z" fill="#4a0811" opacity="0.8"/>

    <!-- Golden Orange Vest -->
    <polygon points="670,440 770,440 750,600 690,600" fill="url(#vestYellow)"/>
    <!-- Green Patterned Shirt -->
    <polygon points="695,400 745,400 735,460 705,460" fill="url(#greenShirt)"/>

    <!-- Neck & Jaw -->
    <path d="M 690,380 Q 700,430 720,440 Q 740,430 750,380 Z" fill="#e2d9cf"/>
    <path d="M 720,380 L 740,440 L 710,440 Z" fill="#b8a898" opacity="0.6"/>

    <!-- Head / Face Silhouette -->
    <path d="M 670,270 Q 650,330 680,370 Q 720,400 770,360 Q 800,310 780,240 Q 740,190 680,210 Q 660,230 670,270 Z" fill="url(#faceLight)"/>

    <!-- Dark Green Messy / Swept-Back Hair -->
    <path d="M 650,230 Q 630,170 690,140 Q 760,120 810,160 Q 850,210 820,270 Q 790,200 730,180 Q 680,180 660,230 Z" fill="url(#hairGrad)"/>
    <path d="M 635,210 Q 620,250 645,280 Q 640,240 660,215 Z" fill="#14462b"/>
    <path d="M 800,160 Q 840,190 835,240 Q 820,200 790,175 Z" fill="#237247"/>

    <!-- White Clown Makeup Base highlight on cheek & brow -->
    <ellipse cx="715" cy="275" rx="45" ry="50" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="740" cy="265" rx="35" ry="40" fill="#f8fafc" opacity="0.85"/>

    <!-- Blue Diamond Clown Eye Makeup -->
    <!-- Left Eye Diamond -->
    <polygon points="695,230 705,250 695,270 685,250" fill="#0284c7" opacity="0.95"/>
    <circle cx="695" cy="252" r="3" fill="#082f49"/>
    <!-- Right Eye Diamond -->
    <polygon points="745,225 755,245 745,265 735,245" fill="#0284c7" opacity="0.9"/>
    <circle cx="745" cy="247" r="3" fill="#082f49"/>

    <!-- Red Painted Clown Nose -->
    <ellipse cx="718" cy="285" rx="9" ry="8" fill="#dc2626"/>
    <circle cx="716" cy="283" r="2.5" fill="#fca5a5" opacity="0.8"/>

    <!-- Distorted Bloody Red Clown Smile / Mouth -->
    <path d="M 670,305 Q 718,340 765,300 Q 745,350 690,345 Q 675,335 670,305 Z" fill="#b91c1c"/>
    <path d="M 665,298 Q 670,308 678,312" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
    <path d="M 760,295 Q 765,305 772,310" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>

    <!-- Realistic Contours / Cheek Shadow -->
    <path d="M 670,270 Q 695,300 705,330" stroke="#94a3b8" stroke-width="2" stroke-opacity="0.4" fill="none"/>
    <path d="M 760,265 Q 745,295 735,325" stroke="#94a3b8" stroke-width="2" stroke-opacity="0.3" fill="none"/>

    <!-- Cinematic Cigarette Smoke rising from Arthur -->
    <path d="M 675,340 Q 640,300 660,240 Q 680,180 640,120 Q 610,80 630,30" stroke="#e2e8f0" stroke-width="6" stroke-opacity="0.18" fill="none" filter="url(#softSmoke)"/>
    <path d="M 680,345 Q 650,290 680,220 Q 700,160 670,90" stroke="#f1f5f9" stroke-width="3" stroke-opacity="0.15" fill="none" filter="url(#softSmoke)"/>
  </g>

  <!-- Cinematic Vignette & Gradients blending into dark UI -->
  <rect width="600" height="700" fill="url(#skyGlow)" opacity="0.95"/>
  <linearGradient id="fadeToLeft" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#07080b" stop-opacity="1"/>
    <stop offset="35%" stop-color="#07080b" stop-opacity="0.92"/>
    <stop offset="65%" stop-color="#07080b" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#07080b" stop-opacity="0"/>
  </linearGradient>
  <rect width="1200" height="700" fill="url(#fadeToLeft)"/>

  <linearGradient id="fadeToBottom" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="transparent"/>
    <stop offset="70%" stop-color="rgba(7, 8, 11, 0.4)"/>
    <stop offset="100%" stop-color="#07080b"/>
  </linearGradient>
  <rect width="1200" height="700" fill="url(#fadeToBottom)"/>
</svg>
`);

// 2. High-Fidelity Inception Backdrop (Dream streets / Cobb silhouette in rain)
export const INCEPTION_BACKDROP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650" width="100%" height="100%">
  <defs>
    <linearGradient id="incSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b1320"/>
      <stop offset="50%" stop-color="#15263f"/>
      <stop offset="100%" stop-color="#07080b"/>
    </linearGradient>
    <linearGradient id="wetStreet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="60%" stop-color="#141d2e"/>
      <stop offset="100%" stop-color="#07080b"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="650" fill="url(#incSky)"/>

  <!-- Folding Paris Cityscape Silhouette in the Sky (Iconic Inception scene) -->
  <g opacity="0.35">
    <path d="M 200,320 L 250,150 L 320,120 L 390,200 L 450,90 L 520,240 L 600,60 L 680,180 L 780,110 L 850,220 L 950,140 L 1050,320 Z" fill="#0a101d"/>
    <!-- Folded inverted buildings curving overhead -->
    <path d="M 300,0 L 350,110 L 480,80 L 580,130 L 650,40 L 760,110 L 880,20 L 980,0 Z" fill="#080d17" opacity="0.8"/>
  </g>

  <!-- Wet Street with Amber & Cyan Reflections -->
  <polygon points="0,650 1200,650 780,360 420,360" fill="url(#wetStreet)"/>
  <ellipse cx="600" cy="500" rx="160" ry="15" fill="#38bdf8" opacity="0.15"/>
  <ellipse cx="560" cy="460" rx="90" ry="8" fill="#f59e0b" opacity="0.2"/>

  <!-- Dom Cobb Silhouette Walking with Briefcase -->
  <g transform="translate(565, 340)">
    <!-- Head -->
    <circle cx="20" cy="20" r="10" fill="#030712"/>
    <!-- Trenchcoat Body -->
    <path d="M 8,30 L 32,30 L 38,95 L 2,95 Z" fill="#050a14"/>
    <!-- Legs -->
    <rect x="7" y="95" width="8" height="50" fill="#030712"/>
    <rect x="23" y="95" width="8" height="48" fill="#030712"/>
    <!-- Briefcase in hand -->
    <rect x="36" y="65" width="12" height="18" rx="2" fill="#020408"/>
    <!-- Shadow on wet asphalt -->
    <ellipse cx="20" cy="148" rx="25" ry="6" fill="#000000" opacity="0.7"/>
  </g>

  <!-- Rain Streaks -->
  <g stroke="#ffffff" stroke-opacity="0.08" stroke-width="1">
    <line x1="100" y1="50" x2="80" y2="180"/>
    <line x1="300" y1="20" x2="280" y2="220"/>
    <line x1="550" y1="70" x2="530" y2="290"/>
    <line x1="720" y1="40" x2="700" y2="250"/>
    <line x1="900" y1="80" x2="880" y2="270"/>
  </g>

  <!-- Vignette -->
  <linearGradient id="incFade" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="transparent"/>
    <stop offset="75%" stop-color="rgba(7, 8, 11, 0.4)"/>
    <stop offset="100%" stop-color="#07080b"/>
  </linearGradient>
  <rect width="1200" height="650" fill="url(#incFade)"/>
</svg>
`);

// 3. Ultra-detailed Neutral Cinematic Film Projection Backdrop
export const DEFAULT_CINEMATIC_HERO_BACKDROP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="beamGlow" cx="80%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#0f172a" stop-opacity="0.85"/>
      <stop offset="70%" stop-color="#07080b" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#07080b" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="projectorLight" x1="100%" y1="15%" x2="45%" y2="85%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="25%" stop-color="#94a3b8" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="stageGlow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff2a5f" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="transparent" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1600" height="900" fill="url(#beamGlow)"/>

  <!-- Dramatic Cinematic Projection Beam -->
  <polygon points="1600,80 1600,280 650,900 350,900" fill="url(#projectorLight)"/>

  <!-- Distant Cinema Architecture & Screen Silhouette -->
  <g opacity="0.3">
    <rect x="750" y="160" width="600" height="340" rx="8" fill="#020617" stroke="#334155" stroke-width="2"/>
    <path d="M 680,680 L 1420,680 L 1550,900 L 550,900 Z" fill="#050811"/>
  </g>

  <!-- Ambient Cinematic Stage Glow -->
  <rect width="1600" height="900" fill="url(#stageGlow)"/>
</svg>
`);

// 4. Default resilient cast and user avatar
export const DEFAULT_AVATAR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a3042"/>
      <stop offset="100%" stop-color="#121520"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#avatarBg)"/>
  <circle cx="50" cy="38" r="18" fill="#64748b"/>
  <path d="M 20,88 Q 22,64 50,64 Q 78,64 80,88 Z" fill="#475569"/>
</svg>
`);

export function generateThematicPoster(title: string, year: number, genre: string, themeColor: string = '#ff2a5f'): string {
  const initials = title.split(' ').map(w => w[0]).slice(0, 2).join('');
  
  return svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="50%" stop-color="#0d1019"/>
      <stop offset="100%" stop-color="#06070a"/>
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${themeColor}" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="${themeColor}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="400" height="600" fill="url(#cardGrad)"/>
  <circle cx="200" cy="240" r="180" fill="url(#centerGlow)"/>

  <!-- Geometric Cinematic Film Lines -->
  <g stroke="rgba(255,255,255,0.06)" stroke-width="1.5">
    <line x1="40" y1="40" x2="360" y2="40"/>
    <line x1="40" y1="560" x2="360" y2="560"/>
    <circle cx="200" cy="240" r="110" fill="none"/>
    <circle cx="200" cy="240" r="70" fill="none" stroke-dasharray="4,4"/>
  </g>

  <!-- Big Stylized Initials / Iconography -->
  <text x="200" y="275" font-family="'Outfit', sans-serif" font-size="82" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4" opacity="0.9">
    ${initials}
  </text>

  <!-- Top Brand Tag -->
  <text x="200" y="70" font-family="'Outfit', sans-serif" font-size="12" font-weight="800" fill="${themeColor}" text-anchor="middle" letter-spacing="3">
    CINEVERSE SELECTION
  </text>

  <!-- Bottom Title Block -->
  <rect x="30" y="440" width="340" height="100" fill="rgba(7, 8, 11, 0.85)" rx="14" stroke="rgba(255,255,255,0.08)"/>
  <text x="200" y="480" font-family="'Outfit', sans-serif" font-size="20" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    ${title.length > 22 ? title.slice(0, 20) + '...' : title}
  </text>
  <text x="200" y="510" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">
    ${year} · ${genre}
  </text>
</svg>
`);
}
