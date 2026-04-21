# Wedding Gallery

A modern, real-time photo sharing application for weddings. Guests can upload photos live, and the couple can manage the gallery from an admin dashboard.

## ✨ Features

- **Guest Access**: Secure entry via an access code.
- **Real-time Photo Feed**: Photos appear instantly as they are uploaded using Supabase Realtime.
- **Live Slideshow**: Perfect for displaying on a big screen during the event.
- **Bulk Download**: Admin can download all photos in a ZIP archive.
- **Moderation**: Approve or hide photos through a protected admin dashboard.
- **Elegant UI**: Premium cream and gold aesthetic with fluid Framer Motion animations.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Storage**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Modules

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- A Supabase account and project.

### 2. Database Setup

1. Go to your Supabase SQL Editor.
2. Run the script provided in `supabase_schema.sql` to create the `photos` table and enable Realtime.
3. Create a public bucket named `photos` in the Storage section.

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GUEST_ACCESS_CODE=YOUR_GUEST_CODE
NEXT_PUBLIC_ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
```

### 4. Installation & Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📦 Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Add your environment variables in the Vercel project settings.
4. Deploy!

## 📜 License

Private - All rights reserved.
