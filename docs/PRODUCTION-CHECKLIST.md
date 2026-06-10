# HMS e-Register — Production Readiness Checklist

## Infrastructure

- [ ] MySQL 8 deployed with replication/backups
- [ ] Redis cluster for sessions and pub/sub
- [ ] MinIO or S3 with versioning enabled
- [ ] Docker images built and scanned
- [ ] Load balancer configured
- [ ] SSL/TLS certificates installed
- [ ] DNS configured
- [ ] CDN for static assets (optional)

## Security

- [ ] Default admin password changed
- [ ] JWT_SECRET is 256-bit random value
- [ ] ENCRYPTION_KEY is 32-byte random value
- [ ] MFA enabled for all admin accounts
- [ ] Database credentials rotated
- [ ] CORS restricted to production domain
- [ ] Rate limiting configured
- [ ] IP whitelisting evaluated
- [ ] Security headers verified (Helmet)
- [ ] Dependency vulnerability scan passed
- [ ] Penetration test completed

## Database

- [ ] Schema migrated (`database/schema.sql`)
- [ ] Seed data verified
- [ ] Indexes optimized
- [ ] Backup schedule configured (daily)
- [ ] Backup restore tested
- [ ] Connection pooling configured

## Application

- [ ] All environment variables set
- [ ] `DB_SYNC=false` in production
- [ ] `NODE_ENV=production`
- [ ] API health check passing
- [ ] OCR service health check passing
- [ ] WebSocket connections stable
- [ ] Notification channels configured (SMS, Email)
- [ ] LLM API key set (if using AI search)

## Monitoring

- [ ] Application logging centralized
- [ ] Error tracking (Sentry) configured
- [ ] Uptime monitoring active
- [ ] Database monitoring active
- [ ] Alert thresholds defined
- [ ] On-call rotation established

## Compliance

- [ ] Aadhaar handling per UIDAI guidelines
- [ ] Data retention policy documented
- [ ] Privacy policy published
- [ ] Audit log retention configured
- [ ] FRRO reporting validated
- [ ] Data localization requirements met

## Performance

- [ ] Load test passed (100+ concurrent users)
- [ ] API p95 < 200ms
- [ ] OCR processing < 30s per page
- [ ] Database query optimization reviewed
- [ ] Image compression configured

## Documentation

- [ ] Deployment runbook complete
- [ ] API documentation published
- [ ] Admin user guide available
- [ ] Hotel onboarding guide ready
- [ ] Incident response plan documented

## Go-Live

- [ ] Staging environment validated
- [ ] Rollback plan documented
- [ ] Support team trained
- [ ] Pilot hotels onboarded
- [ ] Police command centre access verified
- [ ] Go/No-Go sign-off obtained
