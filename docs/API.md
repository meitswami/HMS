# HMS e-Register — API Reference

Base URL: `http://localhost:4000/api/v1`

Interactive docs: `http://localhost:4000/docs` (Swagger)

## Authentication

### POST /auth/login
```json
{ "email": "admin@hms.gov.in", "password": "Admin@123", "mfaCode": "123456" }
```
Response: `{ accessToken, refreshToken, user }`

### POST /auth/refresh
```json
{ "refreshToken": "..." }
```

### POST /auth/logout
Requires Bearer token.

### POST /auth/mfa/setup
Returns QR code URL and backup codes.

## Hotels

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /hotels | owner, admin | Register hotel |
| GET | /hotels | all | List hotels |
| GET | /hotels/:id | all | Hotel details |
| PUT | /hotels/:id | owner, manager | Update hotel |
| POST | /hotels/:id/heartbeat | all | Online status |

## Guests (Digital Register)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /guests | receptionist+ | Register guest |
| GET | /guests | all | List guests |
| GET | /guests/:id | all | Guest details |
| POST | /guests/:id/checkout | receptionist+ | Check out |

## OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ocr/upload | Upload register scan (multipart) |
| GET | /ocr | List OCR scans |
| PUT | /ocr/:id/approve | Approve extracted data |
| PUT | /ocr/:id/reject | Reject extraction |

## Watchlist

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /watchlist | police+ | Add watchlist entry |
| GET | /watchlist | police+ | List entries |

## Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /incidents | List incidents |
| PUT | /incidents/:id/status | Update incident status |

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/stats | Command centre stats |
| GET | /dashboard/districts | District-wise breakdown |
| GET | /dashboard/incidents/recent | Recent incidents |

## AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/search | Natural language search |

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/report | Generate report |

## WebSocket Events

Connect: `ws://localhost:4000/ws?role=police_command`

| Event | Direction | Description |
|-------|-----------|-------------|
| alert:new | server→client | New security alert |
| incident:created | server→client | New incident |
| guest:checkin | server→client | Guest checked in |
| ocr:progress | server→client | OCR processing update |
| dashboard:update | server→client | Stats refresh |

## Error Responses

```json
{ "statusCode": 401, "message": "Unauthorized" }
{ "statusCode": 403, "message": "Forbidden" }
{ "statusCode": 429, "message": "Too Many Requests" }
```
