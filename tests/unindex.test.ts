import { test, expect } from 'bun:test';
import { publicJobId } from '../shared/job';
import { unindexJob } from '../server/utils/typesense';

test('unindex deletes the public document id, not a Postgres id', async () => {
  const previous = process.env.TYPESENSE_ADMIN_KEY;
  const realFetch = globalThis.fetch;
  process.env.TYPESENSE_ADMIN_KEY = 'test-key';
  let url = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    url = String(input);
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  try {
    await unindexJob(publicJobId({ id: 'uuid-1', source: 'employer', external_id: null }));
    expect(url.endsWith('/collections/jobs/documents/emp-uuid-1')).toBe(true);
    expect(url.includes('/emp-emp-')).toBe(false);

    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
    await expect(unindexJob('emp-uuid-1')).rejects.toThrow('typesense delete 500');
  } finally {
    globalThis.fetch = realFetch;
    if (previous === undefined) delete process.env.TYPESENSE_ADMIN_KEY;
    else process.env.TYPESENSE_ADMIN_KEY = previous;
  }
});
