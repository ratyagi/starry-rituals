# Starry Habits

Starry Habits is a calm, night-sky themed habit tracker. Build a constellation of habits, toggle them daily, and review a weekly rhythm overview. All data is stored locally in your browser so you can keep the experience private and fast.

## Features

- **Daily constellation view** for toggling habits in a focused nightly flow.
- **Weekly overview** to scan progress across the last seven days.
- **Add, edit, and archive habits** without losing past history.
- **Local-first storage** using `localStorage` (no backend required).
- **Gentle UI** powered by Tailwind, shadcn/ui, and Lucide icons.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Router
- Vitest + Testing Library

## Getting started

## How can I edit this code?

There are several ways of editing your application. 
Understand the code, vibe code your way through it or just clone it :)

### Prerequisites

- Node.js (recommended via [nvm](https://github.com/nvm-sh/nvm))
- npm (or an equivalent package manager)

### Install & run

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Project structure

```text
src/
  components/        # shared UI and feature components
  hooks/             # custom hooks
  lib/               # utilities and storage helpers
  pages/             # route-level views (Index, NotFound)
  types/             # shared TypeScript types

## Data & persistence

Habit data is stored in the browser via `localStorage` under the key `starry-habits-data`. Clearing site data will reset the app.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## License

No license has been specified yet.