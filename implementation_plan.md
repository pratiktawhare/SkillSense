# SkillSense - Complete Implementation Plan (12 Parts)

> 🎯 **AI-Driven Resume-to-Role Matching Platform**
> A production-ready recruitment intelligence system with semantic understanding, explainable AI, and beautiful UX

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SKILLSENSE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React +   │  │  Node.js +  │  │  MongoDB    │              │
│  │  Tailwind   │──│   Express   │──│  Database   │              │
│  │  Frontend   │  │   Backend   │  │             │              │
│  └─────────────┘  └──────┬──────┘  └─────────────┘              │
│                          │                                       │
│                   ┌──────┴──────┐                                │
│                   │ Hugging Face│                                │
│                   │ Inference   │                                │
│                   │ API (FREE)  │                                │
│                   └─────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 1: Authentication + Resume & Job Upload ✅ COMPLETED

### Objective
Build secure recruiter authentication with JWT and PDF processing with text extraction.

### 🎨 Creative Features
- **Glassmorphism UI** with purple-pink gradient theme
- **Drag-and-drop** resume upload with visual feedback
- **Real-time** PDF text extraction preview
- **Animated** loading states and micro-interactions

### Backend Structure
```
server/
├── config/db.js           # MongoDB connection with retry logic
├── models/
│   ├── User.js            # Recruiter: email, password (bcrypt), name
│   ├── Resume.js          # Candidate data + raw text
│   └── Job.js             # Job description + raw text
├── middleware/auth.js     # JWT verification middleware
├── routes/
│   ├── auth.js            # POST /register, /login, GET /me
│   ├── resumes.js         # PDF upload, text extraction, CRUD
│   └── jobs.js            # Job description CRUD
└── server.js              # Express entry with CORS, error handling
```

### Frontend Structure
```
client/src/
├── api.js                 # Axios + JWT interceptor
├── context/AuthContext.jsx
├── pages/
│   ├── Login.jsx          # Gradient background, glassmorphism card
│   ├── Register.jsx       # Form validation, password strength
│   └── Dashboard.jsx      # Tabbed interface, stats overview
└── components/
    ├── ResumeUpload.jsx   # Drag-drop zone with progress
    ├── ResumeList.jsx     # Card grid with hover effects
    ├── JobForm.jsx        # Rich text input
    └── JobList.jsx        # Card grid with actions
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create recruiter account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user info |
| POST | `/api/resumes` | Upload PDF resume |
| GET | `/api/resumes` | List all resumes |
| DELETE | `/api/resumes/:id` | Remove resume |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | List all jobs |
| DELETE | `/api/jobs/:id` | Remove job |

---

## PART 2: Resume and Job Profiling ✅ COMPLETED

### Objective
Extract structured profiles from raw text using NLP pattern matching with skill normalization.

### 🎨 Creative Features
- **Color-coded skill tags** by category (programming=blue, frontend=purple, etc.)
- **Confidence indicators** (★) for high-confidence skill matches
- **Experience timeline** visualization
- **Education badges** with degree icons

### Skill Normalization System
```javascript
// 90+ skill aliases mapped to canonical forms
"JS" | "Javascript" | "ES6" → "javascript"
"React.js" | "ReactJS" | "React" → "react"
"ML" | "Machine Learning" | "Deep Learning" → "machine_learning"

