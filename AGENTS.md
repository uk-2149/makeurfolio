<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# makeurfolio — Backend & Authentication Architecture

## Overview
makeurfolio automatically generates recruiter-ready developer portfolio websites from a GitHub profile and/or a Resume (PDF or Word DOCX). 
The backend handles fetching data from GitHub, parsing text from resumes (PDFs and DOCX files), passing this context to Gemini AI for structured extraction, and saving the result to a PostgreSQL database via Prisma.

## Architecture Principles
1. **Isolated Layers**: Route handlers delegate to services, services orchestrate logic, repositories talk to Prisma, mappers transform data boundaries.
2. **AI Constraints**: The LLM NEVER generates database entities or Prisma schemas. It strictly outputs a normalized business profile (`NormalizedProfile` schema) validated by Zod.
3. **Seamless Authentication & State Stashing**: Low-friction account ownership is enabled using Better Auth (Google OAuth & Email OTP). To maximize user conversion, developers can input their GitHub username and upload their resume *before* signing up. Their inputs are automatically stashed in IndexedDB across auth redirects and seamlessly restored upon landing back on the site to trigger generation under their new account.
4. **Synchronous Execution (MVP)**: Generation runs synchronously in-band during the POST request to avoid background task termination on serverless hosts like Vercel.

## Core Modules

### 1. `src/modules/github`
Fetches a user's GitHub profile and repositories. Minimizes API calls by fetching repos in bulk, applying a quality filter, scoring the candidates based on metrics (stars, forks, recent activity, README existence), and fetching detailed language stats ONLY for the top 5 repos.

### 2. `src/modules/resume`
Uses `pdf-parse` (for PDFs) and `mammoth` (for DOCX Word documents) to extract plain text from a resume buffer. The file binary never leaves this module and is never sent to the LLM.

### 3. `src/modules/ai`
Defines the `NormalizedProfile` Zod schema and system prompts. Calls Gemini (`gemini-2.5-flash`) with structured output configuration. Includes retry logic for Zod schema validation failures. Strict anti-hallucination prompts are enforced.

### 4. `src/modules/portfolio`
Contains `portfolio.mapper.ts` for translating the AI output + GitHub data into Prisma's nested create structure. Handles slug generation, enum mapping for skills, and project attribution. `portfolio.repository.ts` ensures atomic database writes. Connects portfolios directly to user accounts via the nullable `userId` relation.

### 5. `src/modules/generation`
Orchestrates the entire pipeline. Deduplicates projects via `project-merge.service.ts` between GitHub and Resume inputs. Updates the `PortfolioGeneration` status tracking model during the synchronous run.

---

## Authentication & UX Flow Architecture

makeurfolio implements a premium, high-intent generation UX integrated with robust session management:

### 1. Low-Friction Entry & State Persistence (`src/lib/storage.ts`)
* Users interact with the landing page inputs immediately without being blocked by an auth screen.
* When they trigger generation, their current input state (including raw `File` objects for resumes and text inputs) is stashed inside **IndexedDB** (via `idb-keyval`).
* If the user is unauthenticated, they are presented with a premium authentication overlay (`AuthModal`).
* After successful authentication (whether via Google OAuth redirect or Email OTP verification), the application mounts, checks for stashed state, restores the stashed file and text fields, and immediately opens the portfolio name prompt (`NamingModal`).

### 2. Next.js App Router Client-Side Auth Strategy
* During prerendering, Server-Side Rendering (SSR) of hooks like `useSession` from `better-auth/react` can cause React hydration mismatches or prerender crashes (e.g., `useRef` null errors).
* To resolve this, the client safely queries `authClient.getSession()` inside a mount-triggered `useEffect` callback, avoiding compile-time and runtime failures.

### 3. Premium Pipeline Generation UI (`src/components/generation-overlay.tsx`)
* When a portfolio is being generated, the client polls the status route `/api/portfolio/generation/[id]` every 1.5 seconds.
* Instead of exposing low-level technical logs to the user, the UI categorizes the generation into 4 high-level stages: `Analyzing GitHub` -> `Understanding Resume` -> `Building Your Portfolio` -> `Finalizing Website`.
* Progress indicators are dynamically calculated based on the active stage index, providing a smooth, premium visual experience without faking arbitrary percentages.
* The active generation ID is persisted in `localStorage` so that a browser refresh or unexpected redirect doesn't lose the progress visual; the overlay instantly re-opens on reload to continue polling.

