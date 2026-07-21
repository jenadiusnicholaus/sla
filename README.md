# Street Labs Africa — Frontend

Vue 3 site for [streetlabsafrica.org](https://streetlabsafrica.org/) plus the **Smart QR / CMS backoffice**.

## Run with the Django API

```bash
# Terminal 1 — backend
cd ../sla-backend
source .venv/bin/activate
python manage.py runserver

# Terminal 2 — frontend
npm install
npm run dev
```

| Surface | URL |
|---------|-----|
| Public site | http://localhost:5173/ |
| Smart Hub demo | http://localhost:5173/qr/A91KXT |
| Employee profile | http://localhost:5173/profiles/hamood |
| Backoffice | http://localhost:5173/backoffice/login |

**Backoffice login:** `admin` / `admin123!`

## Platform routes

```
/                     Website homepage
/profiles/{username}  Employee digital identity
/projects/{slug}      Project page
/qr/{code}            Smart Hub (dynamic QR destination)
/backoffice           CMS · QR builder · Profiles · Analytics
```

Every physical QR should encode:

`https://streetlabsafrica.org/qr/{CODE}`

The backend resolves the live destination (hub actions, profile, project, event, URL) without reprinting codes.

## Shared UI components

Reusable primitives live in `src/components/ui/` (shadcn-vue style). Theme tokens are in `src/assets/ui.css`.

```vue
import { Button, Input, Card, CardContent } from '@/components/ui'
```

Add more via the CLI (Node 22+): `npx shadcn-vue@latest add dialog`. See `src/components/ui/README.md`.
