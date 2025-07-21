FROM node:20

ARG DATABASE_URL
ARG REDIS_URL
ARG NODE_ENV=production
ARG PORT=80

ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN pnpm add -g pm2

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

ENV PNPM_SKIP_VERIFY_PEER_DEP=1
ENV HUSKY=0
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

COPY . .

RUN pnpm rebuild prisma && pnpm exec prisma generate

RUN pnpm build

EXPOSE ${PORT}

CMD ["pm2-runtime", "ecosystem.config.js"]
