# Deploying Tech Village

The frontend and backend deploy separately — normal for a Vue SPA + Express
API, and it needs no architecture changes, just environment variables and a
container build.

## AWS (recommended)

Three pieces: **RDS** (database), **App Runner** (backend API), **Amplify Hosting** (frontend). Everything below assumes you have the AWS CLI configured (`aws configure`) and Docker installed locally.

### 1. Database — RDS for PostgreSQL

1. RDS console -> Create database -> PostgreSQL -> Free tier (or your preferred size)
2. Set a master username/password, DB name `tech_village`
3. **Public access**: choose "Yes" for the fastest path to a working test deploy. For anything beyond testing, choose "No" and use an App Runner **VPC connector** (step 2 below) so traffic never leaves AWS's network — this needs the backend and RDS in the same VPC.
4. Once available, copy the endpoint. Your connection string:
   ```
   postgresql://<username>:<password>@<rds-endpoint>:5432/tech_village
   ```
5. Security group: allow inbound port 5432 from your IP (to run migrations/seed from your machine) and, if using the public-access path, from wherever App Runner needs to reach it — the VPC connector path avoids opening this up publicly at all.

### 2. Backend — App Runner (via ECR)

App Runner runs the container built from `backend/Dockerfile` — the same
one used for any Docker host. Build and push it to ECR, then point App
Runner at the image:

```bash
cd backend

# One-time: create the ECR repo
aws ecr create-repository --repository-name tech-village-backend

# Authenticate Docker to ECR (replace <account-id> and <region>)
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Build and push
docker build -t tech-village-backend .
docker tag tech-village-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/tech-village-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/tech-village-backend:latest
```

Then in the App Runner console:
1. Create service -> Container registry -> Amazon ECR -> select the image you just pushed
2. Deployment trigger: manual (or automatic, to redeploy on every push)
3. Port: `4000`
4. Environment variables (from `backend/.env.example`): `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (set after step 3 below), `NODE_ENV=production`, and optionally `EMAIL_PROVIDER`, `PAYSTACK_SECRET_KEY`/`FLUTTERWAVE_SECRET_KEY`, `DISCORD_GENERAL_URL`, etc.
5. If RDS is **not** publicly accessible: under Networking, add a **VPC connector** pointed at the VPC/subnets/security group RDS is in
6. Deploy. The Dockerfile's `CMD` runs `prisma migrate deploy` automatically on every start, so tables exist before the server accepts traffic. Run the seed once, from your machine, pointed at the RDS connection string:
   ```bash
   DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
   ```
   (This needs RDS to be reachable from your machine — either public access, or a bastion/VPN into the VPC.)
7. Note the App Runner URL it gives you (`https://xxxx.<region>.awsapprunner.com`) — that's your API base.

### 3. Frontend — Amplify Hosting

1. Amplify console -> New app -> Host web app -> connect your repo, set the **app root** to `frontend/`
2. Amplify auto-detects `frontend/amplify.yml` (already in the project) for the build spec
3. Environment variable: `VITE_API_BASE_URL` = `https://<your-app-runner-url>/api/v1`
4. **SPA routing**: App settings -> Rewrites and redirects -> add a rule so client-side routes like `/app/dashboard` don't 404 on refresh:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`
5. Deploy. Copy the Amplify URL it gives you.

### 4. Close the loop

Back in App Runner, set `CORS_ORIGIN` to your Amplify URL and redeploy so the backend accepts requests from it.

### 5. First login

Register at `<amplify-url>/register`, then promote yourself to admin: connect to RDS (from your machine if public, or via `npx prisma studio` pointed at the same `DATABASE_URL`) and add a row in `UserRole` linking your user to the `admin` role. From there, use the Admin -> Users screen for every other role assignment.

### Cost note

App Runner, RDS and Amplify are all pay-as-you-go, not free — for a test
deploy expect roughly $15-40/month depending on instance sizes (App Runner's
smallest config and an RDS `db.t4g.micro` are the cheapest combination). All
three can be torn down (`aws apprunner delete-service`, delete the RDS
instance, delete the Amplify app) when you're done testing to stop billing.

---

## Alternative: Vercel (frontend) + Railway/Render (backend) + Neon/Supabase (database)

If you'd rather not set up AWS, this combination has less initial setup (no VPC/ECR/security groups) at the cost of the frontend and backend living on different platforms.

- **Database**: Neon or Supabase — copy the connection string as `DATABASE_URL`
- **Backend**: Railway or Render, pointed at `backend/Dockerfile`, same environment variables as above. Railway: `railway run npx tsx prisma/seed.ts` to seed once.
- **Frontend**: Vercel, root directory `frontend/`. `frontend/vercel.json` (already in the project) handles the SPA rewrite automatically — no manual console step needed, unlike Amplify.
- Set `CORS_ORIGIN` on the backend to the Vercel URL, and `VITE_API_BASE_URL` on the frontend to the backend URL + `/api/v1`.

---

## Local (no deploy needed)

If you just want to click through the app without deploying anywhere, the
root `README.md`'s "Local setup" section (docker-compose Postgres + `npm run
dev` on both sides) is faster and needs no accounts on any hosting platform.
