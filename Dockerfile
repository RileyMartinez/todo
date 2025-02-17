FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ARG APP_ENV=prod
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN if [ "$APP_ENV" = "prod" ]; then \
    pnpm --filter=api deploy --prod /tmp/api && \
    pnpm --filter=web deploy --prod /tmp/web; \
    else \
    pnpm --filter=api deploy /tmp/api && \
    pnpm --filter=web deploy /tmp/web; \
    fi

FROM base AS api
ARG APP_ENV=prod
WORKDIR /app
RUN apk add --no-cache openjdk17-jre-headless
COPY --from=build /tmp/api .
COPY --from=1password/op:2 /usr/local/bin/op /usr/local/bin/op
CMD if [ "$APP_ENV" = "prod" ]; then \
    pnpm start:prod; \
    else \
    pnpm start:debug; \
    fi

FROM base AS web
ARG APP_ENV=prod
WORKDIR /app
COPY --from=build /tmp/web .
CMD if [ "$APP_ENV" = "prod" ]; then \
    pnpm start; \
    else \
    pnpm start:dev; \
    fi