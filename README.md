# 🛡️ Enterprise Authentication & Security Architecture - Shubharambh Green City CRM

A production-grade, full-stack security and authentication infrastructure designed for **Shubharambh Green City CRM** (60-Bigha Real Estate Plot Inventory & MLM Sales Network).

---

## 🌟 Security Architecture & Features Implemented

1. **Secure Multi-Identifier Login**: Email or Username login with strong password complexity enforcement.
2. **Bcrypt Password Hashing**: Minimum 12 salt rounds (`BCRYPT_SALT_ROUNDS=12`), zero plain text storage.
3. **Dual JWT Token Architecture**:
   - **Access Token**: Short-lived (15 minutes) signed with `JWT_ACCESS_SECRET`.
   - **Refresh Token**: Long-lived (7 days / 30 days for Remember Me) signed with `JWT_REFRESH_SECRET`.
4. **Secure Token Storage**: Refresh token stored strictly in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
5. **Automatic Token Refresh**: Silent background renewal using request interceptors when access token expires.
6. **Role-Based Access Control (RBAC)**: 8 distinct roles (`SUPER_ADMIN`, `ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`, `FINANCE`, `ASSOCIATE`, `CUSTOMER_SUPPORT`, `VIEWER`).
7. **Granular Permission Middleware**: Protects API routes & UI components (e.g. Only `FINANCE`/`SUPER_ADMIN` can approve payments; only `ADMIN`/`SUPER_ADMIN` can delete plots).
8. **Active Session & Device Control**: Inspect logged-in devices, browser version, OS, IP address, and location. Revoke single or all active sessions.
9. **Login History Audit Trail**: Tracks IP Address, Browser, OS, Country, Timestamp, and Success/Failure attempts with failure reason logs.
10. **Automatic Account Lockout**: Account locks automatically for 15 minutes after 5 consecutive failed password attempts.
11. **Rate Limiting**: Protected against brute force using `express-rate-limit` (10 requests / 15 mins for login).
12. **CSRF Protection**: Double-submit cookie & `X-CSRF-Token` header verification middleware.
13. **XSS Input Sanitization**: Automatic HTML/Script injection filtering on all body, query, and parameter inputs.
14. **SQL Injection Prevention**: Parameterized query execution powered by Prisma ORM.
15. **Helmet Security Headers & CSP**: Standard Content Security Policy, HSTS, X-Frame-Options, X-Content-Type-Options headers.
16. **CORS Restrictions**: Configured origin whitelist limiting API access to trusted frontend clients.
17. **Strict Zod Input Validation**: Form & payload validation for email formats, passwords, phone numbers, and parameters.
18. **Password Reset Token Flow**: Dispatches 15-minute one-time tokens for account recovery.
19. **Change Password Engine**: Verifies old password, updates hash, generates fresh JWT, and revokes previous sessions.
20. **Google Authenticator 2FA (TOTP)**: Standard TOTP 2-factor authentication with QR code generation and emergency backup codes.
21. **Remember Me Extension**: Extends refresh cookie validity from 7 days to 30 days.
22. **15-Minute Client Idle Timeout**: Automatic client-side logout after 15 minutes of inactivity (mouse, keyboard, touch).
23. **Security Audit Logging**: Comprehensive immutable audit feed tracking sensitive domain operations.
24. **Winston Structured Logger**: JSON-formatted logging system with file rotation (`logs/error.log`, `logs/combined.log`).

---

## 👥 Role & Permission Matrix

| Role | Read Plots | Create Booking | Delete Plot | Approve Payments | Generate Receipts | Manage Roles | View Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ADMIN** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **SALES_MANAGER** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **SALES_EXECUTIVE** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **FINANCE** | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **ASSOCIATE** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CUSTOMER_SUPPORT**| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **VIEWER** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## ⚡ Default Seed Accounts (Password: `Password@123456`)

| Role | Username | Email |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `superadmin@shubharambh.com` |
| **Admin** | `admin` | `admin@shubharambh.com` |
| **Sales Manager** | `salesmanager` | `salesmanager@shubharambh.com` |
| **Sales Executive** | `salesexec` | `salesexec@shubharambh.com` |
| **Finance** | `finance` | `finance@shubharambh.com` |
| **Associate** | `associate` | `associate@shubharambh.com` |
| **Customer Support** | `support` | `support@shubharambh.com` |
| **Viewer** | `viewer` | `viewer@shubharambh.com` |

---

## 🚀 Setup & Execution Guide

### 1. Backend Express Server Setup

```bash
cd server
npm install
```

#### Run Database Migrations & Seed Default Accounts
```bash
npm run prisma:migrate
npm run prisma:seed
```

#### Launch Backend Server (Runs on http://localhost:5000)
```bash
npm run dev
```

---

### 2. Frontend React Setup

```bash
# In the root project directory
npm install
npm run dev
```

The frontend will run on **http://localhost:5173**.

---

## 📚 API Endpoint Reference

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/login`: Authenticates user & sets HttpOnly refresh cookie.
- `POST /api/auth/refresh`: Silently issues new Access Token using refresh cookie.
- `POST /api/auth/logout`: Revokes active refresh token & clears cookie.
- `POST /api/auth/logout-all`: Revokes all active device sessions for user.
- `POST /api/auth/change-password`: Updates password & invalidates prior sessions.
- `POST /api/auth/2fa/setup`: Generates TOTP secret, QR code & backup codes.
- `POST /api/auth/2fa/enable`: Verifies 6-digit OTP code to lock 2FA protection.

### Session Endpoints (`/api/sessions`)
- `GET /api/sessions/active`: Retrieves active devices, IP addresses, and browsers.
- `DELETE /api/sessions/:sessionId`: Revokes specific session token.
- `GET /api/sessions/history`: Fetches past 20 login attempts (success/failure).

### User Management Endpoints (`/api/users`)
- `GET /api/users/profile`: Retrieves authenticated user profile details.
- `GET /api/users`: Lists all users (`users:manage_roles` permission required).
- `PATCH /api/users/role`: Updates user role (`users:manage_roles` permission required).

### Audit Logs Endpoints (`/api/audit`)
- `GET /api/audit`: Returns paginated security audit trail logs (`audit_logs:read` permission required).
