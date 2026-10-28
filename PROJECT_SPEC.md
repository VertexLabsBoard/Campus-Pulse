# Campus Pulse — Project Specification

> Single source of truth for the project. Every AI coding session should read this file first.
> If code and this file disagree, stop and resolve the conflict explicitly. Do not silently drift.

---

## 1. Vision

**Product promise:** Report a campus problem in under 30 seconds, see what happens next, and give campus staff a clear, prioritized queue of work, with full accountability.

**Core journey (everything serves this):**
1. A student scans a QR code on a room or asset (e.g. a projector) and the location is pre-filled.
2. They see known open issues for that spot and can tap "I'm affected too" instead of filing a duplicate.
3. If it's new, they submit a report (category, description, optional photo, severity).
4. The system calculates an explainable priority and suggests a department.
5. Staff verify, assign, work on it, and mark it resolved with proof.
6. The student is notified and confirms "Is it fixed?" (No reopens it).
7. Every step is recorded; metrics update from real data.

**Not an emergency system.** Fire, medical, and security incidents go to campus security. This must be shown on the report form.

**Target:** a real product a college can pilot and adopt, not a demo. No deadline pressure, but pilot early (after Phase 2) with real users.

---

## 2. Users and roles

| Role | Can do |
|---|---|
| **Student** | Sign in with college account, report issues, view own reports, support ("affected too") existing issues, comment, receive notifications, confirm or reopen after resolution, rate resolution |
| **Department Staff** | See issues assigned to their department, mobile "My Jobs" view, update progress, upload before/after photos, mark resolved |
| **Admin** | See everything, verify/reject, mark duplicates, assign, override priority (reason required), manage locations/assets/departments/users/SLAs, view analytics, export reports |

Authorization is enforced **on the server for every protected endpoint**. The frontend hiding a button is never security.

---

## 3. Scope by phase

### Phase 1 — Foundation
- Repo, environments, CI, deployment pipeline, health check
- Database schema + migrations
- Authentication with college email sign-in (Google or Microsoft SSO; fall back to email + password only if SSO is unavailable)
- Roles and permissions
- Audit log infrastructure
- Test setup (unit, integration, end-to-end)

### Phase 2 — Core loop (PILOT after this phase, one building)
- Buildings → Floors → Rooms hierarchy; seed data
- QR code generation per location (printable sheet)
- Report form (mobile-first), photo upload with limits
- "Known issues here" screen on QR scan with "I'm affected too"
- Student dashboard: my reports, status, comments
- Staff/admin queue: filter, verify/reject, assign, status changes with valid transitions
- Status history and audit log
- In-app notifications
- Resolution confirmation ("Is it fixed?") + reopen
- Rule-based priority and duplicate hint (simple, in the Java backend)
- Rate limits and spam handling (staff can mark invalid)

### Phase 3 — Intelligence
- Python FastAPI service:
  - **Priority engine** with explanations
  - **Semantic duplicate detection** (text embeddings + location + category)
  - **Department/category suggestion**
- Java ↔ Python integration with timeout and fallback to the Phase 2 rules
- SLA policies, overdue flags, escalation chain
- Labeled evaluation dataset for duplicates (report precision/recall)

### Phase 4 — Operations depth
- **Asset QR codes** (projector, AC, lab PC) with per-asset history
- **Timetable-aware priority** (CSV import of room schedules)
- **Duty roster routing** (assign to whoever is on shift)
- **Technician mobile view** ("My Jobs", nearest first, one-tap status, photo proof)
- Offline-tolerant PWA (queue reports, sync when online)
- Email notifications

### Phase 5 — Insight
- Analytics dashboard (real DB data)
- Recurring-issue detection and **repair-or-replace recommendation** per asset
- Monthly one-page PDF report for administrators
- Resolution-time estimates (only once there is enough real resolved-ticket data)

### Phase 6 — Scale
- More buildings/campuses, Telegram bot reporting, public API documentation

**Explicitly deferred:** native Android/iOS apps, live maps, real-time chat, WhatsApp API, ML prediction before real data exists, public department leaderboards.

---

## 4. Architecture

