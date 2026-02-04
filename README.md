# SkillSense 🎯

> AI-Driven Resume-to-Role Matching Platform

An intelligent recruitment platform that uses semantic understanding to match candidates with job roles. Built with React, Node.js, MongoDB, and Hugging Face AI.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Tech Stack](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based recruiter authentication
- 📄 **PDF Resume Parsing** - Extract text from PDF resumes automatically
- 🧠 **AI-Powered Profiling** - Extract skills, experience, and education using NLP
- 🎨 **Beautiful UI** - Modern glassmorphism design with Tailwind CSS
- 🏷️ **Skill Normalization** - 90+ skill aliases mapped to canonical forms
- 📊 **Smart Matching** - Semantic similarity + structured skill analysis
- ⚡ **Real-time Updates** - Instant feedback on uploads and matches

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt for auth
- Multer + pdf-parse for file handling
- Hugging Face Inference API for embeddings

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Hugging Face API key (free)

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
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
SkillSense/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── server.js          # Entry point
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── api.js         # API client
│   └── index.html
└── implementation_plan.md  # Detailed development plan
```

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsense
JWT_SECRET=your_secret_key
HUGGINGFACE_API_KEY=hf_xxxxx
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new recruiter |
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/auth/me` | Get current user |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes` | Upload resume PDF |
| GET | `/api/resumes` | List all resumes |
| GET | `/api/resumes/:id` | Get single resume |
| DELETE | `/api/resumes/:id` | Delete resume |
| POST | `/api/resumes/:id/profile` | Regenerate profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get single job |
| DELETE | `/api/jobs/:id` | Delete job |
| POST | `/api/jobs/:id/profile` | Regenerate profile |

## 🎯 Implementation Progress

| Part | Description | Status |
|------|-------------|--------|
| 1 | Authentication + Upload | ✅ Complete |
| 2 | Resume/Job Profiling | ✅ Complete |
| 3 | Job Embeddings (HuggingFace) | 🔄 In Progress |
| 4 | Resume Embeddings | ⏳ Pending |
| 5 | Matching Engine | ⏳ Pending |
| 6 | Exaggeration Detection | ⏳ Pending |
| 7 | Ranking + Stability | ⏳ Pending |
| 8 | Final Dashboard | ⏳ Pending |

## 📄 License

This project is part of an internship/academic project.

## 👨‍💻 Author

Built with ❤️ as part of the SkillSense internship project.
