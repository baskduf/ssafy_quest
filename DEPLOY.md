# Deployment Guide

This project is a Next.js application that uses **Prisma** with **Vercel Postgres** and a custom mechanism for SSAFY authentication.

## 1. Environment Variables

When deploying to Vercel, most database variables are set automatically when you connect a storage instance. However, you must manually ensure `SESSION_SECRET` is set.

| Variable Name | Description | Example / Note |
|---|---|---|
| `POSTGRES_PRISMA_URL` | Connection string for pooling. | **Auto-set by Vercel** |
| `POSTGRES_URL_NON_POOLING` | Direct connection string. | **Auto-set by Vercel** |
| `SESSION_SECRET` | A secure random string (at least 32 chars). | Generate using `openssl rand -hex 32` |

## 2. Vercel Postgres Setup (Quick Start)

1.  **Create Project**: Import this repo into Vercel.
2.  **Create Database**:
    - Go to your Project Dashboard > **Storage** tab.
    - Click **Connect Store** -> **Common** -> **Postgres** (or "Create New").
    - Give it a name and region (Seoul/`icn1` recommended if available, otherwise Tokyo/`hnd1`).
    - Click **Connect**.
3.  **Environment Variables**: Vercel will automatically add `POSTGRES_PRISMA_URL` and related variables to your project settings.
4.  **Add Session Secret**:
    - Go to **Settings** -> **Environment Variables**.
    - Add `SESSION_SECRET` with a strong random value.

## 3. Database Migration

After connecting the database, you need to apply the schema.
You can do this locally (if you pull env vars) or via the build command.

### Option A: Local Migration (Recommended)
1.  Link your local project to Vercel:
    ```bash
    npx vercel link
    ```
2.  Pull environment variables:
    ```bash
    npx vercel env pull .env.local
    ```
3.  Run migration:
    ```bash
    npx prisma migrate deploy
    ```

### Option B: Build Command
Add `npx prisma migrate deploy` to your Install or Build command, but be careful with timeouts. It's usually better to migrate from CI/CD or locally.

## 4. SSAFY Login & Rate Limiting

The application authenticates users via `edu.ssafy.com`.

> [!CAUTION]
> **Rate Limiting**: To prevent IP bans from SSAFY, consider using the [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or Upstash for rate limiting login attempts.

## 5. Timezone

Set `TZ=Asia/Seoul` in Vercel Environment Variables to ensure correct date formatting for Korean users.
