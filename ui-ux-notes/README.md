# UI/UX Notes

- **Theme**: Retro-warm gradient background, soft cards, rounded pills. Mark colors: X (`var(--mark-x)`) warm coral, O (`var(--mark-o)`) cool blue.
- **Board clarity**: Claimed mini-boards glow with X/O tint and overlay mark; constrained targets dim via lock state; win lines highlighted.
- **Accessibility**: Keyboard-focusable buttons for cells; screen-reader labels per cell/board; high-contrast toggle; readable fonts.
- **Audio**: Corner sound toggle (On/Off) controls looping `/audio/lofi.mp3`.
- **Layouts**: Mobile-first stacking; two-column on wide screens; board widths capped to avoid overlap; winner overlays centered with confetti.
- **Onboarding**: Intro screen selects board/mode; rule cards show mini-board visuals with X/O; CTA buttons styled as pills.

## Future polish

- Add subtle animations on move placement and mini-board claims.
- Provide in-app “How to play” modal during matches.
- Offer palette switcher (mute or neon) and sound volume control.
- Add haptic feedback on mobile (where supported).
