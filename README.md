# CampusTransit – College Bus Tracking and Management System

CampusTransit is a web-based college bus tracking and management system designed to help students, drivers, and administrators manage campus transportation efficiently.

## Features

- Student bus and route information
- Live bus tracking interface
- Driver dashboard and trip management
- Admin dashboard
- Bus, driver, student, route, and stop management
- Emergency alerts and notifications
- Maintenance management
- Reports and statistics
- Responsive web interface
- Authentication and role-based access

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js API endpoints
- Supabase

## Project Structure

```text
CampusTransit-GitHub-Clean/
├── api/                 # Backend API endpoints
├── public/              # Public assets
├── src/                 # React application source
│   ├── assets/
│   ├── contexts/
│   ├── pages/
│   └── ...
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and add your own Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit real API keys, passwords, or private credentials to GitHub.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

## Build for Production

```bash
npm run build
```

The production files will be generated in the `dist` folder.

## GitHub Upload

1. Create a new GitHub repository named `CampusTransit`.
2. Extract this project ZIP.
3. Upload the project files to the repository.
4. Commit the files with a message such as `Initial CampusTransit project`.
5. Add your own environment variables through the deployment platform instead of uploading `.env`.

## Deployment

This project can be deployed using platforms that support Vite/React applications. Add the required environment variables in the deployment platform before building.

## Project Purpose

This project can be used as a college Web Technology / Cloud Computing project demonstrating a practical campus transportation management solution.

## License

This project is intended for educational and academic use.
