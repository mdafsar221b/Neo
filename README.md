# NeoCore Memory Platform - One-Pager Application

A production-ready single-page explorer application built with Next.js 14, Tailwind CSS, TypeScript, and Lucide icons for the **NeoCore Platform API (v2.0.0)**.

## Features

- **Master-Detail Feed**: Live organization memory feed with multi-field search and domain filtering.
- **Meeting Notes (MoM)**: Formatted Markdown renderer for conversation notes and executive takeaways.
- **Speaker Transcript**: Interactive timeline with timestamps, speaker badges, and in-transcript search.
- **Entities & Insights**: High-level metadata, mentioned entities, tags, and customer details.
- **Team Roster**: Organization user roster viewer.
- **Secure Token Caching**: Server-side token exchange and auto-refresh with automatic 401 retry handling.

## Vercel Deployment Guide

### 1. Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project** and select your GitHub repository.

### 2. Configure Environment Variables
In the **Environment Variables** section before deploying, add the following two variables:

| Variable Name | Value | Description |
|---|---|---|
| `NEOSAPIEN_API_KEY` | `sk.cr34HuAjFGKsnIc7KMpRvA4qT0cWP9dW0myzLQD6x_E` | NeoSapien organization API key |
| `NEOCORE_BASE_URL` | `https://api.neosapien.xyz` | NeoCore Platform API base URL |

### 3. Deploy
Click **Deploy**. Next.js will build and your application will be live immediately.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
npm start
```
