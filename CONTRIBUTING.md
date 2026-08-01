# Contributing to Shubharambh CRM

Thank you for your interest in contributing to **Shubharambh CRM**! We welcome bug fixes, feature enhancements, documentation improvements, and performance optimizations.

---

## 📜 Code of Conduct

Please maintain a professional, courteous, and constructive environment for all contributors.

---

## 🛠️ How to Contribute

1. **Fork the Repository**:
   - Create your feature branch off `main` or `release/v1.0.0-rc1`: `git checkout -b feature/amazing-feature`.

2. **Code Standards**:
   - Write strict TypeScript code.
   - Run `npm run typecheck` to verify no compilation errors exist.
   - Run `npm run lint` to fix any linting issues.

3. **Testing**:
   - Add unit tests under `src/__tests__/` for new business logic.
   - Add Playwright E2E specs under `e2e/` for new user journeys.
   - Run `npm run test` and `npx playwright test` to verify 100% test pass rate.

4. **Commit Messages**:
   Follow conventional commits format:
   - `feat(gis): add spatial quadtree tile indexing`
   - `fix(booking): resolve race condition in payment verification`
   - `perf(redis): optimize plot list cache invalidation`
   - `docs(readme): update API endpoint reference table`

5. **Submit a Pull Request**:
   - Open a PR against `main` on GitHub with a clear description of changes.