// Categories for visual grouping
programming: blue    │ frontend: purple  │ backend: green
database: orange     │ cloud: cyan       │ ai_ml: pink
```

### Profile Schema
```javascript
profile: {
  skills: [{
    name: "javascript",
    category: "programming",
    confidence: 0.9,        // Based on mention frequency
    matchCount: 5
  }],
  experience: [{
    title: "Software Engineer",
    company: "TechCorp",
    years: 3
  }],
  education: [{
    level: "bachelors",     // doctorate, masters, bachelors
    field: "Computer Science",
    institution: "MIT"
  }],
  totalYearsExperience: 5,
  summary: "Extracted summary...",
  profiledAt: Date
}
```

### Services
```
server/services/
├── skillNormalizer.js     # Alias mapping, category classification
└── profiler.js            # extractSkills, extractExperience, extractEducation
```

---

## PART 3: Semantic Feature Extraction (Job Roles) ✅ COMPLETED

### Objective
Generate semantic embeddings for job descriptions using Hugging Face Inference API.

### 🎨 Creative Features
- **Embedding status badges** (Ready/Processing/Failed)
- **Semantic similarity preview** between jobs
- **Skill cluster visualization** using embedding distances
- **Auto-retry** on API failures with exponential backoff

### Hugging Face Integration
```javascript
// Model: sentence-transformers/all-MiniLM-L6-v2 (FREE tier)
// Output: 384-dimensional dense vector

const response = await fetch(
  'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
  {
    headers: { Authorization: `Bearer ${HF_API_KEY}` },
    method: 'POST',
    body: JSON.stringify({ inputs: jobDescription })
  }
);
```

### Smart Text Preparation
```javascript
// Combine structured + raw for rich embedding
const textForEmbedding = [
  `Job Title: ${job.title}`,
  `Required Skills: ${profile.requiredSkills.map(s => s.name).join(', ')}`,
  `Experience Required: ${profile.totalYearsRequired} years`,
  job.rawText.substring(0, 500)  // First 500 chars of description
].join('\n');
```

### Backend Implementation
```
server/services/
├── huggingFaceClient.js   # API client with retry logic, rate limiting
└── jobEmbedding.js        # Job-specific embedding preparation

server/models/Job.js       # Add fields:
  - embedding: [Number]     // 384-dim vector
  - embeddingGeneratedAt: Date
  - embeddingStatus: String // 'pending', 'ready', 'failed'
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/:id/embed` | Generate/regenerate embedding |
| GET | `/api/jobs/:id/embedding-status` | Check embedding status |
| POST | `/api/jobs/batch-embed` | Embed multiple jobs |

### Environment Variables
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## PART 4: Semantic Feature Extraction (Resumes) ✅ COMPLETED

### Objective
Generate resume embeddings with skill phrase normalization for semantic matching.

### 🎨 Creative Features
- **Profile completeness meter** (circular progress indicator)
- **Skill cloud visualization** based on confidence
- **Similar candidates** suggestion using embedding similarity
- **Embedding quality score** indicator

### Smart Resume Text Preparation
```javascript
// Create semantically rich text for embedding
const textForEmbedding = [
  `Candidate Profile`,
  `Skills: ${profile.skills.map(s => s.name).join(', ')}`,
  `Experience: ${profile.experience.map(e => e.title).join(', ')}`,
  `Total Experience: ${profile.totalYearsExperience} years`,
  `Education: ${profile.education.map(e => `${e.level} in ${e.field}`).join(', ')}`,
  profile.summary
].join('\n');
```

### Skill Ambiguity Resolution
```javascript
// Use cosine similarity between individual skill embeddings
const skillSimilarities = await computeSkillSimilarities(candidateSkills, jobSkills);

// Detect semantic matches even with different names
// "Machine Learning" ≈ "ML" ≈ "Deep Learning" (similarity > 0.8)
const semanticMatches = skillSimilarities.filter(s => s.similarity > 0.75);
```

### Backend Implementation
```
server/services/
├── resumeEmbedding.js     # Resume-specific text preparation
└── skillMatcher.js        # Semantic skill similarity computation

server/models/Resume.js    # Add fields:
  - embedding: [Number]
  - embeddingGeneratedAt: Date
  - embeddingStatus: String
  - profileCompleteness: Number  // 0-100%
