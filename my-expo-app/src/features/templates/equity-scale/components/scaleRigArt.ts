import { artStyle } from '../../../../../theme/artStyle';

/**
 * Inked vector build of the vintage balance scale in
 * docs/moodboard/equity-scale/scale-tilt-frames-empty.jpg, traced off the
 * balanced frame so the arm bow, plate ellipse, and column proportions match.
 *
 * Three layers, because the wooden column has to sit in front of the brass
 * beam while the lyre stays behind it:
 *
 *   lyre  ->  beam (arms, end posts, plates, payload)  ->  stand
 *
 * All three are anchored on the pivot screw. `SCALE_RIG` places their boxes so
 * the pivot lands on the same scene point in each, which also makes the beam
 * box centre the rotation origin.
 */

const ink = artStyle.colors.projectorBlack;
const brass = artStyle.colors.gold;
const brassLight = artStyle.colors.goldBright;
const brassPale = artStyle.colors.cream;
const wood = artStyle.colors.tobacco;

/** Cel-shading steps mixed off `gold` and `tobacco` — flat paint, never gradients. */
const brassDeep = '#8A6526';
const woodLight = '#8E6942';
const woodTop = '#9A7448';
const woodDeep = '#4F351F';

export const SCALE_RIG = {
  scene: 390,
  /** Lyre and stand share this box; the pivot screw sits at (155, 128) inside it. */
  frame: { left: 40, top: 70, width: 330, height: 260 },
  /** Box centre (180, 60) is the pivot, so a plain rotation tilts the beam. */
  beam: { left: 15, top: 138, width: 360, height: 120 },
  /** Plate boxes, placed inside the beam box directly on top of the end posts. */
  plate: { width: 128, height: 56, top: -9, leftOffset: 4, rightOffset: 228 },
  /** Y inside a plate box where payload rests on the dish floor. */
  plateFloorY: 26,
} as const;

/** Brass lyre above the pivot. Behind the beam, so it reads as fixed to the stand. */
export const LYRE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 260">
  <g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M155,100 L155,26" stroke-width="7"/>
    <path d="M149,101 C141,91 139.5,80 139.5,68 C139.5,54 149,44 151,37 C152.5,31 150,27 147,24" stroke-width="7.5"/>
    <path d="M161,101 C169,91 170.5,80 170.5,68 C170.5,54 161,44 159,37 C157.5,31 160,27 163,24" stroke-width="7.5"/>
  </g>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M149,101 C141,91 139.5,80 139.5,68 C139.5,54 149,44 151,37 C152.5,31 150,27 147,24" stroke="${brass}" stroke-width="4"/>
    <path d="M161,101 C169,91 170.5,80 170.5,68 C170.5,54 161,44 159,37 C157.5,31 160,27 163,24" stroke="${brass}" stroke-width="4"/>
    <path d="M148,99.5 C140.2,89.8 138.4,79.5 138.4,68 C138.4,54.5 147.8,44.5 149.8,38" stroke="${brassLight}" stroke-width="1.5"/>
    <path d="M162,99.5 C169.8,89.8 171.6,79.5 171.6,68 C171.6,54.5 162.2,44.5 160.2,38" stroke="${brassDeep}" stroke-width="1.6"/>
    <path d="M155,100 L155,26" stroke="${brass}" stroke-width="3.6"/>
    <path d="M153.9,96 L153.9,30" stroke="${brassLight}" stroke-width="1.3"/>
  </g>
  <path d="M147,94 L163,94 L168,103 L169,116 L141,116 L142,103 Z"
    fill="${brass}" stroke="${ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M147,94 L152,94 L147,103 L146,116 L141,116 L142,103 Z" fill="${brassLight}"/>
  <path d="M140,26 C138.5,15 144,10.5 155,10.5 C166,10.5 171.5,15 170,26 Z"
    fill="${brass}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M142.2,26 C141,16.5 145,12.4 151,11 L152.4,15 L148.4,26 Z" fill="${brassLight}"/>
  <circle cx="150.5" cy="17" r="1.4" fill="${ink}" opacity="0.55"/>
  <circle cx="159.5" cy="17" r="1.4" fill="${ink}" opacity="0.55"/>
