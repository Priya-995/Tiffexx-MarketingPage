/*
 * Inline SVG pieces that are NOT part of the supplied artwork:
 * the speed-line bursts and the thin golden swirls.
 * (Cloud, stars, eyes, smiley and headline come from the artwork PNGs.)
 */

/*
 * Googly eyes. Pupils are separate groups (.tfx-pupil) so Story.jsx can slide them
 * inside the whites to follow the cursor. The pupil circles are drawn at their resting
 * (slightly off-centre) position; the group's x/y is an offset from that rest position.
 */
export const Eyes = (props) => (
  <svg viewBox="0 0 200 120" aria-hidden="true" overflow="visible" {...props}>
    <ellipse className="tfx-eye" cx="55" cy="58" rx="48" ry="52" fill="var(--tfx-cream)" stroke="var(--tfx-ink)" strokeWidth="7" />
    <ellipse className="tfx-eye" cx="143" cy="68" rx="42" ry="46" fill="var(--tfx-cream)" stroke="var(--tfx-ink)" strokeWidth="7" />
    <g className="tfx-pupil">
      <circle cx="64" cy="58" r="21" fill="var(--tfx-ink)" />
      <circle cx="71" cy="50" r="5.5" fill="var(--tfx-cream)" />
    </g>
    <g className="tfx-pupil">
      <circle cx="150" cy="70" r="19" fill="var(--tfx-ink)" />
      <circle cx="156" cy="62.5" r="5" fill="var(--tfx-cream)" />
    </g>
  </svg>
)

/* thin golden swirls behind everything (stretched to the hero on purpose) */
export const Curves = (props) => (
  <svg viewBox="0 0 1536 1024" preserveAspectRatio="none" aria-hidden="true" {...props}>
    <g fill="none" stroke="var(--tfx-swirl)" strokeWidth="2" vectorEffect="non-scaling-stroke">
      {[
        'M978 108 C973 150 979 176 990 196',
        'M1332 296 C1410 268 1500 190 1536 150',
        'M1336 296 C1420 266 1500 286 1536 278',
        'M1380 560 C1430 520 1490 506 1536 500',
        'M830 1004 C950 950 1100 962 1200 976 C1350 992 1450 952 1536 902',
        'M0 626 C100 662 250 660 400 702 C392 792 342 850 290 884',
        'M0 818 C150 790 280 760 360 790 C440 830 480 872 520 904',
      ].map((d) => (
        <path key={d} d={d} pathLength="1" strokeDasharray="1" className="tfx-curve" />
      ))}
    </g>
  </svg>
)