# Retention Backend API

Backend server for the Retention 1-4-7 spaced repetition app.

## Database: Supabase (FREE)

We use **Supabase** for the database - it's completely FREE and provides:
- ✅ 500MB PostgreSQL database
- ✅ Unlimited API requests
- ✅ Real-time subscriptions
- ✅ Auto-generated REST API
- ✅ Built-in authentication (optional)

**500MB is MORE than enough for 5+ years of data!**

### Storage Calculation:
- ~100 topics/year × 500 bytes = 50 KB/year
- ~300 reviews/year × 200 bytes = 60 KB/year
- ~1000 activity logs/year × 300 bytes = 300 KB/year
- **Total: ~410 KB per user per year**
- **500 MB = 1,200+ user-years of data!**

## Setup Instructions

### 1. Create Supabase Account (FREE)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Click "New Project"
4. Choose a name and password
5. Wait for project to be created (~2 minutes)

### 2. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click "Run"
5. You should see "Success" messages

### 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key

### 4. Configure Server

Create a `.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
```

Or edit `server.js` directly and replace:
- `YOUR_SUPABASE_URL` with your project URL
- `YOUR_SUPABASE_ANON_KEY` with your anon key

### 5. Install & Run

```bash
cd backend
npm install
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time` | Get server time (for sync) |
| POST | `/api/users/register` | Register/login user |
| GET | `/api/users/:deviceId` | Get user by device |
| GET | `/api/topics` | Get all topics |
| POST | `/api/topics` | Create new topic |
| PUT | `/api/topics/:id` | Update topic |
| DELETE | `/api/topics/:id` | Delete topic |
| POST | `/api/reviews/:topicId/complete` | Mark review done |
| GET | `/api/dashboard` | Get user stats |
| GET | `/api/calendar` | Get calendar data |
| POST | `/api/sync` | Sync offline data |

## Deployment (FREE Options)

### Option 1: Render.com
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new "Web Service"
4. Connect GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy!

### Option 2: Railway.app
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add environment variables
4. Deploy!

### Option 3: Vercel (as serverless)
Convert to serverless functions and deploy to Vercel.

## Development

```bash
# Run with auto-reload
npm run dev

# Production
npm start
```

## Security Notes

- The `anon` key is safe to use client-side
- Row Level Security (RLS) is enabled
- Each user can only access their own data
- Device ID is used for simple authentication

For production with user accounts, enable Supabase Auth.