```

### Profile Completeness Calculation
```javascript
completeness = {
  hasSkills: skills.length > 0 ? 25 : 0,
  hasExperience: experience.length > 0 ? 25 : 0,
  hasEducation: education.length > 0 ? 20 : 0,
  hasSummary: summary.length > 50 ? 15 : 0,
  hasEmbedding: embedding ? 15 : 0
}
// Total: 0-100%
```

---

## PART 5: Resume-to-Role Matching Engine ✅ COMPLETED

### Objective
Implement intelligent matching combining semantic similarity with structured skill analysis + visual results.

### 🎨 Creative Features
- **Match score dial** - Animated circular gauge (0-100%)
- **Skill match matrix** - Visual grid showing matched/missing skills
- **Score breakdown chart** - Bar chart of individual components
- **Match explanation** - Human-readable interpretation
- **Quick actions** - Shortlist, reject, or compare from match results

### Matching Algorithm
```javascript
const matchScore = {
  semantic: cosineSimilarity(resumeEmbed, jobEmbed),  // 40% weight
  skillMatch: calculateSkillOverlap(candidateSkills, requiredSkills),  // 40%
  experience: Math.min(candidateYears / requiredYears, 1.2),  // 20%
  final: (semantic * 0.4) + (skillMatch * 0.4) + (experience * 0.2)
};
```

### Backend Implementation
```
server/services/
├── matchingEngine.js          # Core matching orchestration
├── skillOverlap.js            # Skill matching logic
└── interpretationGenerator.js # Human-readable explanations

