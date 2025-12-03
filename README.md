# Motorcycle Workshop SaaS

This is a SaaS application for managing motorcycle workshops, built with Next.js 15.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** shadcn-ui (Slate theme, CSS variables)
- **Icons:** lucide-react
- **Backend/Auth:** Supabase

## Project Structure

- `src/app`: Application routes and pages.
- `src/components/ui`: Reusable UI components (shadcn-ui).
- `src/components/shared`: Shared components (Navbar, Footer, etc.).
- `src/lib`: Utilities and API clients (Supabase client).
- `src/types`: TypeScript type definitions.
- `src/hooks`: Custom React hooks.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local` (copy from `.env.example` if available):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