### 4. User Dashboard (`/dashboard`)
* A secure route that displays the authenticated user's generated portfolios.
* Queries portfolios associated with the current session's `userId`, listing view counts, creation dates, and providing immediate links to live sites (`/portfolio/[slug]`).

---

## API Endpoints

All API endpoints return consistent, structured JSON responses. Error responses follow a standard structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message describing the failure",
    "statusCode": 400
  }
}
```

---

### 1. `GET /api/health`
*Utility endpoint to verify application and database connection health.*

#### Payload / Parameters
* **Method**: `GET`
* **Body/Query Parameters**: None

#### What it does
1. Executes a quick database connectivity ping using Prisma's `$queryRaw` running `SELECT 1`.
2. Inspects process status to fetch application uptime.
3. If database query fails, responds with an unhealthy code (`503`).

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-06-01T21:26:40.123Z",
      "uptime": 234.56,
      "database": "connected"
    }
  }
  ```
* **Failure (`503 Service Unavailable`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "HEALTH_CHECK_FAILED",
      "message": "Database query failed...",
      "statusCode": 503,
      "details": {
        "database": "disconnected"
      }
    }
  }
  ```

---

### 2. `POST /api/portfolio/generate`
*Triggers the portfolio generation pipeline by merging GitHub and/or Resume (PDF/DOCX) inputs. Requires an active user session.*

#### Payload / Parameters
* **Method**: `POST`
* **Headers**: 
  * `Content-Type: multipart/form-data`
  * Active Better Auth session cookie / headers
* **Body Fields**:
  * `githubUsername` (string, *optional*): The developer's GitHub username to parse repositories and public profile.
  * `resume` (file, *optional*): A PDF or Word document (.docx) Resume upload to parse text.
    * *Note: At least one of `githubUsername` or `resume` must be provided.*
  * `portfolioName` (string, *required*): The target name of the portfolio (e.g. `Utkal's Dev Space`).

#### What it does
1. Authenticates the request via `auth.api.getSession`. Returns `401 Unauthorized` if no valid user session is detected.
2. Validates inputs, ensuring either a GitHub username is present or a PDF/DOCX file is attached.
3. Synchronously executes the full processing pipeline to prevent background serverless functions from getting terminated prematurely on platforms like Vercel:
   - Tracks state using `PortfolioGeneration` database records (starting with `QUEUED`).
   - **GitHub Parsing**: Bulk fetches repos, scores them based on activity and quality, and fetches readme + languages only for the top 5 candidates.
   - **Resume Parsing**: Extracts text from PDF files (using `pdf-parse`) or Word document DOCX files (using `mammoth`).
   - **Deduplication**: Merges projects matching similarity thresholds or identical names using `ProjectMergeService`.
   - **AI Extraction**: Converts merged information into a standardized profile schema utilizing Google Gemini `gemini-2.5-flash` with JSON output schemas and validation retry loops.
   - **Mapping**: Translates Gemini schemas into relational models, generating a unique slug for the portfolio.
   - **Persistence**: Atomic write of the fully structured portfolio (experience, skills, projects, certifications, etc.) to PostgreSQL, associated directly with the authenticated `userId`.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "generationId": "cuid-string-for-tracking",
      "portfolioSlug": "generated-portfolio-slug"
    }
  }
  ```
* **Unauthorized (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "You must be logged in to generate a portfolio.",
      "statusCode": 401
    }
  }
  ```
* **ValidationError (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Either githubUsername or resume is required",
      "statusCode": 400
    }
  }
  ```
* **Internal Server Error (`500 Internal Server Error`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "GEMINI_ERROR",
      "message": "Failed to parse structured JSON from Gemini API",
      "statusCode": 500
    }
  }
  ```

---

### 3. `GET /api/portfolio/generation/[id]`
*Retrieves the status of a specific portfolio generation job.*

#### Payload / Parameters
* **Method**: `GET`
* **Path Parameters**:
  * `id` (string, *required*): The `generationId` returned by `/api/portfolio/generate`.

