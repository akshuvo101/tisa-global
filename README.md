
# TISA Global 🌍

### International Travel Service Around The World

TISA Global is a modern international travel service platform designed to help travelers explore destinations, understand travel requirements, and discover services related to international journeys.

The platform aims to bring essential travel information and assistance into one accessible experience, helping users move from exploring opportunities to planning their next journey.

**Live Website:** [Add your deployed website URL]

---

## ✨ Features

- **Travel Discovery** — Explore international destinations and travel opportunities.
- **Travel Information** — Discover useful information to help plan international journeys.
- **Visa & Documentation** — Access travel-related documentation guidance and resources.
- **Travel Packages** — Explore travel package information and available service options.
- **International Assistance** — Submit enquiries related to flights, visas, education, conferences, medical travel, and other assistance.
- **Contact Without Login** — Send an enquiry without creating an account.
- **Contact Form Integration** — Submit enquiries through a Next.js API route and store them in Supabase.
- **Responsive Interface** — Designed to provide a consistent experience across desktop, tablet, and mobile devices.
- **Modern UI** — A dark visual theme with clean layouts, subtle gradients, and interactive interface elements.

> Note: Feature availability may vary while the platform is under development. Only services that are implemented and operational should be considered available.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework and routing |
| React | Component-based user interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| Supabase | Database and backend services |
| PostgreSQL | Relational data storage |
| Supabase SSR | Supabase client integration |
| Lucide React | Interface icons |
| Vercel | Deployment platform |

---

## 📁 Project Structure

```text
tisa-global/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts
│   ├── contact/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── contact/
│   │   └── ContactForm.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   └── supabase/
├── public/
├── .env.local
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

*The structure above illustrates the main application areas. Your actual directory structure may contain additional files and folders.*

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (a version supported by your installed Next.js release)
- npm, pnpm, yarn, or bun
- A Supabase project for backend features

### 1. Clone the Repository

```bash
git clone https://github.com/akshuvo101/tisa-global.git
cd tisa-global
```

If your GitHub repository uses a different URL or name, replace the repository URL and directory accordingly.

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or use your preferred package manager:

```bash
pnpm install
```

```bash
yarn install
```

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and configure your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the credentials from your Supabase project.

**Security notes:**

- Never commit `.env.local` to Git.
- Never expose a Supabase service role key in client-side code.
- Keep private credentials on the server.
- The public publishable key is intended for use with appropriately configured Supabase permissions and Row Level Security (RLS).

### 4. Configure the Contact Form Database

The contact form uses the `contact_messages` table in Supabase.

The table stores submitted enquiries with fields such as:

- `id`
- `name`
- `email`
- `assistance_type`
- `destination`
- `message`
- `status`
- `created_at`

Make sure the table exists and its column names match the application code.

For anonymous contact submissions, configure the required table privileges and RLS insert policy. Allow only the intended insert operation for the `anon` role, and do not grant public visitors permission to read or modify submitted enquiries.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will reload as you make changes to the source files.

---

## 📬 Contact Form

TISA Global includes a public contact form so visitors can submit enquiries without logging in.

### Supported Enquiry Categories

- Flights & Travel
- Visa & Documents
- Travel Packages
- Education & Conferences
- Medical Travel
- Other Assistance

### Submission Flow

1. A visitor completes the contact form.
2. The form sends a POST request to `/api/contact`.
3. The API validates the submitted data.
4. The enquiry is inserted into the Supabase `contact_messages` table.
5. The visitor receives a success or error message.

The form is designed to make it easier for visitors to contact the platform without creating an account.

---

## 🧑‍💻 Development

Start the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run ESLint if the corresponding script is configured in `package.json`:

```bash
npm run lint
```

### Code Organization

- `app/` — Pages, layouts, and API routes.
- `components/` — Reusable interface components.
- `lib/` — Shared utilities and backend integrations.
- `public/` — Static assets.
- `app/globals.css` — Global styles and theme configuration.

---

## 🚢 Deployment

TISA Global can be deployed on [Vercel](https://vercel.com/), which supports Next.js applications.

### Deployment Steps

1. Push your project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables in the Vercel project settings.
4. Deploy the application.
5. Test the website and contact form in the deployed environment.

Make sure the production Supabase project has the correct database schema, privileges, and RLS policies.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

## 🔒 Security & Privacy

- Validate submitted form data on the server.
- Apply Row Level Security to database tables.
- Restrict anonymous contact submissions to the intended operation.
- Never expose private server credentials in client-side code.
- Add rate limiting and spam protection before relying on the public contact form in production.
- Avoid submitting passwords, payment card information, or other sensitive data through general enquiries.

---

## 🗺️ Roadmap

Potential improvements as development progresses:

- [ ] Expand destination discovery and travel information.
- [ ] Improve visa and documentation resources.
- [ ] Develop travel package and service discovery.
- [ ] Enhance mobile navigation and interactive experiences.
- [ ] Expand travel assistance workflows.
- [ ] Add appropriate enquiry management tools for authorized administrators.
- [ ] Improve accessibility, performance, and security.
- [ ] Add further features based on user feedback.

---

## 🤝 Contributing

TISA Global is an evolving project.

If you would like to suggest an improvement or report an issue, open a GitHub issue or submit a pull request if contributions are enabled for the repository.

Please include a clear description of the proposed change and its purpose.

---

## 📄 License

The project's license has not been specified here. Add a `LICENSE` file and update this section once the licensing terms have been decided.

---

## 👨‍💻 Developer

**AK Shuvo**

- **Portfolio:** [akshuvo.vercel.app](https://akshuvo.vercel.app)
- **GitHub:** [akshuvo101](https://github.com/akshuvo101)
- **LinkedIn:** [AK Shuvo](https://www.linkedin.com/in/ak-shuvo-a81187246/)

---

<p align="center">
  Built with Next.js, TypeScript, and a vision for more accessible international travel.
</p>
