# IEC Quiz Platform

This is a modern, full-stack quiz application built for the IEC Group of Institutions. It provides a seamless experience for both students to take quizzes and for administrators to manage them.

## ✨ Features

- **Student Portal**:
  - Secure student registration and login with mandatory email verification.
  - A dashboard to start new quizzes by entering a unique code.
  - A clean, timed interface for taking quizzes with progress tracking.
  - Instant results upon quiz completion.
  - A history of all past quiz attempts and scores.

- **Admin Portal**:
  - Secure admin-only login.
  - A comprehensive dashboard with key statistics: total quizzes, total students, and average scores.
  - A list of recent quiz submissions.
  - The ability to upload new quizzes in bulk using a simple Excel template.
  - A results viewer to see the top-performing students for each quiz, grouped by school.
  - Powerful data export functionality to download student lists or filtered quiz results as `.xlsx` files.

- **Technical Features**:
  - Fully responsive design for a great experience on desktop and mobile devices.
  - Built with modern, best-practice web development standards.
  - Secure and scalable backend powered by Firebase.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **AI Integration**: [Google Genkit](https://firebase.google.com/docs/genkit)

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v20 or later)
- `npm` or a compatible package manager

### 2. Environment Variables

To connect the application to your Firebase project, you need to set up environment variables.

1.  Create a file named `.env` in the root of the project.
2.  Add your Firebase project configuration to it, like so:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
```

### 3. Install Dependencies & Run

```bash
# Install project dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📂 Project Structure

- **`src/app`**: Contains all routes and pages, following the Next.js App Router structure.
  - `(public)`: Routes accessible to everyone (e.g., landing, login, signup).
  - `admin`: Routes for the admin portal.
  - `student`: Routes for the student portal.
- **`src/components`**: Shared React components.
  - `ui`: Auto-generated components from ShadCN UI.
  - `student`, `auth-layout`, `logo`: Custom application-specific components.
- **`src/hooks`**: Custom React hooks, such as `useAuth` for managing authentication state.
- **`src/lib`**: Core utilities, data type definitions, and Firebase configuration.
  - `firebase.ts`: The single point of Firebase initialization.
  - `data.ts`: TypeScript types for data models (Quiz, User, etc.).
- **`public`**: Static assets like images and fonts.

## 📜 Available Scripts

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server (requires a build first).
- `npm run lint`: Lints the codebase for potential errors.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