#### What it does
1. Queries the PostgreSQL database for the `PortfolioGeneration` entry matching the CUID.
2. Calculates progress percentage based on current pipeline status (ranging from `0` to `100`).
3. Returns status indicators along with the final portfolio ID and slug if the generation is completed.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "generationId": "cuid-string",
      "status": "COMPLETED", // QUEUED | FETCHING_GITHUB | PARSING_RESUME | GENERATING_PROFILE | COMPLETED | FAILED
      "progress": 100, // Numeric progress value (0 to 100)
      "currentStep": "Generating unique URL", // Granular step string
      "activityLogs": [
        { "timestamp": "2026-06-01T12:00:00Z", "message": "Fetching GitHub profile" }
      ],
      "portfolioId": "portfolio-cuid-string", // null if not completed
      "portfolioSlug": "generated-slug", // null if not completed
      "errorMessage": null // string describing failure if status is FAILED
    }
  }
  ```
* **NotFound (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Generation not found",
      "statusCode": 404
    }
  }
  ```

---

### 4. `GET /api/portfolio/[slug]`
*Retrieves the complete portfolio profile data including all related entities.*

#### Payload / Parameters
* **Method**: `GET`
* **Path Parameters**:
  * `slug` (string, *required*): The unique slug for the portfolio (e.g. `utkal`).

#### What it does
1. Queries PostgreSQL for the portfolio with the matching `slug`.
2. Includes and joins all relations (`experiences`, `educations`, `skills`, `projects`, `certifications`, `achievements`).
3. Groups and formats the response structure suitable for portfolio page rendering.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "portfolio-id-string",
      "slug": "utkal",
      "name": "My Portfolio",
      "fullName": "John Doe",
      "headline": "Senior Full-Stack Engineer",
      "bio": "Building high-performance software systems...",
      "email": "john@doe.dev",
      "phone": "+123456789",
      "location": "San Francisco, CA",
      "avatarUrl": "https://avatars.githubusercontent.com/u/...",
      "linkedinUrl": "https://linkedin.com/in/...",
      "githubUrl": "https://github.com/...",
      "twitterUrl": null,
      "websiteUrl": null,
      "summary": "AI generated profile summary...",
      "experiences": [
        {
          "id": "experience-id",
          "company": "Tech Corp",
          "role": "Lead Engineer",
          "startDate": "2023-01-01T00:00:00.000Z",
          "endDate": null,
          "currentlyWorking": true,
          "description": "Led development of core features..."
        }
      ],
      "educations": [
        {
          "id": "education-id",
          "institution": "Stanford University",
          "degree": "B.S.",
          "fieldOfStudy": "Computer Science"
        }
      ],
      "skills": [
        {
          "id": "skill-id",
          "name": "TypeScript",
          "category": "LANGUAGE"
        }
      ],
      "projects": [
        {
          "id": "project-id",
          "title": "makeurfolio",
          "description": "AI generator...",
          "githubUrl": "https://github.com/...",
          "techStack": ["Next.js", "TypeScript", "Prisma"]
        }
      ]
    }
  }
  ```
* **NotFound (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Portfolio not found",
      "statusCode": 404
    }
  }
  ```

---

### 5. `/api/auth/*`
*Catch-all endpoints for authentication actions (OAuth redirects, OTP verification, sessions).*

* Managed internally by Better Auth at `app/api/auth/[...all]/route.ts`.

---

## Logging and Errors
- `src/lib/logger.ts`: Structured console logger with timing metrics.
- `src/lib/errors.ts`: Typed error hierarchy (`ValidationError`, `GithubError`, `GeminiError`, etc.). Route handlers map these to correct HTTP status codes.
- Gemini Provider errors: `GeminiQuotaExceededError`, `GeminiFailoverError`, `UserGeminiApiError`, `AllGeminiKeysFailedError`. The provider never throws generic `Error` objects.

## Dependencies
- `better-auth` for authentication (Google OAuth, Email OTP)
- `idb-keyval` for client-side state stashing in IndexedDB
- `zod` for validation
- `pdf-parse` & `mammoth` for text extraction (PDFs & DOCX files)
- `@google/genai` for structured generation
- Prisma ORM with `@prisma/adapter-pg`

## Configuration
Requires the following environment variables:
* `DATABASE_URL` (PostgreSQL connection string)
* `GITHUB_TOKEN` (for higher rate limits)
* `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, ... (Gemini API keys — at least one required; add more for failover)
* `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
* `BETTER_AUTH_SECRET` (encryption keys for Better Auth)
* `BETTER_AUTH_URL` (Base URL of application e.g. `http://localhost:3000`)
* `GOOGLE_CLIENT_ID` (Google OAuth credential)
* `GOOGLE_CLIENT_SECRET` (Google OAuth credential)

