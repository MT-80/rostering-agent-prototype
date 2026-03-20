# Workforce Rostering Agent - Interactive Prototype

Interactive prototype demonstrating an automated workforce rostering workflow for labour hire and specialist trade operations.

## Flow

1. **Client request** - Submit staffing requirements (headcount, roles, date, site)
2. **System matches** - Filters casual worker database by role, qualifications, certifications, site inductions, and availability
3. **SMS outreach** - Sends SMS with YES/NO form link to all matched workers
4. **First in, best dressed** - Allocates positions as responses arrive
5. **Worker confirmation** - Sends confirmation SMS with full job details + calendar link
6. **Client email** - Confirmation email to client with roster (names, roles, quals)
7. **Ops email** - Internal confirmation to ops team with full details + financial summary

## Local development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Deploy to Cloudflare Pages

Connected via GitHub. Push to `main` triggers auto-deploy.

**Build settings in Cloudflare:**
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: 18
