import { NativeModules, Platform } from 'react-native';

const INGEST_PATH = '/ingest/188086e2-e435-49ea-98d2-b1b490fd324d';
const SESSION = 'fa07b4';

function ingestHosts(): string[] {
  const hosts = new Set(['127.0.0.1', '10.0.2.2']);
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  const host = scriptURL?.match(/^https?:\/\/([^/:]+)/)?.[1];
  if (host) hosts.add(host);
  return [...hosts];
}

/** Debug-mode ingest. Also posts to the Metro host so a physical phone can reach the PC. */
export function agentDebugLog(entry: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  const body = JSON.stringify({
    sessionId: SESSION,
    runId: 'post-fix',
    timestamp: Date.now(),
    ...entry,
    data: { platform: Platform.OS, scriptURL: NativeModules.SourceCode?.scriptURL ?? null, ...entry.data },
  });
  const headers = { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION };
  for (const host of ingestHosts()) {
    // #region agent log
    fetch(`http://${host}:7582${INGEST_PATH}`, { method: 'POST', headers, body }).catch(() => {});
    // #endregion
  }
}