```
React + TypeScript (PWA)  ──REST/JSON──▶  Spring Boot (Java)  ──▶  PostgreSQL
                                              │      │
                                              │      └──▶ Object storage (photos)
                                              │
                                              └──HTTP (timeout + fallback)──▶  FastAPI (Python)
                                                                               stateless scoring &
                                                                               duplicate service
```

**Principles**
- **Java is the source of truth.** It owns data, permissions, workflow rules, and the audit log.
- **Python is stateless and advisory.** It receives data, returns scores/suggestions. If it is down or slow, Java falls back to simple rules. The core loop never depends on Python being up.
- One database, no microservice sprawl beyond the one Python service.

### Tech stack
| Layer | Choice |
|---|---|
| Frontend | React + TypeScript, mobile-first, PWA |
| Backend | Java 25 + Spring Boot, Spring Security, Spring Data JPA |
| Migrations | Flyway |
| Database | PostgreSQL (MySQL acceptable if already comfortable; do not burn time switching) |
| Python service | FastAPI + sentence-transformers (embeddings) |
| Storage | S3-compatible object storage (local disk in dev) |
| Auth | College Google/Microsoft SSO (OIDC) via Spring Security; JWT or session cookies |
| Testing | JUnit 5 + Spring Security Test, pytest, Playwright |
| Deployment | Docker + managed hosting with HTTPS |
| Docs | OpenAPI (Springdoc), UML diagrams, README |

---

## 5. Data model

Use Flyway migrations. All tables have `id`, `created_at`, `updated_at`.

- **users**: email (unique), name, role (STUDENT | STAFF | ADMIN), department_id (nullable), active, hide_name_from_students
- **departments**: name (IT, Housekeeping, Maintenance, Lab, Electrical), head_user_id
- **buildings**: name, code
- **locations**: building_id, floor, room_code, name, qr_token (unique, unguessable), type (CLASSROOM | LAB | CORRIDOR | WASHROOM | OTHER)
- **assets**: location_id, asset_tag, type (PROJECTOR | AC | PC | LIGHT | OTHER), qr_token, installed_on, status
- **issues**: ticket_no (e.g. CP-1024), reporter_id, location_id, asset_id (nullable), category, description, severity (1–5), safety_flag, status, priority_score, priority_level, priority_explanation (JSON), priority_override_reason, department_id, assignee_id, duplicate_of_issue_id (nullable), sla_due_at, first_response_at, resolved_at, closed_at, version (optimistic locking)
- **issue_supporters**: issue_id, user_id, unique(issue_id, user_id) — the "I'm affected too" taps
- **issue_comments**: issue_id, author_id, body, internal (staff-only boolean)
- **issue_attachments**: issue_id, uploader_id, storage_key, kind (REPORT | BEFORE | AFTER), mime, size
- **issue_status_history**: issue_id, from_status, to_status, changed_by, reason, changed_at
- **audit_log**: actor_id, action, entity_type, entity_id, before (JSON), after (JSON), at
- **notifications**: user_id, issue_id, type, message, read_at
- **sla_policies**: category, priority_level, respond_within_minutes, resolve_within_minutes
- **schedules**: location_id, day_of_week, start_time, end_time, label (class/exam)
- **duty_roster**: department_id, user_id, date, shift_start, shift_end
- **feedback**: issue_id, user_id, fixed_confirmed (bool), rating (1–5), comment

---

## 6. Workflow rules

### Status lifecycle
```
SUBMITTED → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
    │           
    ├→ REJECTED (invalid/spam, reason required)
    └→ DUPLICATE (links to the master issue; reporter becomes a supporter of it)

RESOLVED → REOPENED (student says not fixed) → ASSIGNED
RESOLVED → CLOSED (student confirms, or auto-close after 72h of no response)
```

**Rules**
- Only valid transitions are allowed; the backend rejects everything else with a clear error.
- Staff can only change issues assigned to their department. Admin can change any.
- Moving to RESOLVED requires an AFTER photo (configurable) and a note.
- Every transition writes to `issue_status_history` and `audit_log`.
- Use optimistic locking (`version`) to prevent conflicting concurrent updates.
- Priority overrides by admin require a written reason and are audited.

