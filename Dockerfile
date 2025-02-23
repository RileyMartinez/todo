FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
RUN apk add --no-cache openjdk21-jre-headless
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
RUN if [ "$APP_ENV" = "prod" ]; then \
    pnpm --filter=api deploy --prod /staging/api && \
    pnpm --filter=web deploy --prod /staging/web; \
    else \
    pnpm --filter=api deploy /staging/api && \
    pnpm --filter=web deploy /staging/web; \
    fi

FROM base AS api
COPY --from=1password/op:2 /usr/local/bin/op /usr/local/bin/op
COPY --from=build /staging/api /prod/api
WORKDIR /prod/api
CMD [ \
    "sh", \
    "-c", \
    "if [ \"$APP_ENV\" = \"prod\" ]; \
    then pnpm start; \
    else pnpm start:debug; \
    fi" \
    ]

FROM base AS web
COPY --from=build /staging/web /prod/web
WORKDIR /prod/web
CMD [ \
    "sh", \
    "-c", \
    "if [ \"$APP_ENV\" = \"prod\" ]; \
    then pnpm start; \
    else pnpm start:dev; \
    fi" \
    ]