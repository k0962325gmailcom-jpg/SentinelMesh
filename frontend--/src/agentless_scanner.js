import { signatures } from './signature_db.js'

export function agentlessScan(payload) {
  const content = JSON.stringify(payload).toLowerCase()
  for (const sig of signatures) {
    if (content.includes(sig.pattern.toLowerCase())) {
      return { 
        detected: true, 
        ...sig,
        match: sig.pattern,
        method: 'SIGNATURE_MATCHING'
      }
    }
  }
  return { detected: false }
}