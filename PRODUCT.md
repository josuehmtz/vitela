# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hosts.** Couples planning a wedding and families planning a XV años in Mexico. They buy, design and send their own invitation, manage the guest list, and plan seating. Most aren't technical and do this alongside a lot of other planning, so Vitela should feel like one less thing to worry about ("menos pendientes"). Future design decisions serve them first.

**Guests.** The people who get an invitation by link or WhatsApp and open it on their phone, often older relatives. They confirm attendance (RSVP) and show their QR at the door. They install nothing and have no account.

**Hostess (event-day staff).** Scans QR codes at the entrance on a phone, sometimes with poor or no signal. The venue or the host can create this role.

**Venues (secondary channel).** Venues (salones) with an active agreement (convenio). Their staff can create events on any plan while the agreement is active, edit them fully, and invite the host with a single-use link (`/app/unirse/:token`).

**Admin.** Vitela operators, identified by email in server config.

## Product Purpose

Vitela turns an event invitation into the whole guest flow: a beautiful digital invitation, RSVP, a personal QR pass for each invitation, a seating plan, and door check-in on the day. Success means the host sends the invitation, guests confirm without friction, and entry on the day runs smoothly with no paper lists or confusion at the door.

## Positioning

**Everything included, one payment.** Each event is a single payment, priced by its total number of passes. Every package includes RSVP, QR entry, the hostess scanner and the seating plan. Other Mexican invitation studios (roughly 390–2,240 MXN) keep those for their top tiers. There are no monthly fees, and an upgrade only charges the difference.

## Operating Context

- The language is Spanish (es-MX) and prices are in MXN. Event types: Boda, XV años, Otro.
- Hosts work in the panel (`/app`): event, design (templates Clásica, Jardín and Moderna, adapted to the host's colors and photos), invitations and passes, seating plan, staff access, and billing.
- Invitations go out mostly by WhatsApp. Guests open `/i/:token` on mobile, so this page has to stay light and fast.
- On the event day the hostess uses `/staff` on a phone. It falls back to an offline guest-list snapshot and queues check-ins to sync later. There is also a printable door list at `/app/events/:id/lista`. The hostess must open their link with signal before the event.
- Payment goes through Stripe (currently in test mode). Venues pay Vitela offline under their agreement.

## Capabilities and Constraints

- **Payment rule:** hosts can design for free (create the event, choose a template, customize it and preview it). Payment unlocks sending invitations, guests, seating and staff. Until then the event is a draft marked "pago pendiente". Each client can have at most one unpaid event.
- Packages by total passes: 100 / 250 / 500 passes for 890 / 1,490 / 2,190 MXN.
- Photos: one cover photo plus a gallery of up to 8, stored on Cloudflare R2.
- Light and dark themes follow the system setting, with a manual toggle.
- Only free tools, libraries and hosting tiers for now. Stripe's commission is the one accepted cost.
- Repos are public, so no secrets or admin emails go into the code.

## Brand Commitments

- Name: **Vitela** (chosen 2026-11-23; replaces "Lacre"). Vitela is fine vellum. Another Mexican invitation service, lacreinvitaciones.mx, already uses the name Lacre and an almost identical look (cream, Cormorant Garamond, wine-colored wax seal, envelopes, gold, "un solo pago"). Vitela must stay clearly apart from it: no envelopes and no seal-as-decoration. Its own identity is the Mexican lotería card. Official logo files (supplied by the owner, 2026-11-24) live in `public/brand/`: the lotería card logo (color and mono) and the seal (color and mono); the seal inside the logo is the owner's choice and the only seal in the brand.
- Visual direction pinned by the user (2026-11-23): **"Lotería de gala"**, Mexican lotería executed as luxury stationery. Ivory paper (#F5EFE4) with cotton grain and a night mode (#1A1614), champagne-gold foil frames (#C9A45C), desaturated collector inks (carmín #A3262A, azul tinta #1F3A6B, verde botella #2F5D46, mostaza #D9A62E), the carmín primary button in both modes, and cards that look the same in both modes. Features map to numbered cards, the story is "carta por carta" and the close is "¡Lotería!".
- Repos, the Netlify site (lacremx.netlify.app), the Cloud Run service and the contact email still carry the old name; renaming them is a separate decision.
- Voice: warm, celebratory and reassuring, speaking to the host as "tú" in Mexican Spanish ("Tus invitados no descargan nada", "Un solo pago, sin mensualidades").

## Evidence on Hand

- Real pricing comes from the API (plans and market prices). There are no real customers, testimonials, case studies or press yet, so none may be invented. Sample content such as "Familia Pérez confirmó" is illustrative only.
- Contact: `CONTACT_EMAIL` in `src/lib/site.ts`. The privacy notice is at `/privacidad`.

## Product Principles

1. **The host sees the whole picture.** One payment and one panel take them from the invitation to the dance floor. Never hide a core capability behind a higher tier.
2. **Zero friction for guests.** No downloads, no accounts, fast on any phone and readable for older relatives.
3. **The door has to work.** Event-day tools must hold up without signal and be clear to staff who have never used them before.
4. **Honest about money.** Prices, what's included and when payment is required are always stated plainly, with no surprises.
5. **The invitation is a keepsake.** The guest-facing piece has to feel as special as the event.

## Accessibility & Inclusion

Guests span all ages and phones, including older relatives on small or low-end devices with weak connections. The public invitation and RSVP must stay legible, high-contrast and easy to tap in both themes. No formal standard has been set; WCAG 2.1 AA is the working baseline.
