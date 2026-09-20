<div align="center">

# 🚀 DevShowcase — Universal Developer Project Discovery & Social Hub

A modern, developer-first discovery platform designed to share, showcase, and explore software builds hosted anywhere across the internet — from GitHub and GitLab to Hugging Face, Kaggle, live web deployments, and personal portfolios.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-6366f1?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure_Auth-8b5cf6?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Platform](https://img.shields.io/badge/Platform-Universal_Discovery-ec4899?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🎬 Demo & Visual Walkthrough

Experience **DevShowcase** in action. All project media, demo recordings, and assets are housed in the [`assets/`](./assets/) directory.

<div align="center">
  <img src="./assets/demo.gif" alt="DevShowcase Full Walkthrough Demo" width="850px" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
  <p><em>Demo Preview: Interactive developer feed, project showcases, profile management, and admin tools</em></p>
</div>

> [!NOTE]
> Add your recorded walkthrough animation as `demo.gif` inside the [`assets/`](./assets/) folder to render the preview banner above.

---

## ⚠️ Disclaimer

> [!IMPORTANT]
> **Mock Data Notice:** All projects, titles, repository URLs, external links, descriptions, and developer handles displayed in the walkthrough GIF, video recordings, screenshots, and seed database are **fictional and randomly AI-generated** for testing and educational purposes. Any resemblance to real projects, repositories, websites, or individuals is **purely coincidental**.

---

## 🌟 What Makes DevShowcase Unique?

Unlike platforms limited strictly to single code hosts, **DevShowcase** serves as an open, universal stage for developers to celebrate their creations regardless of where they live:

- **🌐 Multi-Platform Showcase:** Paste links and share builds from **GitHub, Hugging Face Spaces & Models, GitLab, Kaggle, Vercel/Netlify live apps, itch.io, or personal sites**.
- **🔗 Intelligent Link Glow:** External URLs are automatically detected, highlighted, and turned into clickable, interactive preview badges.
- **🔐 Secure Authentication:** JWT-powered authentication with bcrypt password encryption, profile updates, and account management.
- **🛡️ Role-Based Access Control (RBAC):** Built-in administrative dashboard to manage community members, moderate showcases, and execute maintenance cleanup.
- **🎨 Custom Modern Aesthetic:** A distinctive, sleek dark interface (Obsidian & Electric Indigo/Violet) built with pure Vanilla CSS, glassmorphic blur effects, and Google Font *Plus Jakarta Sans* — completely independent of third-party design frameworks or GitHub's UI.

---

## 🔮 Upcoming Updates & Future Roadmap

As backend architecture and system design skills continue to grow, DevShowcase is planned for major upcoming features:

- **⭐ Star & Upvote-Driven Discovery Algorithm:**
  - An Instagram/social-media inspired ranking feed where top-trending builds with high community engagement and verified stars automatically surface at the top.
- **🐙 Multi-Platform OAuth & Auto-Sync:**
  - One-click GitHub & Google account linking to import public repos and live project stats effortlessly.
- **🖼️ Rich Link Unfurling & Embeds:**
  - Automatic metadata preview cards showing repository stars, Hugging Face model downloads, and live site favicon previews.
- **💬 Social Interaction Engine:**
  - Developer bookmarks, comments, reaction tags, and tech stack filter tags (e.g., `#AI`, `#WebDev`, `#Rust`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (v18+) |
| **Backend Framework** | [Express.js](https://expressjs.com/) (v5.2) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| **Authentication** | [JSON Web Tokens (JWT)](https://jwt.io/) & [bcrypt](https://www.npmjs.com/package/bcrypt) |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Glassmorphic System), Vanilla JavaScript (ES6+) |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts) |
| **Assets & Media** | Located in [`assets/`](./assets/) |

---

## 📁 Project Structure

```text
Node JS Project 6/
├── assets/                  # Demo recordings, animations (.gif), and visual assets
├── Project/
│   ├── config/              # MongoDB database connection configuration
│   ├── controllers/         # Business logic (auth, user, post, admin)
│   ├── middlewares/         # JWT verification, RBAC guards, centralized error handler
│   ├── models/              # Mongoose schemas (User, Post)
│   ├── public/              # Client-side static application
│   │   ├── css/
│   │   │   └── style.css    # Central stylesheet & design system
│   │   ├── js/
│   │   │   ├── admin.js     # Admin dashboard operations
│   │   │   ├── app.js       # App state, dynamic navbar, toast alerts
│   │   │   ├── explore.js   # Community feed loader & showcase renderer
│   │   │   ├── login.js     # User authentication handler
│   │   │   ├── post.js      # Showcase publishing & details
│   │   │   ├── profile.js   # Developer profile & personal projects
│   │   │   └── register.js  # Developer registration handler
│   │   ├── admin.html       # Admin control & moderation center
│   │   ├── explore.html     # Dedicated community feed
│   │   ├── index.html       # Landing / Home platform overview
│   │   ├── login.html       # Developer sign-in portal
│   │   ├── post.html        # Create, view, edit & delete project showcase
│   │   ├── profile.html     # Developer profile & personal showcases
│   │   └── register.html    # Developer account registration
│   ├── routes/              # Express API route modular definitions
│   ├── utils/               # Structured API response utilities
│   ├── .env                 # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json         # Project metadata & npm dependencies
│   └── server.js            # Express application entry point
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local service or [MongoDB Atlas](https://www.mongodb.com/atlas) connection)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/devshowcase.git
cd "Node JS Project 6/Project"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create or verify `.env` inside the `Project/` folder:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/simple_blog_app
JWT_SECRET=your_super_secret_jwt_key_here
```

### 5. Launch the Server
```bash
# Production start
npm start

# Development mode (with auto-reloading)
npx nodemon server.js
```

### 6. Open DevShowcase
Navigate in your browser to:
```text
http://localhost:8000
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new developer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/posts/get-all-posts` | Public | Fetch all community project showcases |
| `GET` | `/api/posts/get-single-post/:id` | Public | Retrieve detailed showcase by ID |
| `POST` | `/api/posts/create-post` | User | Publish a new project showcase |
| `PATCH` | `/api/posts/update-post/:id` | Author | Update an existing showcase |
| `DELETE` | `/api/posts/delete-post/:id` | Author | Delete showcase by ID |
| `GET` | `/api/user/my-profile` | User | Get current logged-in developer profile |
| `PATCH` | `/api/user/update-profile` | User | Update name and email address |
| `PATCH` | `/api/user/change-password` | User | Update account password |
| `GET` | `/api/admin/get-all-users` | Admin | List all registered users |
| `DELETE` | `/api/admin/delete-user/:id` | Admin | Moderation: Delete user and their posts |

---

## 🤝 Contributing & Feedback

Contributions, feature suggestions, and issues are always welcome! Feel free to open an issue or submit a pull request.
