FROM node:lts-alpine

WORKDIR /app/

RUN npm install -g pnpm

COPY --from=1password/op:2 /usr/local/bin/op /usr/local/bin/op

COPY pnpm-lock.yaml package.json /app/

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "start:dev"]