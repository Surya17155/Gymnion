/**
 * Minimal, Worker-compatible Google Sheets client.
 * Uses Web Crypto (RS256 JWT) + fetch instead of the Node-only `googleapis`
 * package, which cannot run in the edge runtime.
 */

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

function base64url(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(cleaned);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

export type ServiceAccount = { client_email: string; private_key: string };

export async function getAccessToken(credentials: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: credentials.client_email,
      scope: SHEETS_SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }),
  );
  const toSign = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(credentials.private_key.replace(/\\n/g, '\n')),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(toSign),
  );
  const jwt = `${toSign}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export class SheetsClient {
  constructor(private token: string, private spreadsheetId: string) {}

  private async call(path: string, init: RequestInit = {}) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      },
    );
    if (!res.ok) throw new Error(`Sheets API ${path} failed: ${res.status} ${await res.text()}`);
    return res.json() as Promise<any>;
  }

  listSheetTitles(): Promise<string[]> {
    return this.call('?fields=sheets.properties.title').then((data) =>
      (data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean),
    );
  }

  addSheet(title: string) {
    return this.call(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    });
  }

  getValues(range: string): Promise<string[][]> {
    return this.call(`/values/${encodeURIComponent(range)}`).then((d) => d.values || []);
  }

  append(range: string, values: (string | number)[][]) {
    return this.call(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', body: JSON.stringify({ values }) },
    );
  }

  update(range: string, values: (string | number)[][]) {
    return this.call(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
  }

  clear(range: string) {
    return this.call(`/values/${encodeURIComponent(range)}:clear`, { method: 'POST', body: '{}' });
  }
}

export async function createSheetsClient(
  serviceAccountJson: string,
  spreadsheetId: string,
): Promise<SheetsClient> {
  const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;
  const token = await getAccessToken(credentials);
  return new SheetsClient(token, spreadsheetId);
}
