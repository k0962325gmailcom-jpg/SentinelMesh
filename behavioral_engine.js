export function detectTrojan(req) {
  const suspicious = [
    req.headers['user-agent']?.includes('curl'),
    req.body?.length > 10000,
    JSON.stringify(req.body).includes('..\\..\\')
  ]
  if (suspicious.filter(Boolean).length >= 2) {
    return { detected: true, type: 'TROJAN', method: 'BEHAVIORAL_ANALYSIS', reason: 'Anomalous behavior' }
  }
  return { detected: false }
}