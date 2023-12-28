# Frontend

Built with React + Next.js.

## Setup

Install dependencies:

   ```bash
   npm install
   ```

Create a `.env` file:

   ```bash
   NEXT_PUBLIC_API_URL=https://localhost/
   NEXT_PUBLIC_API_PORT=8000
   NEXT_PUBLIC_APP_URL=https://localhost:3000/?tag=dog&rating=r
   echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env
   echo "NEXT_PUBLIC_API_PORT=$NEXT_PUBLIC_API_PORT" >> .env
   echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL" >> .env
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
