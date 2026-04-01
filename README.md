# 🍑 Peach Clone

A beautiful, self-hostable, and simple-to-use social space. Inspired by the classic mobile app, built for the modern web as a high-performance PWA.

![Peach Clone Preview](https://raw.githubusercontent.com/username/peach-clone/main/public/preview.png)

## ✨ Features

- **Invite-Only Registration**: Keep your instance private. The first person to sign in becomes the Admin.
- **Micro-blogging Feed**: Post text, images, and videos with ease.
- **Deep Personalization**: Custom primary and secondary colors per user profile, plus background images.
- **Activity Tracking**: See which friends are online and when they were last active.
- **PWA Ready**: Install it to your home screen for a native app-like experience.
- **Self-Hostable with "One-Click"**: Deployment is optimized for Digital Ocean and Docker.

---

## 🚀 One-Click Deployment (Digital Ocean)

### **Option 1: Digital Ocean App Platform (Easiest)**
1. Fork this repository.
2. Go to the **Digital Ocean Dashboard** > **Apps** > **Create**.
3. Select your forked repository.
4. Digital Ocean will automatically detect the `do-app-spec.yaml`.
5. Set your **NEXTAUTH_SECRET** (any random string) and SMTP credentials.
6. Deploy!

### **Option 2: Digital Ocean Droplet (Manual/Pulumi)**
We provide a [Pulumi script](./infra/index.ts) that provisions a ready-to-go Ubuntu server with Docker pre-installed.
1. Run `pulumi up` from the `infra/` folder.
2. SSH into your new instance.
3. Clone this repo and run `docker-compose up -d`.

---

## 🛠 Local Development

### **1. Prerequisites**
- Node.js 22+
- SQLite (included by default)

### **2. Setup**
```bash
git clone https://github.com/yourusername/peach-clone.git
cd peach-clone
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

### **3. Environment Variables**
Configure these in your `.env` for full functionality:
- `DATABASE_URL`: `file:./dev.db`
- `NEXTAUTH_URL`: `http://localhost:3000`
- `NEXTAUTH_SECRET`: Generate a random string
- `EMAIL_SERVER_HOST`: Your SMTP host (e.g., smtp.resend.com)
- `EMAIL_SERVER_USER`: Your SMTP user
- `EMAIL_SERVER_PASSWORD`: Your SMTP password
- `EMAIL_FROM`: The display email for magic links

---

## 🍱 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Magic Link / Email Only)
- **Styling**: Vanilla CSS Modules (Theming via CSS Variables)
- **Deployment**: [Docker](https://www.docker.com/) & [Pulumi](https://www.pulumi.com/)

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