Validated on startup via `src/lib/env.ts`.

---

## Gemini Provider Architecture

The AI generation layer uses a multi-key provider (`src/lib/gemini-provider.ts`) for resilience against quota exhaustion, rate limits, and temporary outages.

### Key Components

```
src/lib/gemini.ts              # Thin factory: createGeminiClient(apiKey)
src/lib/gemini-provider.ts     # Multi-key orchestrator with failover
src/lib/errors.ts              # GeminiQuotaExceededError, AllGeminiKeysFailedError, etc.
src/modules/generation/generation-context.ts  # Request-scoped context (requestId, userApiKey, model)
```

### Multi-Key Pool
- Keys are discovered **once at startup** by scanning `process.env` for `GEMINI_API_KEY_*` matching `/^GEMINI_API_KEY_\d+$/`.
- Keys are sorted numerically and filtered for non-empty values.
- One `GoogleGenAI` client is created per key via the `createGeminiClient()` factory.
- The pool is **never re-scanned**. Adding new keys requires a restart.

### Failover Chain
When a request fails with a retryable error, the provider tries the next key with exponential backoff:
```
Key1 → 429 → wait 200ms → Key2 → 429 → wait 400ms → Key3 → success
```
- Base delay: 200ms, multiplier: 2x, cap: 800ms.
- Timeouts failover immediately (no same-key retry).
- Non-retryable errors (400, safety filter, invalid schema) throw immediately — no failover.
- If all keys fail → `AllGeminiKeysFailedError` (HTTP 503, code `ALL_GEMINI_KEYS_EXHAUSTED`).

### Retryable vs Non-Retryable Errors
- **Retryable (failover)**: 429, 500, 502, 503, network timeout, ECONNRESET, RESOURCE_EXHAUSTED, UNAVAILABLE
- **Non-retryable (immediate throw)**: 400, 401, 403, safety rejection, INVALID_ARGUMENT, PERMISSION_DENIED

Error classification checks structured SDK fields (status code, error code) first; string matching is a fallback only.

### Model Abstraction
The model name defaults to `env.GEMINI_MODEL` (set via the `GEMINI_MODEL` env var, defaults to `gemini-2.5-flash`). It can be overridden per-request via `GenerationContext.model`.

### GenerationContext
A request-scoped object threaded through the entire pipeline:
```ts
interface GenerationContext {
  requestId: string;     // Generation CUID for tracing
  userApiKey?: string;   // Optional user-provided key (memory-only)
  model?: string;        // Optional model override
}
```
Built at the top of `executeGenerationSynchronously()` and passed to `generateProfile()`.

### User-Provided API Key Flow
1. User optionally submits `geminiApiKey` via the generation form.
2. The key is trimmed and passed through `GenerationContext` — **never logged, never stored, never persisted**.
3. The provider creates a temporary client for this key and makes a **single attempt**.
4. On failure, the error is classified into a specific reason (`invalid_key`, `quota_exceeded`, `service_unavailable`, `unknown`).
5. **The provider NEVER falls back to server keys** when a user key is provided.
6. The key exists only in memory for the duration of that request.

### Security Guarantees
- User API keys are **never**: saved to database, stored in session/cookies, stored in IndexedDB/localStorage, logged (even partially), included in error messages or analytics.
- Server API keys are referenced in logs by env var name only (e.g. `GEMINI_API_KEY_1`), never by value.

### Frontend Fallback UX
When the server returns `ALL_GEMINI_KEYS_EXHAUSTED`:
- The generation overlay/dashboard shows a premium glassmorphism card (`src/components/gemini-key-fallback.tsx`).
- Users can enter their own Gemini API key via a password-style input.
- Inline validation errors display reason-specific messages.
- "Try Again Later" dismisses the modal.

### Future Extension
- The `createGeminiClient()` factory pattern makes it straightforward to add support for additional AI providers.
- `GenerationContext` can be extended with new cross-cutting concerns (locale, maxTokens, experimentFlags) without modifying function signatures.

---

## Premium Developer Workspace Dashboard & Theme Architecture

A complete redesign of the workspace (`app/dashboard/page.tsx`) transforms it from a generic CRUD/admin layout into an intentional, minimal, calm, modern developer space reminiscent of linear, raycast, and vercel.

