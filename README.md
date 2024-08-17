# todo

Todo list web app built with Postgres, NestJS, Angular, and Node.

## Prereqs

1. Docker

## Setup

1. Populate the following .env files (see .env.op at each path):
   - /.env
   - /ui/.env
   - /api/.env
   - Note, .env.op files are using 1password cli inject syntax
2. Recommend setting `DB_AUTOLOAD_ENTITIES` to true for local dev schema creation
3. From project root, run `docker compose up`
4. Login to pgadmin (i.e. http://localhost:5050)
5. Register a server name
6. Configure connection host, username, password, then save

