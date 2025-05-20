# ---- Base Node ----
# Use a specific Node.js LTS version on Alpine for smaller image size
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies ----
# Separating dependency installation allows Docker to cache this layer
FROM base AS deps
COPY package.json package-lock.json* ./
# Use npm ci for cleaner installs if package-lock.json is reliable
RUN npm ci

# ---- Build ----
# This stage builds the Next.js application
FROM deps AS build
# Copy the entire application code
COPY . .

# Define ARGs for build-time environment variables
# These are baked into the Next.js build, especially for NEXT_PUBLIC_ variables
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ARG API_URL
ARG API_PORT
ARG API_KEY

# Set ENVs from ARGs for the build process to use
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
ENV API_URL=$API_URL
ENV API_PORT=$API_PORT
ENV API_KEY=$API_KEY

# Run the Next.js build script
RUN npm run build

# ---- Runner ----
# This stage prepares the final image to run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Define ARGs for runtime environment variables
# These are needed by server-side code (e.g., server components, API routes, "use server" modules)
ARG API_URL
ARG API_PORT
ARG API_KEY

# Set ENVs from ARGs for the runtime environment
ENV API_URL=$API_URL
ENV API_PORT=$API_PORT
ENV API_KEY=$API_KEY

# Copy necessary artifacts from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.js ./next.config.js
# Copy node_modules from the build stage as Next.js `npm start` often relies on them
COPY --from=build /app/node_modules ./node_modules

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Set the command to start the Next.js application
CMD ["npm", "start"]