### 1. Dashboard UI/UX Architecture
* **Layout Structure**: 
  - **Sticky Top Navigation**: Anchors the page header with high-blur visual depth (`bg-background/85 backdrop-blur-md`), incorporating a sleek sun/moon theme selector, active developer identity details (email and avatar with fallback), and sign-out integration.
  - **Welcome Section**: Personalized welcome text ("Welcome back, {firstName}.") paired with a primary CTA `+ Create Portfolio` to immediately trigger the portfolio generation modal flow client-side.
  - **Metric Stats Row**: Clean, highly-polished display metrics cards indicating Portfolios count, Total Views, and Published statuses.
  - **Search & Filter Bar**: Context-aware real-time search interface above the grid matching by Name or Slug client-side.
  - **Portfolio Grid**: High-fidelity product cards dynamically featuring subdomain rendering (e.g. `slug.makeurfolio.dev` in mono), visual view counters, creation timestamps, and active state pill indicators. Hovering introduces micro-lifts and fine shadows for premium interaction.
  - **Empty State**: Graphic card layout prompting action when no portfolios are present in the account database.
* **Responsive Behavior**: Flexible column wrapping (1 column on mobile, 2 columns on tablet, 3 columns on desktop) using modern responsive layout properties and padding alignment.

### 2. Theme Architecture & Persistence
* **CSS Variable Design System**: Centralized color definitions inside `app/globals.css`:
  - **Light mode values**: Background `#FAFAFA`, Cards `#FFFFFF`, Borders `#EAEAEA`, Primary text `#111111`, Secondary text `#666666`.
  - **Dark mode values**: Background `#0D0E12`, Cards `#151821`, Borders `#232734`, Primary text `#FFFFFF`, Secondary text `#9CA3AF`.
* **Theme Persistence Strategy**:
  - Uses `localStorage.theme` to persist user choices across sessions and page refreshes.
  - Applies or removes the `.dark` class directly on the root `document.documentElement` to trigger CSS color tokens instantly, preventing flash-of-unstyled-content (FOUC).
  - Elegant mini theme button with quick SVG icon transitions (Sun/Moon).

### 3. Session & Authentication Flow
* **Better Auth Sign-Out**: Handled client-side using `authClient.signOut()` from `@/src/lib/auth-client`. Clears the session safely and handles redirecting to the landing page `/` via Next.js router.
* **Modal Overlay Pipeline Integration**:
  - The `+ Create Portfolio` CTA dynamically launches `NamingModal` directly inside the dashboard.
  - Aborted overlay triggers clean IndexedDB stashing wipes (`clearStashedState()`) to avoid state corruption or infinite auth redirect loops.

### 4. Client-side Search & Stats Computation
* **Interactive Filtering**: Client-side filtering executes instantly on user keystroke inputs:
  ```ts
  const filteredPortfolios = portfolios.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
  });
  ```
* **Dynamic Analytics**: Real-time stats row calculations occur automatically based on fetched data list mapping:
  - **Portfolios**: `portfolios.length`
  - **Total Views**: `portfolios.reduce((sum, p) => sum + (p._count?.portfolioViews || 0), 0)`
  - **Published Count**: Count of active items mapped dynamically through status codes.

### 5. Future Extension Points
* **Settings & Analytics Actions**: Redesigned card details include design-ready disabled placeholder links (`Settings`, `Analytics`) to support seamless integration in future releases.
* **Multi-Domain Custom Mapping**: The monospace link formatting is isolated, preparing the way for custom domain configurations (e.g. `domain.com` map hooks).

---

## Portfolio Editor Architecture

A premium, Notion/Linear-inspired editor interface (`app/dashboard/portfolio/[id]/edit`) designed to manage the content of a generated portfolio without feeling like a generic CRUD admin panel.

### 1. Editor UI/UX Principles
* **Sticky Header**: Houses the context-aware state indicators (Saved/Unsaved changes), Discard Changes button, Save Changes button (with loading states), and a quick link to Preview the live portfolio.
* **Sidebar Navigation**: Left-hand sticky sidebar with smooth scroll-spy integration for quick navigation across long content sections (Profile, Social, Experience, Education, Skills, Projects, Certifications, Achievements, SEO).
* **Focused Sections**: Modular editor blocks designed with high-quality input states, focus rings, and clear layout. Relational lists (Experiences, Projects, etc.) utilize expandable inline-edit cards to prevent context switching and avoid complex modals.

### 2. State Management & API Integration
* **`EditorContext`**: A central React Context that manages:
  * `initialData`: The source of truth fetched from the server.
  * `formData`: The working draft.
  * `hasUnsavedChanges`: Derived state (`JSON.stringify(initialData) !== JSON.stringify(formData)`).
