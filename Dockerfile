# ===================================================================
# DOCKERFILE — Smart Doc API
# ===================================================================
# Think of a Dockerfile like a recipe. It tells Docker exactly how to
# "cook" your app into a portable container that runs the same way on
# any machine — your laptop, your teammate's laptop, or a cloud server.
#
# KEY CONCEPTS:
#   - Image:     A snapshot/blueprint of your app + its dependencies
#   - Container: A running instance of that image (like a lightweight VM)
#   - Layer:     Each instruction below creates a cached layer,
#                so unchanged steps don't re-run on rebuild
# ===================================================================

# --- Stage 1: Base ---------------------------------------------------
# Start from a minimal Node.js image. "alpine" = tiny Linux (~5MB),
# which keeps our image small and fast to download.
FROM node:18-alpine AS base

# Set the working directory inside the container.
# All subsequent commands run from /app.
WORKDIR /app

# Copy ONLY package files first. Docker caches this layer, so if your
# dependencies haven't changed, `npm ci` won't re-run on rebuild.
# This is a key optimization — it saves minutes on every build.
COPY package.json package-lock.json ./

# Copy the Prisma schema so we can generate the client
COPY prisma ./prisma

# --- Stage 2: Dependencies -------------------------------------------
# `npm ci` is like `npm install` but stricter:
#   - Uses exact versions from package-lock.json (reproducible builds)
#   - Faster because it skips version resolution
#   - Fails if package-lock.json is out of sync
FROM base AS dependencies
RUN npm ci

# Generate the Prisma client (this creates the query engine for your DB)
RUN npx prisma generate

# --- Stage 3: Production image ----------------------------------------
# Start fresh from base to keep the final image clean
FROM base AS production

# Copy node_modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy generated Prisma client
COPY --from=dependencies /app/src/generated ./src/generated

# Now copy the rest of your source code
COPY . .

# Set NODE_ENV to production (enables optimizations in Express, etc.)
ENV NODE_ENV=production

# Document which port the app uses (doesn't actually open it — that's
# done in docker-compose.yml or with `docker run -p`)
EXPOSE 3000

# Create a non-root user for security.
# Running as root inside a container is risky — if someone exploits
# your app, they'd have root access. This limits the blast radius.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser
USER nodeuser

# The command that runs when the container starts
CMD ["node", "src/server.js"]
