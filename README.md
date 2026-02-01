# Packing Helper

A modern, collaborative packing list application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📋 **Multi-level Lists**: Create recursive, nested packing lists for better organization
- 🔄 **Real-time Collaboration**: Share lists and see updates instantly with Supabase Realtime
- 📱 **Mobile-First Design**: Intuitive interface optimized for mobile devices
- 🎨 **Beautiful UI**: Built with Shadcn/UI components and Tailwind CSS
- 🔐 **Secure Authentication**: User authentication powered by Supabase Auth
- ⚡ **Type-Safe**: Full TypeScript support for better developer experience

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Authentication + Realtime Database)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) + [Playwright](https://playwright.dev/) (E2E)
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/lukasz-szloser/donotforgetme.git
cd donotforgetme
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Set up the database schema (see Database Schema section below)
4. Enable Authentication providers in Authentication > Providers

## Database Schema

Create the following tables in your Supabase project:

```sql
-- Packing Lists Table
create table packing_lists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  shared boolean default false
);

-- Packing Items Table (with support for nested items)
create table packing_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  checked boolean default false,
  parent_id uuid references packing_items(id) on delete cascade,
  list_id uuid references packing_lists(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table packing_lists enable row level security;
alter table packing_items enable row level security;

-- Policies for packing_lists
create policy "Users can view their own lists"
  on packing_lists for select
  using (auth.uid() = user_id);

create policy "Users can create their own lists"
  on packing_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lists"
  on packing_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own lists"
  on packing_lists for delete
  using (auth.uid() = user_id);

-- Policies for packing_items
create policy "Users can view items from their lists"
  on packing_items for select
  using (auth.uid() = user_id);

create policy "Users can create items in their lists"
  on packing_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their items"
  on packing_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their items"
  on packing_items for delete
  using (auth.uid() = user_id);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:unit:watch` - Run unit tests in watch mode
- `npm run test:e2e` - Run E2E tests with Playwright (requires dev server running)

## Project Structure

```
donotforgetme/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # Shadcn/UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared types
├── .cursorrules          # Cursor IDE configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── components.json       # Shadcn/UI configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Adding Shadcn/UI Components

To add new Shadcn/UI components:

```bash
npx shadcn-ui@latest add [component-name]
```

For example:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow mobile-first responsive design
- Use Tailwind CSS utility classes
- Keep components small and focused
- Write self-documenting code

### Component Structure

- Place reusable components in `/components`
- UI components from Shadcn/UI go in `/components/ui`
- Use proper TypeScript typing
- Implement loading and error states

### Best Practices

- Always validate user input
- Handle errors gracefully
- Keep security in mind
- Test on mobile devices
- Use semantic HTML
- Ensure keyboard navigation works

## CI/CD

GitHub Actions workflow automatically:

- Runs ESLint and Prettier checks
- Performs TypeScript type checking
- Runs unit tests with Vitest
- Builds the application
- Runs on push and pull requests to main and develop branches

### Testing

The project includes comprehensive testing setup:

#### Unit Tests (Vitest)

Unit tests are located in `lib/*.test.ts` files and test individual functions and utilities.

```bash
# Run unit tests once
npm run test:unit

# Run unit tests in watch mode (for development)
npm run test:unit:watch
```

**Example test coverage:**

- `buildTreeFromFlatList` function for converting flat lists to tree structures
- Handling empty lists
- Deep nesting support (up to 5 levels)
- Position-based sorting
- Orphaned items handling

#### E2E Tests (Playwright)

E2E tests are located in the `tests/` directory and test the application from a user's perspective.

```bash
# Run E2E tests (automatically starts dev server)
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/smoke.spec.ts

# Open Playwright UI for debugging
npx playwright test --ui
```

**Smoke tests include:**

- Login page redirect for unauthenticated users
- Login form elements visibility
- Basic page structure and meta tags

**Note:** E2E tests are not included in the CI pipeline to avoid database setup complexity. Run them locally before pushing changes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Backend by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