* **Save / Discard Mechanics**: 
  * "Discard Changes" instantly reverts `formData` to `initialData`.
  * "Save Changes" triggers the `PATCH` endpoint, updating the backend and then syncing `initialData` to the newly saved state.
* **Unsaved Warnings**: A `beforeunload` event listener prevents users from accidentally closing the tab if `hasUnsavedChanges` is true.

### 3. Security & Database Syncing
* **Protected Routes**: Both `GET /api/editor/portfolio/[id]` and `PATCH /api/editor/portfolio/[id]` enforce strict ownership. They verify that the requested portfolio's `userId` matches the authenticated `session.user.id`. Unauthorized access returns a `403 Forbidden`.
* **Nested Writes**: The `PATCH` route handles relational updates (Experiences, Projects, Educations, Skills, Certifications, Achievements, SocialLinks) by executing atomic `deleteMany` followed by `create` operations, ensuring the database stays perfectly synced with the client's working array state.

---

## Theme System & Multi-Theme Architecture

makeurfolio uses a registry-based multi-theme architecture that fully separates content from presentation, similar to how CMS systems (Webflow, Shopify, Ghost) work.

### Architecture Overview

```
src/themes/
├── registry.ts              # Maps themeId → React component
├── theme-manifest.ts        # Theme metadata (name, description, previewImage)
│
├── minimal-editorial/
│   └── index.tsx            # Theme #1 implementation
│
└── shared/
    ├── types.ts             # FullPortfolio type, PortfolioThemeProps contract
    └── utils.ts             # Shared helpers (skill grouping, date formatting, etc.)
```

### Data Flow (Strict)

```
Route (page.tsx) → Fetch Portfolio (Prisma) → Resolve Theme (registry) → Render Theme
```

**Themes are pure presentation components.** They must NEVER:
- Import Prisma or any database client
- Call `fetch()` or access any API
- Access browser storage (`localStorage`, `sessionStorage`, IndexedDB)
- Perform any data fetching or side effects

All themes receive an identical, fully-hydrated `FullPortfolio` object through `PortfolioThemeProps`.

### Route Resolution (`app/portfolio/[slug]/page.tsx`)

The portfolio page is extremely thin. It only:
1. Fetches the portfolio from Prisma (including all relations)
2. Generates SEO metadata
3. Resolves the theme: `portfolio.themeId → themeRegistry[themeId]`
4. Falls back to `DEFAULT_THEME_ID` ("minimal-editorial") if `themeId` is null or invalid
5. Renders `<ThemeComponent portfolio={portfolio} />`

Zero UI markup lives in `page.tsx`.

### Theme Registry (`src/themes/registry.ts`)

Single source of truth for theme resolution. Maps `themeId` strings to React component implementations. No switch statements elsewhere in the codebase.

### Theme Manifest (`src/themes/theme-manifest.ts`)

Metadata consumed by the editor's theme selector gallery. Contains `id`, `name`, `description`, and `previewImage` for each theme.

### Shared Utilities (`src/themes/shared/utils.ts`)

Centralized helpers to avoid duplication across themes:
- `groupSkillsByCategory(skills)` — groups skills into `Record<string, Skill[]>`
- `formatDateRange(start, end, currentlyWorking)` — e.g. `"2023 — Present"`
- `splitProjects(projects)` — returns `{ featured, regular }`
- `getPrimarySocials(links, count)` — returns the top N visible social links
- `getTopTechString(skills, count)` — comma-separated top tech names

### Adding a New Theme

1. Create theme folder: `src/themes/<theme-id>/`
2. Implement a default-exported component accepting `PortfolioThemeProps`
3. Add metadata entry to `src/themes/theme-manifest.ts`
4. Register the component in `src/themes/registry.ts`
5. Done.

**No route changes. No database changes. No editor changes.**

See `CONTRIBUTING.md` for full details.

