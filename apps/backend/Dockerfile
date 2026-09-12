# Build from the monorepo root: `docker build -f apps/backend/Dockerfile .`
# npm workspaces require the root package.json/lockfile to resolve
# @adaptfit/shared, so the build context has to be the repo root, not
# apps/backend/.

FROM node:20-slim AS build
WORKDIR /app

# node:20-slim ships no OpenSSL, but Prisma's engine binaries need it to
# detect the right build to use - without this, `prisma generate` and
# `prisma migrate deploy` fail with an opaque "Schema engine error".
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/backend/package.json apps/backend/package.json
RUN npm ci --ignore-scripts

COPY packages/shared packages/shared
COPY apps/backend apps/backend

RUN npm run build --workspace=@adaptfit/shared
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build --workspace=@adaptfit/backend


FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 4000

# Applies pending migrations, then starts the server. Run the seed script
# separately (`npm run seed --workspace=@adaptfit/backend`) after the first
# deploy - it's not part of the boot path since it should only run once.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/index.js"]
