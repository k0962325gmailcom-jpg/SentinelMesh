// WRONG: import { checkSignature } from './signature_db.js';
// CORRECT:
import { checkSignature } from './signature_db.js'
import { signatures } from './signature_db.js' // if you need

export function blockThreat(threat) {
  console.log(`🚫 BLOCKED ${threat.type} from ${threat.city} via ${threat.method}`)
  return true
}