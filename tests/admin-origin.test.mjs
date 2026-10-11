import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSameOrigin } from '../src/lib/admin/session.ts';

function withRailwayDomain(domain, run) {
  const previous = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (domain === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
  else process.env.RAILWAY_PUBLIC_DOMAIN = domain;
  try { run(); } finally {
    if (previous === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
    else process.env.RAILWAY_PUBLIC_DOMAIN = previous;
  }
}

test('Railway HTTPS origin is accepted despite the internal HTTP URL', () => {
  withRailwayDomain('locadedcar-production.up.railway.app', () => {
    const request = new Request('http://localhost:8080/api/admin/session', {
      headers: { origin: 'https://locadedcar-production.up.railway.app', host: 'locadedcar-production.up.railway.app', 'sec-fetch-site': 'same-origin' },
    });
    assert.equal(isSameOrigin(request), true);
  });
});

test('Railway rejects foreign, missing, null, insecure and cross-site origins', () => {
  withRailwayDomain('locadedcar-production.up.railway.app', () => {
    for (const origin of [undefined, 'null', 'https://evil.test', 'http://locadedcar-production.up.railway.app', 'https://locadedcar-production.up.railway.app.evil.test']) {
      const headers = { host: 'locadedcar-production.up.railway.app' };
      if (origin !== undefined) headers.origin = origin;
      assert.equal(isSameOrigin(new Request('http://localhost:8080/api/admin/session', { headers })), false);
    }
    assert.equal(isSameOrigin(new Request('http://localhost:8080/api/admin/session', {
      headers: { origin: 'https://locadedcar-production.up.railway.app', 'sec-fetch-site': 'cross-site' },
    })), false);
    assert.equal(isSameOrigin(new Request('http://localhost:8080/api/admin/session', {
      headers: { origin: 'https://evil.test', host: 'evil.test', 'x-forwarded-host': 'evil.test', 'x-forwarded-proto': 'https' },
    })), false);
  });
});

test('local development still compares the host and port', () => {
  withRailwayDomain(undefined, () => {
    assert.equal(isSameOrigin(new Request('http://localhost:3000/api/admin/session', {
      headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' },
    })), true);
    assert.equal(isSameOrigin(new Request('http://localhost:3000/api/admin/session', {
      headers: { origin: 'http://127.0.0.1:3001', host: '127.0.0.1:3000' },
    })), false);
  });
});
