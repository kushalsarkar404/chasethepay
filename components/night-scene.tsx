export function NightScene() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Night sky gradient */}
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#060810" />
            <stop offset="40%" stopColor="#0a0e1a" />
            <stop offset="100%" stopColor="#0d1220" />
          </linearGradient>

          {/* Moon glow */}
          <radialGradient id="moonGlow">
            <stop offset="0%" stopColor="#f8f4eb" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#e8e0d0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c4b8a0" stopOpacity="0" />
          </radialGradient>

          {/* Soft halo around moon */}
          <radialGradient id="moonHalo">
            <stop offset="0%" stopColor="#f8f4eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f8f4eb" stopOpacity="0" />
          </radialGradient>

          {/* Mountain gradients (silhouettes) */}
          <linearGradient id="mtFar" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0d1525" />
            <stop offset="100%" stopColor="#141c2e" />
          </linearGradient>
          <linearGradient id="mtMid" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0a1018" />
            <stop offset="100%" stopColor="#0f1622" />
          </linearGradient>
          <linearGradient id="mtNear" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#060810" />
            <stop offset="100%" stopColor="#0a0e16" />
          </linearGradient>

          {/* Wind strokes - translucent */}
          <linearGradient id="windStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8f4eb" stopOpacity="0" />
            <stop offset="30%" stopColor="#f8f4eb" stopOpacity="0.06" />
            <stop offset="70%" stopColor="#f8f4eb" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#f8f4eb" stopOpacity="0" />
          </linearGradient>

          {/* River - dark water with moon reflection */}
          <linearGradient id="river" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a0e18" />
            <stop offset="40%" stopColor="#0d1222" />
            <stop offset="60%" stopColor="#141a2e" />
            <stop offset="100%" stopColor="#0a0e18" />
          </linearGradient>
          <linearGradient id="riverReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8f4eb" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f8f4eb" stopOpacity="0" />
          </linearGradient>

          {/* Trees - dark silhouette */}
          <linearGradient id="tree" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#050810" />
            <stop offset="100%" stopColor="#0c121c" />
          </linearGradient>
        </defs>

        {/* Background sky */}
        <rect width="100%" height="100%" fill="url(#sky)" />

        {/* Stars - subtle */}
        <g fill="#f8f4eb" fillOpacity="0.15">
          <circle cx="120" cy="80" r="1" />
          <circle cx="320" cy="120" r="0.8" />
          <circle cx="580" cy="60" r="1.2" />
          <circle cx="720" cy="140" r="0.6" />
          <circle cx="920" cy="90" r="1" />
          <circle cx="200" cy="200" r="0.5" />
          <circle cx="450" cy="180" r="0.7" />
        </g>

        {/* Moon */}
        <circle cx="880" cy="140" r="65" fill="url(#moonHalo)" className="night-moon-glow" />
        <circle cx="880" cy="140" r="32" fill="url(#moonGlow)" />

        {/* Wind lines - horizontal gentle motion */}
        <g stroke="url(#windStroke)" strokeWidth="0.5" fill="none" className="night-wind">
          <path d="M0 280 Q200 270 400 278 T800 282 T1200 275" />
          <path d="M0 320 Q150 312 350 318 T750 322 T1200 315" />
          <path d="M0 380 Q180 372 380 378 T780 382 T1200 375" />
        </g>
        <g stroke="url(#windStroke)" strokeWidth="0.4" fill="none" className="night-wind-delayed">
          <path d="M0 260 Q250 252 500 258 T1000 262 T1200 255" />
          <path d="M0 340 Q220 332 440 338 T880 342 T1200 335" />
        </g>

        {/* Birds - minimal V shapes */}
        <g fill="none" stroke="#f8f4eb" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" className="night-birds">
          <path d="M180 220 L185 215 L190 220" />
          <path d="M195 225 L200 220 L205 225" />
        </g>
        <g fill="none" stroke="#f8f4eb" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" className="night-birds-slow">
          <path d="M520 180 L528 172 L536 180" />
        </g>
        <g fill="none" stroke="#f8f4eb" strokeOpacity="0.18" strokeWidth="1" strokeLinecap="round" className="night-birds-slower">
          <path d="M750 260 L758 252 L766 260" />
        </g>

        {/* Mountains - far layer */}
        <path
          fill="url(#mtFar)"
          d="M-50 800 L200 420 L400 520 L600 380 L800 480 L1000 350 L1400 550 L1450 800 Z"
        />

        {/* River - winding through valley */}
        <path
          fill="url(#river)"
          d="M0 520 Q200 500 400 540 T800 520 T1200 560 L1200 800 L0 800 Z"
        />
        <path
          fill="url(#riverReflection)"
          d="M0 530 Q250 510 500 545 Q700 565 900 535 L950 550 Q750 575 500 555 Q250 535 0 545 Z"
        />

        {/* Mountains - mid layer */}
        <path
          fill="url(#mtMid)"
          d="M-30 800 L150 500 L350 620 L550 480 L750 580 L950 450 L1150 600 L1300 800 Z"
        />
        {/* Mountains - near layer */}
        <path
          fill="url(#mtNear)"
          d="M-20 800 L100 600 L300 720 L500 580 L700 680 L900 550 L1100 700 L1250 800 Z"
        />

        {/* Trees - minimal pine silhouettes */}
        <g fill="url(#tree)">
          <path d="M80 720 L95 620 L110 720 Z" />
          <path d="M130 740 L142 660 L154 740 Z" />
          <path d="M250 700 L268 600 L286 700 Z" />
          <path d="M320 730 L332 670 L344 730 Z" />
          <path d="M420 690 L440 580 L460 690 Z" />
          <path d="M520 710 L535 640 L550 710 Z" />
          <path d="M680 700 L698 610 L716 700 Z" />
          <path d="M780 730 L792 670 L804 730 Z" />
          <path d="M920 690 L940 590 L960 690 Z" />
          <path d="M1020 720 L1035 650 L1050 720 Z" />
          <path d="M1120 740 L1132 680 L1144 740 Z" />
          <path d="M160 750 L168 700 L176 750 Z" />
          <path d="M600 720 L612 660 L624 720 Z" />
          <path d="M860 710 L872 650 L884 710 Z" />
        </g>
      </svg>
    </div>
  );
}
