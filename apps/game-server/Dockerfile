# SoulForge realm (WebSocket) — Railway service with Root Directory = / (repo root) and
# Dockerfile path = apps/game-server/Dockerfile: the realm bundles the shared game code in src/game (economy core,
# spawn tables, maps) so the server and the browser run the same rules.
FROM node:22-alpine AS build
WORKDIR /repo
COPY apps/game-server/package.json apps/game-server/package-lock.json* apps/game-server/
RUN cd apps/game-server && npm install --no-audit --no-fund
COPY src ./src
COPY apps/game-server ./apps/game-server
RUN cd apps/game-server && npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/game-server/node_modules ./node_modules
COPY --from=build /repo/apps/game-server/dist ./dist
COPY apps/game-server/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
