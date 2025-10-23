# Debug Log

## M1-0001: CORS error when client calls server
- Symptom: Browser blocked request to http://localhost:3001 from http://localhost:3000
- Hypothesis: Missing CORS middleware on Express
- Experiment: Add `app.use(cors())`
- Result: Requests succeed
- Root Cause: Default browser CORS policy
- Fix: Keep CORS in server bootstrap
- Prevention: Add simple request test in CI later