server/routes/matching.js
server/models/Match.js
```

### Frontend - Matching Page
```
client/src/pages/MatchingView.jsx
client/src/components/
├── ScoreGauge.jsx, ScoreBreakdown.jsx, SkillMatrix.jsx, MatchCard.jsx
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/match/job/:jobId` | Run matching for all resumes |
| GET | `/api/match/job/:jobId/results` | Get cached match results |
| PUT | `/api/match/:matchId/status` | Update status (shortlist/reject) |

---

## PART 6: Professional UI Overhaul + Theme System + Landing Page ✅ COMPLETED

### Objective
Replace gamified UI with a clean, enterprise-grade design. Add dark/light theme, professional sidebar navigation, and animated public landing page.

### Theme System (Dark + Light Mode)
- `ThemeContext` with `useTheme()` hook — stores preference in `localStorage`
- CSS custom properties for all colors, backgrounds, borders, shadows
- Toggle switch in header (sun/moon icon with smooth rotation)
- System preference detection (`prefers-color-scheme`)
- All existing components retrofitted to use theme variables

### Sidebar Navigation (Replacing Top Tabs)
- Collapsible sidebar with icon-only collapsed mode
- Sections: Dashboard, Resumes, Jobs, Matching, Analytics, Settings
- Active route highlighting with smooth indicator
- User avatar + name at bottom with dropdown (Profile, Logout)
- Mobile: slide-out drawer with overlay

### Landing Page (Public, No Auth)
- Hero section with headline, subtext, CTA buttons (Login / Register)
- Feature showcase cards (AI Matching, Skill Analysis, Credibility Scoring)
- How It Works section (3-step flow with icons)
- Technology badges, footer with links
- Smooth scroll animations on viewport entry

### Professional Design Tokens
- **Light mode:** White/gray backgrounds, slate-700 text, blue-600 accents, soft shadows
- **Dark mode:** Slate-900/800 backgrounds, slate-100 text, blue-500 accents, subtle borders
- Typography: `Inter` font (clean, professional)
- Remove all emoji from UI buttons — use proper icons or text labels
- Status badges: muted colored backgrounds, not bright pills
- Rounded corners: 8px, subtle shadows

### Loading & Error States
- Skeleton loaders, empty state illustrations, error boundary with retry
- Breadcrumb navigation on inner pages

### Files
```
client/src/
├── context/ThemeContext.jsx           [NEW]
├── layouts/AppLayout.jsx             [NEW]
├── layouts/PublicLayout.jsx          [NEW]
├── pages/Landing.jsx                 [NEW]
├── components/Sidebar.jsx            [NEW]
├── components/Breadcrumb.jsx         [NEW]
├── components/SkeletonLoader.jsx     [NEW]
├── components/EmptyState.jsx         [NEW]
├── components/ErrorBoundary.jsx      [NEW]
└── index.css                         [MODIFY]
```

---

## PART 7: Multi-Role Authentication + Candidate Portal ✅ COMPLETED

### Objective
Add role-based auth (Recruiter vs Candidate). Candidates get a self-service portal to build profiles, browse jobs, and apply. Recruiters keep existing workflow plus new pipeline views.

### Role-Based Registration & Login
- Registration form with role picker: **Recruiter** or **Candidate**
- User model extended with `role` enum (`recruiter`, `candidate`)
- Middleware: `requireRole('recruiter')`, `requireRole('candidate')`
- Route guards: redirect to correct dashboard based on role

### Candidate Dashboard
- **My Profile** — Name, email, bio, skills (editable), experience, education
- **Upload Resume** — PDF upload linked to candidate's account
- **Browse Jobs** — All open jobs posted by recruiters
- **Apply to Job** — One-click apply (creates Application record)
- **My Applications** — Track status: Applied → Shortlisted → Interview → Offered → Hired / Rejected
- **Application status updates** — Visual pipeline with colored step indicators

### Recruiter Dashboard (Enhanced)
- Existing: upload resumes, create jobs, run matching
- New: **Applications inbox** — see candidates who applied for each job
- New: **Pipeline view** — list view of application stages
- New: **Quick status update** — move candidates through stages

### Application Model
```javascript
{
  candidateId: ObjectId,
  jobId: ObjectId,
  resumeId: ObjectId,
  status: enum ['applied', 'screening', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'],
  appliedAt: Date,
  statusHistory: [{ status, changedAt, changedBy }],
  recruiterNotes: String
}
```

### Public Job Board
- `/jobs` — publicly accessible (no auth required)
- Job cards with title, skills required, posted date
- Search by keyword, filter by skills
- Click job → full description + "Apply" button (redirects to login if not auth'd)

### Files
```
server/
├── models/Application.js               [NEW]
├── routes/applications.js              [NEW]
├── middleware/roleGuard.js             [NEW]
├── models/User.js                      [MODIFY] — add role field

client/src/
├── pages/CandidateDashboard.jsx        [NEW]
├── pages/RecruiterDashboard.jsx        [NEW] — refactored from Dashboard.jsx
├── pages/JobBoard.jsx                  [NEW]
├── pages/ApplicationTracker.jsx        [NEW]
├── components/ApplicationPipeline.jsx  [NEW]
├── components/JobCard.jsx              [NEW]
├── components/StatusStepper.jsx        [NEW]
├── pages/Login.jsx                     [MODIFY]
├── pages/Register.jsx                  [MODIFY]
├── App.jsx                             [MODIFY]
```

### API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications` | Candidate | Apply to a job |
| GET | `/api/applications/my` | Candidate | Get my applications |
| GET | `/api/applications/job/:jobId` | Recruiter | Get applications for a job |
| PUT | `/api/applications/:id/status` | Recruiter | Update application status |
| GET | `/api/jobs/public` | None | Browse all open jobs |
| GET | `/api/jobs/public/:id` | None | View single job details |

---

## PART 8: Exaggeration Detection + Credibility Scoring ⏳ PENDING

### Objective
Detect unrealistic or exaggerated skill claims in resumes and produce a trust/credibility score.

### Detection Rules
- **Technology age validation** — Can't claim 15 years of React (released 2013)
- **Expert overload** — Flagging resumes with 10+ "expert"-level claims
- **Career consistency** — Overlapping employment dates
- **Skill-experience mismatch** — Claiming advanced skills with minimal experience

### Credibility Scoring
- 0-100 credibility score per resume
- Penalty tiers: None (0%), Minor (-5%), Moderate (-15%), Severe (-30%)
- Score impacts match ranking visibility (low credibility = warning badge)

### Frontend Display
- **Credibility badge** on resume cards (High / Medium / Low trust)
- **Red flag panel** in expanded resume view with explanations
- **Impact indicator** — shows how much score was reduced

### Fair Comparison Mode
- Dynamic weight rebalancing for candidates with incomplete profiles
- Confidence intervals for sparse data

### Files
```
server/services/exaggerationDetector.js, credibilityCalculator.js, fairnessAdjuster.js  [NEW]
server/routes/credibility.js                                                              [NEW]
client/src/components/CredibilityBadge.jsx, RedFlagPanel.jsx                              [NEW]
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/credibility/resume/:id` | Get credibility report |
| POST | `/api/credibility/analyze` | Run analysis on a resume |

---

## PART 9: Candidate Ranking, Stability & Comparison ⏳ PENDING

### Objective
Produce stable, fair rankings with sensitivity analysis and side-by-side candidate comparison.

### Ranking System
- Multi-factor ranking: match score × credibility × recency
- Rank movement indicators (↑ ↓ —), ranking history per job

### Stability Analysis
- "What if candidate adds Docker?" sensitivity testing
- Weight perturbation: ±10% → check rank changes
- Stability indicator: Stable (green), Moderate (yellow), Volatile (red)

### Side-by-Side Comparison
- Select 2-3 candidates → comparison view
- Columns: scores, skills, experience, education, credibility
- Skill radar/spider chart — visual coverage overlay

### Recruiter Notes & Annotations
- Private notes per candidate per job, note history with timestamp
- Quick templates ("Strong technical," "Schedule interview")

### Files
```
server/services/rankingEngine.js, stabilityTester.js       [NEW]
server/models/Ranking.js, Note.js                          [NEW]
server/routes/rankings.js, candidates.js, comparison.js    [NEW]
client/src/pages/CompareView.jsx                           [NEW]
client/src/components/RankingTable.jsx, StabilityBadge.jsx, SkillRadar.jsx,
                      ComparisonGrid.jsx, NoteEditor.jsx   [NEW]
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rankings/job/:jobId` | Get ranked candidates |
| POST | `/api/rankings/job/:jobId/analyze` | Stability analysis |
| POST | `/api/rankings/sensitivity` | "What-if" analysis |
| POST | `/api/compare` | Compare selected candidates |
| GET | `/api/candidates/:id/full` | Full candidate profile |
| POST/GET | `/api/candidates/:id/notes` | Add/get recruiter notes |

---

## PART 10: Analytics Dashboard & Visualizations ⏳ PENDING

### Objective
Comprehensive analytics page with KPIs, charts, and actionable insights.

### KPI Overview Cards
- Total candidates, active jobs, avg match score, shortlist rate
- Animated counter effect, trend indicators (↑ 12% vs last week)

### Charts (using Recharts)
- **Score distribution** — histogram of match scores per job
- **Skill gap analysis** — bar chart of most-missing skills
- **Hiring funnel** — Applications → Screened → Shortlisted → Interviewed → Hired
- **Activity timeline** — recent events feed

### Interactive Ranking Table
- Sort, filter, bulk actions, inline status update

### Files
```
server/services/metricsService.js, routes/metrics.js      [NEW]
client/src/pages/Analytics.jsx                             [NEW]
client/src/components/StatsCard.jsx, MatchDistribution.jsx,
                      SkillGapChart.jsx, HiringFunnel.jsx, ActivityFeed.jsx  [NEW]
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/overview` | Dashboard summary KPIs |
| GET | `/api/metrics/job/:id` | Job-specific analytics |
| GET | `/api/metrics/skill-gaps` | Skill gap analysis data |
| GET | `/api/metrics/activity` | Recent activity feed |

---

## PART 11: Notifications, Settings & Communication ⏳ PENDING

### Objective
Add notification system, user settings with matching weight customization, and in-app status updates.

### Toast Notifications
- `ToastProvider` context with `useToast()` hook
- Types: success, error, warning, info — auto-dismiss with progress bar

### Notification Center
- Bell icon in header with unread count badge
- Dropdown notification list, mark as read / mark all as read
- Types: match completed, application received, status changed

### Settings Page
- **Profile:** Edit name, email, change password
- **Matching Weights:** Sliders for Semantic/Skill/Experience (must sum to 100%)
- **Theme:** Dark/Light toggle (synced with Part 6 ThemeContext)
- **Notifications:** Toggle which types to receive
- Settings persisted in database per user

### In-App Communication
- Recruiter status notes visible to candidate
- System-generated messages for status transitions

### Files
```
server/models/Notification.js, UserSettings.js, routes/notifications.js, routes/settings.js  [NEW]
client/src/pages/Settings.jsx                                                                  [NEW]
client/src/components/NotificationBell.jsx, ToastProvider.jsx, WeightSlider.jsx                [NEW]
client/src/context/NotificationContext.jsx, SettingsContext.jsx                                 [NEW]
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| GET/PUT | `/api/settings` | Get/update settings |
| PUT | `/api/auth/profile` | Update name/email/password |

---

## PART 12: Export, Batch Operations & Final Polish ⏳ PENDING

### Objective
Add PDF/CSV export, batch operations, multi-file upload, global search, and final refinements.

### Export & Reports
- **PDF report per job** — formatted with rankings, scores, skill analysis
- **CSV export** — rankings as spreadsheet download
- **Individual resume report** — one-page PDF summary

### Batch Operations
- Bulk delete, bulk embed, bulk shortlist/reject
- Multi-file upload (drag-n-drop multiple PDFs)

### Global Search (Ctrl+K)
- Command palette overlay — search candidates, jobs, matches
- Quick actions: navigate, run matching
- Keyboard shortcut: `Ctrl+K` / `Cmd+K`

### Job Management
- Archive/close jobs, duplicate postings, edit details

### Final Polish
- Mobile responsive, keyboard navigation, smooth page transitions
- Consistent hover states, favicon, page titles per route, 404 page

### Files
```
server/services/pdfGenerator.js, csvExporter.js, batchProcessor.js, routes/exports.js  [NEW]
client/src/components/ExportButton.jsx, BatchActions.jsx, MultiUpload.jsx,
                      CommandPalette.jsx                                                [NEW]
client/src/pages/NotFound.jsx                                                           [NEW]
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/job/:id/pdf` | Download PDF report |
| GET | `/api/export/job/:id/csv` | Download CSV ranking |
| GET | `/api/export/resume/:id/pdf` | Resume summary PDF |
| POST | `/api/batch/delete-resumes` | Bulk delete |
| POST | `/api/batch/embed-all` | Bulk embed |
| POST | `/api/batch/update-status` | Bulk status update |
| POST | `/api/resumes/multi-upload` | Upload multiple PDFs |
| GET | `/api/search?q=` | Global search |

---

## 🔧 Technology Stack Summary

### Backend
| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| PDF Parsing | pdf-parse-new |
| PDF Generation | pdfkit |
| AI/Embeddings | @huggingface/transformers (local) |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Axios |
| Charts | Recharts |
| Animations | CSS transitions + framer-motion |
| Font | Inter (Google Fonts) |

### AI/NLP
| Component | Details |
|-----------|---------|
| Model | Xenova/all-MiniLM-L6-v2 |
| Vector Size | 384 dimensions |
| Runtime | Transformers.js (local, no API key) |
| Similarity | Cosine similarity |

---

## 📁 Final Project Structure

```
SkillSense/
├── server/
│   ├── config/db.js
│   ├── middleware/auth.js, roleGuard.js
│   ├── models/
│   │   ├── User.js, Resume.js, Job.js
│   │   ├── Match.js, Application.js, Ranking.js
│   │   ├── Notification.js, Note.js, UserSettings.js
│   ├── routes/
│   │   ├── auth.js, resumes.js, jobs.js
│   │   ├── matching.js, applications.js, rankings.js, metrics.js
│   │   ├── candidates.js, comparison.js, credibility.js
│   │   ├── notifications.js, settings.js, exports.js
│   ├── services/
│   │   ├── profiler.js, skillNormalizer.js
│   │   ├── huggingFaceClient.js, jobEmbedding.js, resumeEmbedding.js
│   │   ├── matchingEngine.js, skillOverlap.js, interpretationGenerator.js
│   │   ├── exaggerationDetector.js, credibilityCalculator.js, fairnessAdjuster.js
│   │   ├── rankingEngine.js, stabilityTester.js
│   │   ├── metricsService.js, pdfGenerator.js, csvExporter.js, batchProcessor.js
│   ├── .env, package.json, server.js
├── client/
│   ├── src/
│   │   ├── api.js
│   │   ├── context/ (AuthContext, ThemeContext, NotificationContext, SettingsContext)
│   │   ├── layouts/ (AppLayout, PublicLayout)
│   │   ├── pages/ (Landing, Login, Register, RecruiterDashboard, CandidateDashboard,
│   │   │          JobBoard, ApplicationTracker, MatchingView,
│   │   │          CompareView, Analytics, Settings, NotFound)
│   │   ├── components/ (Sidebar, Breadcrumb, ResumeUpload, ResumeList,
│   │   │               JobForm, JobList, JobCard, StatsCard, ScoreGauge,
│   │   │               ScoreBreakdown, SkillMatrix, SkillRadar, MatchCard,
│   │   │               RankingTable, StabilityBadge, ComparisonGrid,
│   │   │               ActivityFeed, MatchDistribution, SkillGapChart,
│   │   │               HiringFunnel, NoteEditor, NotificationBell,
│   │   │               ToastProvider, WeightSlider, ExportButton, BatchActions,
│   │   │               MultiUpload, CommandPalette, SkeletonLoader, EmptyState,
│   │   │               ErrorBoundary, CredibilityBadge, RedFlagPanel,
│   │   │               ApplicationPipeline, StatusStepper)
│   │   ├── App.jsx, main.jsx
│   ├── index.html, package.json, vite.config.js
├── implementation_plan.md
├── LAB_REPORT.md, PROGRESS.md, README.md
```

---

## ✅ Progress Tracker

| Part | Description | Status | Complexity |
|------|-------------|--------|------------|
| 1 | Authentication + Upload | ✅ Complete | ⭐⭐ |
| 2 | Resume/Job Profiling | ✅ Complete | ⭐⭐⭐ |
| 3 | Job Embeddings (Transformers.js) | ✅ Complete | ⭐⭐⭐ |
| 4 | Resume Embeddings | ✅ Complete | ⭐⭐⭐ |
| 5 | Matching Engine | ✅ Complete | ⭐⭐⭐⭐ |
| 6 | Professional UI + Theme + Landing | ✅ Complete | ⭐⭐⭐⭐⭐ |
| 7 | Multi-Role Auth + Candidate Portal | ⏳ Next | ⭐⭐⭐⭐⭐ |
| 8 | Exaggeration Detection + Credibility | ⏳ Pending | ⭐⭐⭐⭐ |
| 9 | Ranking, Stability & Comparison | ⏳ Pending | ⭐⭐⭐⭐ |
| 10 | Analytics Dashboard | ⏳ Pending | ⭐⭐⭐⭐⭐ |
| 11 | Notifications, Settings & Communication | ⏳ Pending | ⭐⭐⭐ |
| 12 | Export, Batch Ops & Final Polish | ⏳ Pending | ⭐⭐⭐⭐ |

---

## 🚀 Quick Start Commands

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

---

> 💡 **Note**: Say "Start Part X" to begin implementing any pending part. Each part builds on the previous ones.
