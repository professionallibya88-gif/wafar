# Tasks
- [x] Task 1: Update AdminRepository.ts: Modify `SINGLE_ADMIN_PASSWORD` in `apps/backend/src/repositories/AdminRepository.ts` to use `process.env.ADMIN_PASSWORD || '000000'`.
- [x] Task 2: Update Backend start script: Modify `apps/backend/package.json` to change the `start` script to `"npm run db:migrate:prod && npm run db:seed:prod && node dist/server.js"`.
- [x] Task 3: Update Railway deployment config: Modify `railway.toml`'s `startCommand` to execute `"if [ -f apps/backend/package.json ]; then cd apps/backend && npm start; else npm start; fi"`.