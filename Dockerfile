# Build the app from this repository so UI changes (e.g. translate) ship to production.
# Do NOT use outlinewiki/outline-base here — that image is upstream Outline and ignores your fork.
ARG APP_PATH=/opt/outline

# --- Build: webpack + i18n + server (same flow as Dockerfile.base)
FROM node:18-alpine AS builder

ARG APP_PATH
WORKDIR $APP_PATH

# Classic Yarn 1.x (matches yarn.lock)
RUN npm install -g yarn@1.22.22

COPY package.json yarn.lock ./
RUN yarn install --no-optional --frozen-lockfile --network-timeout 1000000 && \
    yarn cache clean

COPY . .
ARG CDN_URL
ENV NODE_ENV=production
RUN yarn build

RUN rm -rf node_modules

RUN yarn install --production=true --frozen-lockfile --network-timeout 1000000 && \
    yarn cache clean

# --- Runtime
FROM node:18-alpine AS runner

ARG APP_PATH
WORKDIR $APP_PATH
ENV NODE_ENV=production

RUN npm install -g yarn@1.22.22

COPY --from=builder $APP_PATH/build ./build
COPY --from=builder $APP_PATH/server ./server
COPY --from=builder $APP_PATH/public ./public
COPY --from=builder $APP_PATH/.sequelizerc ./.sequelizerc
COPY --from=builder $APP_PATH/node_modules ./node_modules
COPY --from=builder $APP_PATH/package.json ./package.json

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs $APP_PATH/build

USER nodejs

EXPOSE 3000
CMD ["yarn", "start"]
