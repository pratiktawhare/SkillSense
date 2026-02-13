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
- 🎨 **Beautiful UI** — Modern glassmorphism design with Tailwind CSS
- 🤖 **Semantic Embeddings** — 384-dimensional vectors for jobs and resumes (local, no API key)
- 📊 **Profile Completeness** — Weighted quality scoring for each resume
- 🔄 **Background Processing** — Embeddings generated asynchronously
- 📋 **Expandable Cards** — Click resume/job cards to see full details, skills grouped by category
- 🎯 **Smart Matching** — Semantic similarity + skill overlap + experience scoring with weighted algorithm
- 📊 **Score Breakdown** — Visual bars showing Semantic (40%), Skills (40%), Experience (20%) contribution
- 🏆 **Candidate Ranking** — Ranked results with gold/silver/bronze badges and tier classification
- ✅❌🎁 **Skill Matrix** — Matched, missing, and bonus skills with coverage bar
- 👍👎 **Quick Actions** — Shortlist, reject, and reset candidate status

### Upcoming 🚧
- ⚠️ **Exaggeration Detection** — Flag unrealistic claims with credibility scoring
- 📊 **Stability Analysis** — Sensitivity testing and "what-if" scenarios
- 📈 **Analytics Dashboard** — Stats cards, charts, and activity feeds
- 👤 **Candidate Profiles** — Full detail pages with match history
- ⚖️ **Side-by-Side Compare** — Compare 2-3 candidates visually
- 🔔 **Notifications** — Toast alerts and notification center
- ⚙️ **Settings** — Matching weight customization and theme toggle
- 📥 **Export Reports** — PDF and CSV export for matching results
- 🚀 **Landing Page** — Animated public landing page with sidebar navigation

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+ with Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT tokens + bcryptjs password hashing
- **File Handling:** Multer + pdf-parse-new
- **AI:** Transformers.js (`Xenova/all-MiniLM-L6-v2`) — runs 100% locally

### Frontend
- **Framework:** React 18 + Vite (fast dev server)
- **Styling:** Tailwind CSS 3 with custom glassmorphism theme
- **Routing:** React Router v6
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
├── server/                    # Backend API
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/auth.js     # JWT middleware
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # Recruiter accounts
│   │   ├── Resume.js          # Resumes + embeddings
│   │   ├── Job.js             # Jobs + embeddings
│   │   └── Match.js           # Match scores + skill analysis
│   ├── routes/                # API endpoints
│   │   ├── auth.js            # Register/Login
│   │   ├── resumes.js         # Resume CRUD + embedding
│   │   ├── jobs.js            # Job CRUD + embedding
│   │   └── matching.js        # Run matching + results + status
│   ├── services/              # Business logic
│   │   ├── profiler.js        # Skill/experience extraction
│   │   ├── skillNormalizer.js  # 90+ alias mapping
│   │   ├── huggingFaceClient.js # Transformers.js wrapper
│   │   ├── jobEmbedding.js    # Job embedding generation
│   │   ├── resumeEmbedding.js # Resume embedding + completeness
│   │   ├── matchingEngine.js  # Core matching algorithm
│   │   ├── skillOverlap.js    # Skill overlap analysis utilities
│   │   └── interpretationGenerator.js # Match explanations
│   └── server.js              # Express entry point
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── ResumeList.jsx # Expandable resume cards
│   │   │   ├── JobForm.jsx
│   │   │   ├── JobList.jsx    # Expandable job cards
│   │   │   ├── MatchCard.jsx  # Match result card with actions
│   │   │   ├── ScoreGauge.jsx # Animated circular score dial
│   │   │   ├── ScoreBreakdown.jsx # Score component bars
│   │   │   └── SkillMatrix.jsx # Skill match visualization
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── MatchingView.jsx # Matching page
│   │   ├── context/AuthContext.jsx
│   │   └── api.js             # Axios API client
│   └── index.html
├── implementation_plan.md     # Full 12-part development plan
├── PROGRESS.md                # Feature progress tracker
├── LAB_REPORT.md              # Lab report for all parts
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
| 6 | Exaggeration Detection | ⏳ Pending |
| 7 | Ranking + Stability | ⏳ Pending |
| 8 | Analytics Dashboard | ⏳ Pending |
| 9 | Candidate Detail + Comparison | ⏳ Pending |
| 10 | Notifications + Settings | ⏳ Pending |
| 11 | Export, Reports & Batch Ops | ⏳ Pending |
| 12 | Landing Page + Sidebar + Polish | ⏳ Pending |

## 📄 License

This project is part of an academic/internship project.

## 👨‍💻 Author

Built with ❤️ as part of the SkillSense AI recruitment platform project.