### Escalation chain
- Unacknowledged for 24h → notify department head
- Unacknowledged for 48h, or SLA breached on Critical/High → notify admin
- Run as a scheduled job; escalations are recorded in the audit log.

### Spam and abuse
- Rate limit reports per user per day (configurable).
- Staff can mark REJECTED with reason; repeated rejections flag a user for admin review.
- Image uploads: allowed types (jpg/png/webp), max size, server-side validation, stripped metadata.

---

## 7. Priority engine

Returns `{ score: 0–100, level, reasons: [...] }`. Must be explainable and deterministic.

**Components (max points)**
| Factor | Max | Notes |
|---|---|---|
| Severity (reporter + category default) | 35 | Scale 1–5 |
| People affected (supporters + room capacity) | 20 | Diminishing returns so popular minor issues cannot outrank dangerous ones |
| Upcoming use (timetable: class/exam in next 2h) | 15 | Phase 4; 0 before schedules exist |
| Age / time waiting | 15 | Grows with waiting time relative to SLA |
| Asset recurrence (repeat failures) | 10 | Phase 4/5 |
| Supporter count | 5 | Small cap |

**Levels:** ≥80 Critical · 60–79 High · 40–59 Medium · <40 Low

**Overrides (applied after scoring)**
- `safety_flag` or safety categories (electrical hazard, broken railing, lighting): minimum **Critical**
- Accessibility categories (lift, ramp): minimum **High**
- Admin override allowed with a reason; the original computed score is kept alongside.

**Explanation example**
```
Score 91 — Critical
+35 Severity: 5/5 (Wi-Fi outage, entire lab)
+18 Affected: 17 students reported
+15 Upcoming use: exam scheduled in this room at 10:00
+12 Waiting: 6h, 75% of SLA used
+11 Recurrence: 3rd outage here in 30 days
```

**Fallback (Phase 2 / when Python is down):** the same formula implemented in Java using only the available inputs. The Python service later takes over and extends it.

---

## 8. Duplicate detection

**Flow**
1. On QR scan, show open issues at that location (and for that asset). Student can tap "I'm affected too".
2. If they still proceed, as they type the description, call `/duplicates/suggest` with location, category, and text.
3. The Python service embeds the text and compares it to open issues at the same location (and neighbouring locations in the same building at lower weight).
4. Return top matches with a similarity score. Above the high threshold → strongly suggest joining; middle band → suggest; below → create new.
5. Admin can manually mark duplicates; the reporter is converted to a supporter on the master issue.

**Phase 2:** simple version (same location + category + keyword overlap).
**Phase 3:** embedding similarity.

**Evaluation (required):** build a labeled set of ~200 report pairs (duplicate / not duplicate, including paraphrases and Hinglish phrasings). Report precision and recall at the chosen threshold in the project docs. Tune thresholds against this set, not by gut feeling.

---

## 9. API contract (v1)

Base path `/api/v1`. JSON. All endpoints require auth unless noted. Errors use a consistent shape `{ code, message, details }`.

**Auth**
- `GET /auth/me`
- `POST /auth/logout`
- (SSO login/callback handled by Spring Security)

**Locations and assets**
- `GET /locations/{qrToken}` → location + open issues there
- `GET /assets/{qrToken}` → asset + history + open issues
- `GET /buildings`, `GET /buildings/{id}/locations`
- Admin: `POST/PUT/DELETE /locations`, `/assets`, `GET /locations/{id}/qr.png`, `GET /locations/qr-sheet.pdf`

