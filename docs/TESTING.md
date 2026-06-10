# HMS e-Register — Testing Documentation

## Test Strategy

| Level | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Jest | Services, utilities |
| Integration | Supertest | API endpoints |
| E2E | Playwright | Critical user flows |
| OCR | pytest | OCR pipeline accuracy |
| Security | Manual + OWASP ZAP | Auth, injection, XSS |

## Running Tests

```bash
# API unit tests
npm run test --workspace=@hms/api

# API with coverage
npm run test:cov --workspace=@hms/api

# OCR service tests
cd services/ocr-service && pytest

# Frontend lint
npm run lint --workspace=@hms/web
```

## Critical Test Cases

### Authentication
- [ ] Login with valid credentials returns JWT
- [ ] Login with invalid credentials returns 401
- [ ] Account locks after 5 failed attempts
- [ ] MFA required when enabled
- [ ] Refresh token rotation works
- [ ] Logout revokes refresh token

### Guest Registration
- [ ] Guest created with encrypted PII
- [ ] Aadhaar hash generated for matching
- [ ] Blacklist match triggers incident
- [ ] Duplicate Aadhaar increases risk score
- [ ] WebSocket check-in event emitted

### OCR Pipeline
- [ ] Image upload to MinIO succeeds
- [ ] Table detection finds register structure
- [ ] Text extraction returns confidence scores
- [ ] Row/column mapping produces valid grid
- [ ] Approve imports data to guests table

### Watchlist Matching
- [ ] Exact Aadhaar hash match found
- [ ] Mobile number match found
- [ ] Fuzzy name match (SOUNDEX) works
- [ ] No false positives on clean guests

### Security
- [ ] JWT required on protected endpoints
- [ ] RBAC blocks unauthorized roles
- [ ] Rate limiting triggers at threshold
- [ ] PII encrypted in database
- [ ] Audit log checksum chain valid

## OCR Accuracy Benchmarks

| Engine | Printed Text | Handwritten | Target |
|--------|-------------|-------------|--------|
| PaddleOCR | 95%+ | 80%+ | Primary |
| Tesseract | 90%+ | 65%+ | Fallback |
| EasyOCR | 92%+ | 75%+ | Alternative |
| Ensemble | 96%+ | 82%+ | Production |

## Load Testing

```bash
# Using k6 or artillery
artillery quick --count 100 -n 20 http://localhost:4000/api/v1/dashboard/stats
```

Target: 100 concurrent users, <200ms p95 response time.
