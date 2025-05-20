# Frontend

Built with React + Next.js.

## Setup

Install dependencies:

   ```bash
   npm install
   ```

Create your environment configuration files (e.g., `.env.local`, `.env.development`, `.env.production`).

Start by copying the example file for your local setup:
   ```bash
   cp .env.local.example .env.local
   ```
Then, edit the `.env.local` file to set your specific values for all variables.

For other environments like development or production, you can create `.env.development` and `.env.production` files. You can copy your configured `.env.local` or the `.env.local.example` as a starting point and then customize the values as needed for each specific environment.

The following lists the variables you'll need to set, but it's recommended to manage these in your actual `.env.local` (and other environment-specific) files:
   ```bash
   # Example values:
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
   API_URL=http://localhost:8000
   # API_PORT=8000 # Only if not part of API_URL
   API_KEY=your_backend_api_key_here # Must match the API_KEY in the backend's .env file
   ```
   The old instructions to `echo` variables into `.env` have been removed as it's better to edit the file directly.

## Development

To lint the code:

   ```bash
   npm run lint
   ```

To run the frontend locally:

   ```bash
   npm run dev
   ```

To create a production build locally:

   ```bash
   npm run build
   ```

To preview the production build locally:

   ```bash
   npm run preview
   ```
