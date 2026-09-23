export const signatures = [
  { id: 'TROJAN-1', pattern: 'cmd.exe /c', type: 'TROJAN', severity: 'CRITICAL' },
  { id: 'TROJAN-2', pattern: 'powershell -enc', type: 'TROJAN', severity: 'CRITICAL' },
  { id: 'MAL-1', pattern: 'eval(base64_decode', type: 'MALWARE', severity: 'HIGH' },
  { id: 'XSS-1', pattern: '<script>alert', type: 'XSS', severity: 'MEDIUM' }
]

export function checkSignature(payload) {
  const content = JSON.stringify(payload).toLowerCase()
  for (const sig of signatures) {
    if (content.includes(sig.pattern.toLowerCase())) {
      return { detected: true, ...sig, match: sig.pattern, method: 'SIGNATURE_MATCHING' }
    }
  }
  return { detected: false }
}

// for compatibility with my old code
export function agentlessScan(payload) {
  return checkSignature(payload)
}