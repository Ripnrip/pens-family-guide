# Store listing: PENS

Copy for the ChatGPT app directory (and the Claude connector listing). The machine-readable version is [`chatgpt-app-submission.json`](chatgpt-app-submission.json); keep the two in step.

## Identity

| Field | Value |
|---|---|
| Display name | PENS |
| Full name | Pediatric Epilepsy & Neurology Specialists |
| Subtitle (max 30 characters) | Pediatric neurology, Tampa Bay |
| Category | EDUCATION (closest valid option; the form has no health category) |
| Operator | BinaryBros LLC, on behalf of Pediatric Epilepsy & Neurology Specialists |
| Support | noeticactivity@gmail.com |
| Clinic contact | 508 S. Habana Ave., Suite 340, Tampa, FL 33609 · (813) 873-7367 · https://www.pensoftampabay.com/ |
| Clinic hours | Mon–Thu 7:30 AM–5:00 PM · Fri 7:30 AM–4:30 PM |
| Privacy policy | `https://<host>/privacy` |
| Terms | `https://<host>/terms` |
| Support page | `https://<host>/support` |
| Reviewer demo | `https://<host>/reviewer-demo` |
| MCP URL for submission | `https://<host>/mcp/submission-d661e169` |
| Icon | `public/assets/pens-logo-512.png` and `pens-logo-1024.png` (placeholder until the official PENS logo is dropped in) |

## Short description

Pediatric neurology answers for Tampa Bay families from Pediatric Epilepsy & Neurology Specialists, in English and Spanish.

## Long description

PENS brings Pediatric Epilepsy & Neurology Specialists (Tampa, FL) into your chat, in English and Spanish:

- Office hours, an open-now status, directions and a one-tap call button
- Match a concern (staring spells, headaches, attention) to PENS services and the next step
- Visit and EEG prep checklists, with a kid version
- "My EEG Day", an interactive story for children ages 4–10 with Pip, the PENS helper
- Seizure first aid (Stay / Safe / Side) with a large seizure timer
- Florida school seizure action plans (CS/HB 1201) and how to request one from PENS
- A 5-question caregiver quiz
- Appointment and referral hand-offs to the official PENS channels

General education only. PENS does not diagnose, interpret results or give dosing advice, and it collects no personal or health information. In an emergency, call 911.

PENS is operated by BinaryBros LLC on behalf of Pediatric Epilepsy & Neurology Specialists.

## Spanish summary

PENS acerca a Pediatric Epilepsy & Neurology Specialists (Tampa, FL) a su chat, en inglés y español: horario y dirección, servicios, preparación para visitas y EEG, el cuento "Mi día de EEG" con Pip, primeros auxilios para convulsiones con cronómetro, planes escolares de Florida, un quiz y enlaces oficiales para citas y referidos. Solo información educativa; no recopila datos personales ni de salud. En una emergencia, llame al 911.

## Example prompts

1. What are PENS's office hours and where is the office?
2. My daughter has staring spells at school. Can PENS help?
3. Show my 6-year-old what happens during an EEG.
4. What should I do if my child has a seizure?
5. Hazme un quiz sobre primeros auxilios para convulsiones.

The full list with expected results is on `/reviewer-demo`.

## Tool annotations

All nine tools: `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`, `openWorldHint: false`. Each tool returns curated, bundled content, writes nothing and calls no external service. Per-tool justifications are in the submission file.

## Screenshots

Capture from a connected ChatGPT and Claude session, or from `/preview/<widget>` (EN and ES, light and dark): `clinic-card`, `eeg-adventure`, `seizure-first-aid`, `caregiver-quiz`, `visit-prep`.
