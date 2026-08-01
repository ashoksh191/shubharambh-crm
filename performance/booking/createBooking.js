import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 25 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const payload = JSON.stringify({
    plotId: 'plot-101-guid',
    customerName: 'K6 Load Test Customer',
    customerPhone: '9876543210',
    bookingAmount: 50000,
    paymentMode: 'UPI',
    utrNumber: `UTR-${Math.floor(Math.random() * 1000000000)}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-k6-token',
    },
  };

  const res = http.post(`${BASE_URL}/api/v1/booking`, payload, params);

  check(res, {
    'status is 201 or 409 OCC Conflict': (r) => r.status === 201 || r.status === 409,
  });

  sleep(1);
}