</svg>`;

/** Wooden plinth, arched column, pivot screw. In front of the beam. */
export const STAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 260">
  <path d="M24,196 L286,196 L312,176 L50,176 Z"
    fill="${woodTop}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="${ink}" stroke-width="1.6" opacity="0.15" fill="none" stroke-linecap="round">
    <path d="M46,189 L278,189"/>
    <path d="M66,182 L256,182"/>
  </g>
  <path d="M286,196 L312,176 L312,198 L286,222 Z"
    fill="${woodDeep}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>

  <path d="M179,138 L196,168 L179,168 Z"
    fill="${woodDeep}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M134,124 A21,21 0 0 1 176,124 L181,146 L181,172 L129,172 L129,146 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M138.5,152 L138.5,124 A16.5,16.5 0 0 1 171.5,124 L171.5,152"
    fill="none" stroke="${ink}" stroke-width="1.8" opacity="0.32"/>
  <path d="M131.5,170 L131.5,147 C132,138 133.5,131 138,125.5 C141,121.5 145,118 150,115.5"
    fill="none" stroke="${woodLight}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M178.5,170 L178.5,147 C178,138 176.5,131 172,125.5 C169,121.5 165,118 160,115.5"
    fill="none" stroke="${woodDeep}" stroke-width="3.4" stroke-linecap="round" opacity="0.8"/>
  <g stroke="${ink}" stroke-width="1.5" opacity="0.2" fill="none" stroke-linecap="round">
    <path d="M147,168 C145,158 148,152 146,146"/>
    <path d="M165,168 C167,158 164,152 166,148"/>
  </g>
  <path d="M126,168 L184,168 L184,178 L126,178 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M128,169.6 L182,169.6 L182,172.6 L128,172.6 Z" fill="${woodLight}"/>
  <path d="M121,177 L189,177 L189,188 L121,188 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M123,178.6 L187,178.6 L187,182 L123,182 Z" fill="${woodLight}"/>

  <circle cx="155" cy="128" r="12" fill="${brassLight}" stroke="${ink}" stroke-width="2.8"/>
  <path d="M155,140 A12,12 0 0 0 167,128" fill="none" stroke="${brassDeep}" stroke-width="3"/>
  <circle cx="155" cy="128" r="7" fill="${brass}" stroke="${ink}" stroke-width="2"/>
  <path d="M151,132 L159,124" stroke="${ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M148.6,125 A9,9 0 0 1 152,121.6" fill="none" stroke="${brassPale}" stroke-width="1.8" stroke-linecap="round"/>

  <path d="M24,196 L286,196 L286,222 L24,222 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M25.6,197.6 L284.4,197.6 L284.4,202 L25.6,202 Z" fill="${woodLight}"/>
  <g stroke="${ink}" stroke-width="1.6" opacity="0.2" fill="none" stroke-linecap="round">
    <path d="M44,210 L140,209"/>
    <path d="M176,216 L262,215"/>
    <path d="M62,217 L110,216.5"/>
  </g>
  <path d="M286,222 L312,198 L312,212 L286,236 Z"
    fill="${woodDeep}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M18,222 L286,222 L286,236 L18,236 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M19.6,223.4 L284.4,223.4 L284.4,227 L19.6,227 Z" fill="${woodLight}"/>
  <path d="M34,234 C31,248 38,253 46,253 C54,253 61,248 58,234 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M252,234 C249,248 256,253 264,253 C272,253 279,248 276,234 Z"
    fill="${wood}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

/** Brass beam: one continuous ribbon post to post, its centre hump hidden by the column. */
export const BEAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 120">
  <path d="M68,46.5 L77,50 C92,57 110,63 126,64 C136,64.5 143,63.5 151,58.5 C161,52 171,44 180,44 C189,44 199,52 209,58.5 C217,63.5 224,64.5 234,64 C250,63 268,57 283,50 L292,46.5"
    fill="none" stroke="${ink}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M68,46.5 L77,50 C92,57 110,63 126,64 C136,64.5 143,63.5 151,58.5 C161,52 171,44 180,44 C189,44 199,52 209,58.5 C217,63.5 224,64.5 234,64 C250,63 268,57 283,50 L292,46.5"
    fill="none" stroke="${brass}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="none" stroke="${brassDeep}" stroke-width="3" stroke-linecap="round">
    <path d="M148,62 C140,67.5 134,68.5 125,68 C109,67 92,61 78,54.5"/>
    <path d="M212,62 C220,67.5 226,68.5 235,68 C251,67 268,61 282,54.5"/>
  </g>
  <path d="M68,42 L76.5,45.5 C91,52.5 110,59 126,60 C137,60.5 145,59 154,54 C163,47.5 172,40 180,40 C188,40 197,47.5 206,54 C215,59 223,60.5 234,60 C250,59 269,52.5 283.5,45.5 L292,42"
    fill="none" stroke="${brassLight}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <rect x="58" y="34" width="20" height="25" rx="4" fill="${brass}" stroke="${ink}" stroke-width="3"/>
  <path d="M61.5,37.5 L66,37.5 L66,55.5 L61.5,55.5 Z" fill="${brassLight}"/>
  <rect x="282" y="34" width="20" height="25" rx="4" fill="${brass}" stroke="${ink}" stroke-width="3"/>
  <path d="M285.5,37.5 L290,37.5 L290,55.5 L285.5,55.5 Z" fill="${brassLight}"/>
</svg>`;

/** Shallow brass dish. No chain and no cradle: it just rests on the beam's end post. */
export const PLATE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 56">
  <path d="M2,20 A62,17 0 0 1 126,20 C126,38 99,49 64,49 C29,49 2,38 2,20 Z"
    fill="${brass}" stroke="${ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M3,23 C6,36 30,44.5 64,44.5 C98,44.5 122,36 125,23 C122,34 98,41 64,41 C30,41 6,34 3,23 Z"
    fill="${brassLight}" opacity="0.5"/>
  <path d="M5,30 C13,43 35,48.5 64,48.5 C93,48.5 115,43 123,30 C115,38 93,44 64,44 C35,44 13,38 5,30 Z"
    fill="${brassDeep}"/>
  <ellipse cx="64" cy="20" rx="62" ry="17" fill="${brassLight}" stroke="${ink}" stroke-width="3"/>
  <ellipse cx="64" cy="22.5" rx="54" ry="12.5" fill="${brass}" stroke="${ink}" stroke-width="2.2"/>
  <path d="M80,13 L102,16.5 L98,25 L76,21 Z" fill="${brassLight}"/>
  <path d="M82,7 L102,10 L101,13.5 L81,10.5 Z" fill="${brassPale}"/>
</svg>`;
