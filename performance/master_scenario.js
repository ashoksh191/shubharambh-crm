import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  scenarios: {
    baseline_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 250 },
        { duration: '15s', target: 500 }, // Peak Spike Test
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  group('1. Authentication Flow', function () {
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
      identifier: 'superadmin',
      password: 'Password@123456',
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, { 'login status 200': (r) => r.status === 200 });
  });

  group('2. GIS & Plot Cache Query', function () {
    const plotRes = http.get(`${BASE_URL}/api/v1/plots`);
    check(plotRes, { 'plots status 200': (r) => r.status === 200 });
  });

  group('3. Health & Readiness Probe', function () {
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, { 'health status 200': (r) => r.status === 200 });
  });

  sleep(1);
}
