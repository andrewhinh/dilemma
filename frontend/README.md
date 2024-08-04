# Frontend

Built with React + Next.js.

## Setup

Install dependencies:

   ```bash
   npm install
   ```

Create a `.env.local` (+ `.env.development + .env.production`):

   ```bash
   NEXT_PUBLIC_APP_URL=<frontend URL here>
   NEXT_PUBLIC_SUPPORT_EMAIL=<email here>
   API_URL=<backend URL here>
   API_PORT=8000
   API_KEY=<backend API key here>
   echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" >> .env
   echo "API_URL=$API_URL" >> .env
   echo "API_PORT=$API_PORT" >> .env
   echo "API_KEY=$API_KEY" >> .env
   ```

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
