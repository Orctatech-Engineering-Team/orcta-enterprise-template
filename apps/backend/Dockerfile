FROM oven/bun:1.3.12-alpine AS builder

WORKDIR /app

# Install full dependency tree once in the build stage
COPY package.json ./
RUN bun install --frozen-lockfile || bun install

# Build a single bundled server artifact
COPY . .
RUN bun build src/main.ts \
  --target=bun \
  --format=esm \
  --minify \
  --outfile=dist/server.js


FROM oven/bun:1.3.12-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Only ship the runtime artifact
COPY --from=builder /app/dist/server.js ./dist/server.js

USER bun
EXPOSE 3000

CMD ["bun", "dist/server.js"]
