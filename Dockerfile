FROM node:20

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

COPY .env.production .env

RUN pnpm rebuild prisma && pnpm exec prisma generate

RUN pnpm build

EXPOSE 80
CMD ["pm2-runtime", "ecosystem.config.js"]
