# SkillSense 🎯

> AI-Driven Resume-to-Role Matching Platform

An intelligent recruitment platform that uses semantic AI to match candidates with job roles. Built with React, Node.js, MongoDB, and local Transformers.js embeddings — no external API keys required.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)
![Tech Stack](https://img.shields.io/badge/Transformers.js-AI-purple?logo=huggingface)

## ✨ Features

### Implemented ✅
- 🔐 **Secure Authentication** — JWT-based recruiter login/register with bcrypt hashing
- 📄 **PDF Resume Parsing** — Upload PDF resumes with automatic text extraction
- 🧠 **AI-Powered Profiling** — Extract skills, experience, and education using NLP
- 🏷️ **Skill Normalization** — 90+ skill aliases mapped to canonical forms with categories
- 🎨 **Professional UI** — Dark/light theme with CSS variables, Inter font, sidebar navigation
- 🤖 **Semantic Embeddings** — 384-dimensional vectors for jobs and resumes (local, no API key)
- 📊 **Profile Completeness** — Weighted quality scoring for each resume
- 🔄 **Background Processing** — Embeddings generated asynchronously
- 📋 **Expandable Cards** — Click resume/job cards to see full details, skills grouped by category
- 🎯 **Smart Matching** — Semantic similarity + skill overlap + experience scoring with weighted algorithm
- 📊 **Score Breakdown** — Visual bars showing Semantic (40%), Skills (40%), Experience (20%) contribution
- 🏆 **Candidate Ranking** — Ranked results with gold/silver/bronze badges and tier classification
- ✅❌🎁 **Skill Matrix** — Matched, missing, and bonus skills with coverage bar
- 👍👎 **Quick Actions** — Shortlist, reject, and reset candidate status
- 🌓 **Dark/Light Theme** — Toggle with system preference detection and localStorage persistence
- 📐 **Sidebar Navigation** — Collapsible sidebar with SVG icons, mobile overlay
- 🏠 **Landing Page** — Animated public landing page with feature cards, tech stack, how-it-works
- 👥 **Multi-Role Auth** — Role-based access for Recruiters and Candidates
- 📋 **Candidate Portal** — Self-service profile, job browsing, and application tracking
- 💼 **Job Board** — Public job listing with advanced search and filtering
- 🛤️ **Application Pipeline** — Visual status tracking (Applied → Screening → Offered)
- ⚠️ **Exaggeration Detection** — Flag unrealistic claims with credibility scoring
- 🛡️ **Credibility Scoring** — 0-100 trust score with red flag detection
- ⚖️ **Side-by-Side Compare** — Compare 2-3 candidates visually with composite ranking scores
- 📈 **Analytics Dashboard** — Stats cards, charts, and activity feeds
- 🔔 **Notifications** — Toast alerts and notification center
- ⚙️ **Settings & Customization** — Modify the algorithm weights, customize profile and toggle System themes across UI.
- ⚡ **Command Palette** — Ctrl+K global navigation.
- 📄 **PDF/CSV Export** — Downloadable job matching reports and candidate profile PDFs
- 📦 **Batch Operations** — Multi-file upload, bulk delete, and batch status updates
- 🚫 **404 Page** — Polished not-found page with navigation

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+ with Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT tokens + bcryptjs password hashing
- **File Handling:** Multer + pdf-parse-new
- **AI:** Transformers.js (`Xenova/all-MiniLM-L6-v2`) — runs 100% locally

### Frontend
- **Framework:** React 18 + Vite (fast dev server)
- **Styling:** Tailwind CSS 4 + CSS variables theme system (dark/light)
- **Charts:** Recharts (analytics visualizations)
- **Routing:** React Router v6 with nested layouts
- **HTTP Client:** Axios with JWT interceptor

### AI / NLP
- **Model:** all-MiniLM-L6-v2 (sentence-transformers)
- **Vector Size:** 384 dimensions
- **Runtime:** Transformers.js (local inference, no API key needed)
- **Similarity:** Cosine similarity for semantic matching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skillsense.git
cd skillsense
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsense
JWT_SECRET=your_secret_key_here
```

Start the server:
```bash
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
SkillSense/
├── server/                          # Backend API
│   ├── config/db.js                 # MongoDB connection
│   ├── middleware/auth.js           # JWT verification middleware
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # User accounts (recruiter/candidate)
│   │   ├── Resume.js                # Resumes + embeddings + credibility
│   │   ├── Job.js                   # Jobs + embeddings
│   │   ├── Match.js                 # Match scores + skill analysis
│   │   ├── Application.js           # Job applications + history
│   │   ├── Note.js                  # Recruiter notes per candidate
│   │   ├── Notification.js          # User notifications
│   │   └── UserSettings.js          # User preferences + matching weights
│   ├── routes/                      # API endpoints
│   │   ├── auth.js                  # Register/Login
│   │   ├── resumes.js               # Resume CRUD + embedding
│   │   ├── jobs.js                  # Job CRUD + embedding
│   │   ├── matching.js              # Run matching + results + status
│   │   ├── applications.js          # Application pipeline management
│   │   ├── credibility.js           # Credibility analysis endpoints
│   │   ├── rankings.js              # Ranking + compare + notes
│   │   ├── metrics.js               # Analytics data endpoints
│   │   ├── notifications.js         # Notification CRUD
│   │   └── settings.js              # User settings management
│   ├── services/                    # Business logic
│   │   ├── profiler.js              # Skill/experience extraction
│   │   ├── skillNormalizer.js        # 90+ alias mapping
│   │   ├── huggingFaceClient.js     # Transformers.js wrapper
│   │   ├── jobEmbedding.js          # Job embedding generation
│   │   ├── resumeEmbedding.js       # Resume embedding + completeness
│   │   ├── matchingEngine.js        # Core matching algorithm
│   │   ├── skillOverlap.js          # Skill overlap analysis
│   │   ├── interpretationGenerator.js # Match explanations
│   │   ├── exaggerationDetector.js  # Resume red flag detection
│   │   ├── credibilityCalculator.js # 0-100 trust scoring
│   │   ├── rankingEngine.js         # Multi-factor ranking + sensitivity
│   │   └── metricsService.js        # Analytics aggregation service
│   └── server.js                    # Express entry point
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── Sidebar.jsx          # Collapsible sidebar navigation
│   │   │   ├── Breadcrumb.jsx       # Auto-generated breadcrumbs
│   │   │   ├── SkeletonLoader.jsx   # Loading placeholders
│   │   │   ├── EmptyState.jsx       # Empty data display
│   │   │   ├── ErrorBoundary.jsx    # Crash recovery
│   │   │   ├── ResumeUpload.jsx     # Drag-and-drop resume upload
│   │   │   ├── ResumeList.jsx       # Expandable resume cards
│   │   │   ├── JobForm.jsx          # Job creation form
│   │   │   ├── JobList.jsx          # Expandable job cards
│   │   │   ├── MatchCard.jsx        # Match result card with actions
│   │   │   ├── ScoreGauge.jsx       # Animated circular score dial
│   │   │   ├── ScoreBreakdown.jsx   # Score component bars
│   │   │   ├── SkillMatrix.jsx      # Skill match visualization
│   │   │   ├── CredibilityBadge.jsx # Trust score badge
│   │   │   ├── RedFlagPanel.jsx     # Exaggeration details panel
│   │   │   ├── RankingTable.jsx     # Multi-factor ranking view
│   │   │   ├── NoteEditor.jsx       # Recruiter notes per candidate
│   │   │   ├── StatusStepper.jsx    # Application stage stepper
│   │   │   ├── StatsCard.jsx        # Analytics KPI card
│   │   │   ├── MatchDistribution.jsx # Score distribution chart
│   │   │   ├── HiringFunnel.jsx     # Pipeline funnel chart
│   │   │   ├── SkillGapChart.jsx    # Missing skills analysis
│   │   │   ├── ActivityFeed.jsx     # Recent activity timeline
│   │   │   ├── NotificationBell.jsx # Header notification dropdown
│   │   │   ├── CommandPalette.jsx   # Ctrl+K global navigation
│   │   │   └── MessageModal.jsx     # In-app candidate messaging
│   │   ├── layouts/                 # Layout wrappers
│   │   │   ├── AppLayout.jsx        # Sidebar + header + content
│   │   │   └── PublicLayout.jsx     # Public pages wrapper
│   │   ├── pages/                   # Page components
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Login.jsx            # Authentication
│   │   │   ├── Register.jsx         # Account creation
│   │   │   ├── DashboardOverview.jsx # Recruiter overview
│   │   │   ├── ResumesPage.jsx      # Resume management
│   │   │   ├── JobsPage.jsx         # Job management
│   │   │   ├── MatchingPage.jsx     # Matching wrapper
│   │   │   ├── MatchingView.jsx     # Matching engine UI
│   │   │   ├── CompareView.jsx      # Side-by-side comparison
│   │   │   ├── Analytics.jsx        # Analytics dashboard
│   │   │   ├── Settings.jsx         # User settings page
│   │   │   ├── ApplicationPipeline.jsx # Recruiter applicant view
│   │   │   ├── CandidateDashboard.jsx  # Candidate overview
│   │   │   ├── JobBoard.jsx         # Public job listing
│   │   │   └── ApplicationTracker.jsx  # Candidate application history
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   ├── ThemeContext.jsx      # Dark/light theme state
│   │   │   ├── ToastContext.jsx     # Toast notification system
│   │   │   ├── NotificationContext.jsx # Notification management
│   │   │   └── SettingsContext.jsx   # User settings state
│   │   └── api.js                   # Axios API client
│   └── index.html
├── implementation_plan.md           # Full 12-part development plan
├── PROGRESS.md                      # Feature progress tracker
├── LAB_REPORT.md                    # Lab report for all parts
└── README.md
```

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsense
JWT_SECRET=your_secret_key
```

> **Note:** No Hugging Face API key needed — embeddings run locally via Transformers.js!

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new recruiter |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes` | Upload resume PDF (auto-profiles & embeds) |
| GET | `/api/resumes` | List all resumes |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/:id/profile` | Regenerate profile |
| POST | `/api/resumes/:id/embed` | Generate/regenerate embedding |
| GET | `/api/resumes/:id/embedding-status` | Check embedding status |
| POST | `/api/resumes/batch-embed` | Batch embed all pending |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job description (auto-profiles & embeds) |
| GET | `/api/jobs` | List all jobs |
| DELETE | `/api/jobs/:id` | Delete job |
| POST | `/api/jobs/:id/profile` | Regenerate profile |
| POST | `/api/jobs/:id/embed` | Generate/regenerate embedding |
| GET | `/api/jobs/:id/embedding-status` | Check embedding status |
| POST | `/api/jobs/batch-embed` | Batch embed all pending |

### Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/match/job/:jobId` | Run matching for all resumes against a job |
| GET | `/api/match/job/:jobId/results` | Get cached match results |
| PUT | `/api/match/:matchId/status` | Update status (shortlist/reject/pending) |

## 🎯 Implementation Progress

| Part | Description | Status |
|------|-------------|--------|
| 1 | Authentication + Upload | ✅ Complete |
| 2 | Resume/Job Profiling | ✅ Complete |
| 3 | Job Embeddings (Transformers.js) | ✅ Complete |
| 4 | Resume Embeddings + Completeness | ✅ Complete |
| 5 | Matching Engine | ✅ Complete |
| 6 | Professional UI + Theme + Landing | ✅ Complete |
| 7 | Multi-Role Auth + Candidate Portal | ✅ Complete |
| 8 | Exaggeration Detection + Credibility | ✅ Complete |
| 9 | Ranking, Stability & Comparison | ✅ Complete |
| 10 | Analytics Dashboard | ✅ Complete |
| 11 | Notifications, Settings & Communication | ✅ Complete |
| 12 | Export, Batch Ops & Final Polish | ✅ Complete |

## 📄 License

This project is part of an academic/internship project.

## 👨‍💻 Author

Built with ❤️ as part of the SkillSense AI recruitment platform project.