**Issues**
- `POST /issues` (rate-limited)
- `GET /issues` (role-scoped; filters: status, category, priority, location, department, date range, mine)
- `GET /issues/{id}`
- `POST /issues/{id}/support`  (I'm affected too)
- `POST /issues/{id}/comments`
- `POST /issues/{id}/attachments`
- `PATCH /issues/{id}/status`  (body: toStatus, reason) — validated transitions
- `PATCH /issues/{id}/assignment`  (department, assignee)
- `PATCH /issues/{id}/priority`  (override level + reason; admin)
- `POST /issues/{id}/duplicate-of/{masterId}`  (admin/staff)
- `POST /issues/{id}/confirm`  (student: fixed yes/no, rating)
- `GET /issues/{id}/history`
- `POST /issues/suggest-duplicates`

**Staff**
- `GET /staff/my-jobs` (assigned, sorted by priority/proximity)

**Notifications**
- `GET /notifications`, `POST /notifications/{id}/read`

**Admin / analytics**
- `GET /admin/metrics/summary`
- `GET /admin/metrics/by-department`, `/by-location`, `/recurring`, `/resolution-times`
- `GET /admin/reports/monthly.pdf`
- `POST /admin/schedules/import` (CSV), `/admin/roster`
- `CRUD /admin/sla-policies`, `/admin/users`, `/admin/departments`

**Python service (internal only, not exposed publicly)**
- `POST /score` → `{ score, level, reasons[] }`
- `POST /duplicates` → `{ matches: [{ issueId, similarity }] }`
- `POST /classify` → `{ category, department, confidence }`
- `GET /health`

Java calls Python with a short timeout (e.g. 800 ms), logs failures, and falls back to rules.

---

## 10. Frontend screens

**Student:** Sign in · QR landing (known issues + report) · Report form · My reports · Issue detail (timeline, comments) · Notifications · Confirm/rate resolution

**Staff:** My Jobs (mobile-first, one-tap status, photo proof) · Issue detail · Department queue

**Admin:** Dashboard (counts, overdue, high priority) · All issues with filters · Issue management (assign, override, duplicate, close) · Locations/assets/QR management · Analytics · SLA and department settings · Reports

**UX rules:** mobile first, works on slow connections, plain language, large tap targets, visible "not for emergencies" notice, accessible (labels, contrast, keyboard).

---

## 11. Security and privacy

- Server-side authorization on every endpoint; test student vs staff vs admin access paths.
- Students can never read or modify another student's private data.
- Reporter identity hidden from other students (optional anonymity); always visible to admins.
- Validate all input; parameterized queries only; output encoding.
- File uploads: type and size limits, random storage keys, no executable content, EXIF stripped.
- Photo notice: avoid capturing people's faces. Auto-delete photos N days after closure (configurable).
- Secrets only in environment variables; never committed. No real student data in dev or test.
- Logs must not contain tokens, passwords, or private report text.
- HTTPS everywhere, secure cookie flags, CORS locked to the frontend origin, CSRF protection if using cookies.
- Database backups with a tested restore procedure.
- Data retention policy documented; get administrative sign-off before collecting real student data.

---

## 12. Testing strategy

- **Backend (JUnit + Spring Security Test):** every status transition (valid and invalid), role permissions, rate limiting, optimistic-lock conflicts, upload validation.
- **Python (pytest):** scoring cases including safety overrides and diminishing returns; duplicate matching on the labeled dataset; health and error handling.
- **Integration:** Java ↔ Python success, timeout, and fallback paths.
- **End-to-end (Playwright):** student reports from a QR link → staff assigns and resolves → student confirms. Repeat for reopen and duplicate flows.
- **Quality bar:** a feature isn't done until its tests pass **and were actually run**. Report real output.

---

## 13. Success metrics (measure during pilot)

| Metric | Why |
|---|---|
| Median time to submit a report | Is reporting frictionless? |
| % reports acknowledged within 24h | Is staff responding? |
| Median time to first response | Responsiveness |
| Median resolution time | Are problems getting fixed? |
| % resolved vs overdue | Queue health |
| Duplicates prevented per issue | Is duplicate handling working? |
| Reopen rate | Quality of fixes |
| Student satisfaction (1–5) | Usefulness |
| Duplicate precision/recall | Algorithm quality |

---

## 14. Pilot plan (before building Phase 3+)

1. Get a staff owner who commits to checking the queue daily. No owner, no pilot.
2. Get agreement from the departments that tickets will arrive through this system.
3. Get a faculty sponsor or administration approval before posting QR codes or storing student data.
4. Start with 1 building, 3 categories (IT/Wi-Fi, Maintenance, Cleanliness), a small group of consenting users.
5. Run 2 weeks, collect the metrics above and direct feedback, fix blockers, then expand.

---

## 15. Working with AI coding agents

### Ground rules
- Read this file and the existing code before changing anything.
- Work on **one phase and one feature at a time**. Never "build the whole app" in one prompt.
- Contract first: schema, endpoints, statuses, and error format are fixed here; propose changes before making them.
- Real, database-backed functionality. No mocks or hardcoded data in place of working features.
- Add tests for every feature, including failure cases. Run them and report real results.
- No unrelated refactors, no unnecessary dependencies, no secrets in the repo.
- After each feature: summarize changed files, API changes, setup steps, known limitations, and the exact verification commands used.
- Use a separate session to **review and test** work, not the same session that wrote it.

### Suggested repo layout
```
campus-pulse/
  PROJECT_SPEC.md
  README.md
  docker-compose.yml
  backend/          # Spring Boot
  frontend/         # React + TS
  intelligence/     # FastAPI
  docs/             # SRS, UML, API docs, evaluation report
  e2e/              # Playwright
```

### Build order and starter prompts

**Step 1 — Skeleton**
> Read PROJECT_SPEC.md. Create the repo layout from section 15. Set up Spring Boot with Flyway and PostgreSQL via docker-compose, a React + TypeScript app, and a `/health` endpoint on the backend. Add CI that builds and runs tests. Do not implement features yet. Explain how to run everything.

**Step 2 — Schema**
> Implement the data model in section 5 as Flyway migrations and JPA entities for Phase 1–2 tables only. Add seed data for departments, one building, floors, and rooms. Write repository tests.

**Step 3 — Auth and roles**
> Implement college SSO sign-in with Spring Security, the three roles, and `GET /auth/me`. Add a dev-only login for local testing that cannot be enabled in production. Write tests proving each role's access rules.

**Step 4 — Issues core**
> Implement issue creation, listing (role-scoped), detail, support, comments, and attachments per section 9, with validation, rate limiting, and upload checks. Add tests including unauthorized access.

**Step 5 — Workflow**
> Implement the status state machine from section 6 with history, audit log, optimistic locking, assignment, and priority override with reason. Test every valid and invalid transition.

**Step 6 — Frontend core loop**
> Build the QR landing, report form, my reports, issue detail, staff queue, and admin queue screens against the real API. Mobile-first. Include the not-for-emergencies notice.

**Step 7 — QR and notifications**
> Implement QR token generation, printable QR sheet, in-app notifications, and the resolution confirm/reopen flow.

**Step 8 — End-to-end test and pilot hardening**
> Write the Playwright test for report → assign → resolve → confirm. Run the security checklist in section 11. Report gaps.

*(Pilot here. Then continue with Phase 3+.)*

**Step 9 — Python service**
> Build the FastAPI service with `/score`, `/duplicates`, `/classify`, `/health` per sections 7–9, with pytest tests. Then integrate with the backend including timeout and rule-based fallback, and test both paths.

**Step 10 — Evaluation**
> Create a labeled duplicate-pairs dataset and a script that reports precision/recall at several thresholds. Document the chosen threshold.

Continue with SLA/escalation, assets, timetable import, roster, technician view, analytics, and the monthly PDF in the order listed in section 3.

---

## 16. Open decisions (fill these in)

- [ ] College sign-in: Google Workspace or Microsoft?
- [ ] Which building(s) and which departments for the pilot?
- [ ] Who is the staff owner of the queue?
- [ ] Hosting choice and budget
- [ ] Photo retention period
- [ ] Should the reporter's name be hidden from other students by default?
- [ ] Which SLA targets does each department accept?
- [ ] Project name (Campus Pulse vs Campus Pulse Lite)

---

## 17. Documentation deliverables

SRS · use-case and class diagrams · ER diagram · sequence diagrams (report flow, status transition, Python fallback) · OpenAPI spec · test report · duplicate-detection evaluation report · pilot results · deployment and runbook · privacy and data-retention note.
