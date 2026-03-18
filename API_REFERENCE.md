# JA Platform — API Quick Reference

> **Base URL**: `http://localhost:8000` (dev)  
> **Auth**: `Authorization: Bearer <token>` header on all protected routes  
> **Login body**: JSON `{ email, password }` — not OAuth2 form data

---

## Seeded Accounts

| Portal | Email | Password |
|---|---|---|
| JA Admin | `admin@jateam.com` | `JaAdmin@2026` |
| Client | `client@test.com` | `Client@123` |

---

## JA Admin Portal

### Auth
```
POST /api/ja-admin/auth/login       → { email, password }
                                    ← { access_token, user: { name, email, role } }
```

### Dashboard
```
GET  /api/ja-admin/dashboard/stats  ← { totalClients, activeClients, totalJobsThisWeek, pendingBatch }
```

### Client Management
```
GET   /api/ja-admin/clients?status=active&search=john
POST  /api/ja-admin/clients                   → { name, email, password?, status?, notes? }
GET   /api/ja-admin/clients/:id
PATCH /api/ja-admin/clients/:id/status        → { status: "active"|"suspended"|"inactive" }
PATCH /api/ja-admin/clients/:id/credentials   → { password: "newPassword" }
POST  /api/ja-admin/clients/:id/send-invite   ← { sentAt }
```

### Team Management
```
GET   /api/ja-admin/team
POST  /api/ja-admin/team                      → { name, email, password, role: "admin"|"member" }
PATCH /api/ja-admin/team/:id/status           → { status: "active"|"suspended" }
PATCH /api/ja-admin/team/:id/credentials      → { password: "newPassword" }
```

### Jobs Pipeline
```
GET   /api/ja-admin/jobs?clientId=UUID&weekId=2026-W12&status=queued
POST  /api/ja-admin/jobs                      → { client_id, job_title, company, location?, apply_link?, match_score?, source?, week_id? }
PATCH /api/ja-admin/jobs/:id                  → { status: "queued"|"batch_active"|"applied"|"interviewing"|"offer"|"rejected" }
POST  /api/ja-admin/jobs/archive              → { week_id: "2026-W12", client_id?: "UUID" }
```

---

## Client Portal

### Auth
```
POST /api/client/auth/login          → { email, password }
                                     ← { access_token }
GET  /api/client/auth/me             ← { id, name, email, status, portal_access, ... }
```

### Jobs
```
GET  /api/client/jobs                ← { jobs: [...], total: N }
GET  /api/client/jobs/stats          ← { used: 12, limit: 60, isVeteran: false }
```

---

## Quick Test (PowerShell)

```powershell
# JA Admin login
$token = (Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/ja-admin/auth/login" `
  -Body '{"email":"admin@jateam.com","password":"JaAdmin@2026"}' `
  -ContentType "application/json").access_token

# Dashboard stats
Invoke-RestMethod -Uri "http://localhost:8000/api/ja-admin/dashboard/stats" `
  -Headers @{ Authorization = "Bearer $token" }

# Client Portal login
$ctoken = (Invoke-RestMethod -Method POST -Uri "http://localhost:8000/api/client/auth/login" `
  -Body '{"email":"client@test.com","password":"Client@123"}' `
  -ContentType "application/json").access_token

# Client jobs
Invoke-RestMethod -Uri "http://localhost:8000/api/client/jobs" `
  -Headers @{ Authorization = "Bearer $ctoken" }
```