### 1. The "Minimal Editorial" Theme (`src/themes/minimal-editorial/`)
* **Design Philosophy**: Rejects generic vertically-stacked generator layouts (Hero -> Skills -> Projects -> Contact). Instead, it uses a high-end, editorial layout: `Name/Intro -> About -> Featured Work -> Skills -> Experience -> Everything Else`.
* **Typography**: Leverages `Manrope` for structural headings to provide a modern feel, paired with `Inter` for highly readable body copy (`text-lg` with `leading-relaxed` in the biography).
* **Container System**: Strictly enforces a `max-w-[1100px]` width across the page to ensure reading comfort and premium spacing on ultra-wide monitors.
* **Component Styling**: Clean, subtle borders, high contrast spacing, and no massive gradients. Background is forced to `#FCFCFC` (light mode) to maintain the editorial print-like aesthetic.
* **Intelligent Data Grouping**:
  - **Skills** are automatically grouped by `category` (e.g., Frontend, Backend) into clean, scannable lists rather than rendering as a chaotic wall of pills.
  - **Projects** are split into "Featured Case Studies" (large, dominant layout) and "Regular Projects" (2-column grid) based on the `featured` flag.
* **Visibility Controls**: Users have fine-grained control over what sections to render using `showExperience`, `showEducation`, etc. If a section is toggled off or has no data, it collapses gracefully. Every section is wrapped in an independent `<section>` container to ensure layout rhythm remains stable regardless of missing data.

### 2. The "Founder OS" Theme (`src/themes/founder-os/`)
* **Design Philosophy**: A modern founder / indie hacker / startup operator portfolio focused on products, impact, and credibility. Replaces traditional resume elements with impact-driven stats and large product cards. Inspired by Stripe Press, Linear, and Vercel.
* **Layout Structure**: `Hero (w/ Stats) -> Featured Projects -> About -> Experience -> Skills -> Education/Certifications/Achievements -> Footer`.
* **Key Components**:
  - **Asymmetric Hero**: Large profile on the left, dynamic quantitative impact stats on the right (Projects, Skills, Experience counts).
  - **Premium Project Cards**: The focal point of the theme. Large cards combining tech stacks, descriptions, and call-to-actions, resembling startup landing pages.
  - **Compact Layouts**: Experience uses a clean 2-column timeline. Skills are grouped into clean categorised cards with count badges instead of massive tag clouds.
* **Visibility Controls**: Designed to never leave orphaned grids or massive whitespace if sections are disabled.

### 3. Dynamic Social Links Pipeline
* **Old vs New**: Replaced legacy static columns (`githubUrl`, `linkedinUrl`, etc.) with a dynamic, scalable `SocialLink` table.
* **AI Extraction**: `src/modules/ai/prompts.ts` aggressively scans both Resume and GitHub data to discover URLs (LinkedIn, Twitter, Telegram, Blogs, etc.).
* **Backend Normalization**: `src/lib/social-utils.ts` parses raw URLs from Gemini and normalizes them, automatically mapping known domains to correct `label`s (e.g., "X (Twitter)", "Medium") and Lucide `icon` identifiers without hallucination risk from the LLM.
* **Editor Integration**: Users manage an unlimited array of social links in the editor with drag-and-drop sorting and visibility toggling.
* **Resume URL**: Added explicit `resumeUrl` field combined with a `showResume` toggle to seamlessly display a direct PDF link alongside social badges on the public portfolio.

## Subdomain URL Architecture

makeurfolio employs a subdomain architecture for public portfolios: `https://[slug].makeurfolio.com`.

### 1. Middleware Rewrite Flow
* User navigates to `utkal-kumar-das.makeurfolio.com`
* `middleware.ts` intercepts the request and extracts the subdomain.
* It internally rewrites the request to `/portfolio/utkal-kumar-das`.
* The `app/portfolio/[slug]/page.tsx` route handles rendering, entirely unaware that it was accessed via a subdomain.

### 2. The `getPortfolioUrl` Helper
* **Location**: `src/lib/portfolio-url.ts`
* **Purpose**: Centralizes the generation of absolute portfolio URLs based on the `NEXT_PUBLIC_ROOT_DOMAIN` environment variable.
* **Rule**: ALL user-facing portfolio links across the application (Dashboard cards, Copy Link buttons, Editor previews, Success Modals) MUST use `getPortfolioUrl(slug)`.
* **Hardcoding Ban**: Never hardcode `/portfolio/[slug]` for user-facing navigation. It breaks the illusion of custom domains/subdomains and exposes the internal routing structure.

### 3. Local Development Support
* For local testing of subdomains, set `NEXT_PUBLIC_ROOT_DOMAIN="lvh.me:3000"` in `.env`.
* `getPortfolioUrl` automatically falls back to `http://` for `lvh.me` and `localhost`, ensuring seamless local routing.
