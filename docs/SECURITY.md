# HMS e-Register — Security Documentation

## Authentication

### JWT Access Tokens
- Algorithm: HS256
- Expiry: 15 minutes (configurable)
- Payload: `{ sub, email, role, tenantId }`

### Refresh Tokens
- Opaque UUID stored as SHA-256 hash in database
- Expiry: 7 days
- Rotation on each refresh
- Revocable per-device or globally

### Multi-Factor Authentication
- TOTP (RFC 6238) compatible with Google Authenticator
- Secret encrypted with AES-256-GCM before storage
- 8 backup codes generated on setup
- Required for police command and super admin roles (recommended)

## Role-Based Access Control

| Role | Level | Permissions |
|------|-------|-------------|
| super_admin | 100 | Full system access |
| police_command | 90 | Command centre, watchlist, incidents |
| police_officer | 80 | View incidents, search |
| hotel_owner | 50 | Hotel management, users |
| hotel_manager | 40 | Guest register, OCR, reports |
| receptionist | 30 | Guest check-in/out only |

## Data Protection

### Encryption at Rest
- Aadhaar, Passport, DL, Voter ID, PAN: AES-256-GCM
- MFA secrets: AES-256-GCM
- Encryption key from `ENCRYPTION_KEY` env variable

### Hashing for Matching
- SHA-256 hashes stored for blacklist comparison
- Plaintext PII never stored for identity documents
- Mobile numbers stored plaintext (required for alerts) with access controls

### Audit Trail
- Every login, edit, OCR change, verification, alert, download logged
- SHA-256 checksum chain prevents tampering
- `previous_checksum` links each entry to prior

## API Security

- Helmet.js security headers
- CORS restricted to configured `APP_URL`
- Rate limiting: 100 requests/minute per IP
- Input validation via class-validator (whitelist mode)
- SQL injection prevention via TypeORM parameterized queries
- File upload type and size restrictions

## Network Security

- HTTPS required in production
- WebSocket connections authenticated via JWT
- IP whitelisting available (`IP_WHITELIST_ENABLED`)
- Device fingerprinting on sessions

## Compliance Considerations

- Aadhaar data handled per UIDAI guidelines
- Guest PII retention policies configurable per tenant
- Right to erasure supported via soft delete
- FRRO reporting for foreign nationals
- Data localization: deploy within India for government use

## Incident Response

1. Blacklist match triggers automatic incident
2. Multi-channel alert to police command
3. Incident lifecycle: open → acknowledged → investigating → resolved
4. All actions audit-logged with user attribution

## Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Enable MFA for admin accounts
- [ ] Configure HTTPS/TLS
- [ ] Restrict database access by IP
- [ ] Enable audit log monitoring
- [ ] Configure backup encryption
- [ ] Review RBAC assignments
- [ ] Penetration test before go-live
