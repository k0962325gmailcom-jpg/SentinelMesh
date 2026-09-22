import { checkSignature } from './signature_db.js';
export function checkThreat(t){
  const sig = checkSignature(t.name);
  if(sig){
    return { name: t.name, type: sig.name, action: 'BLOCKED', detectionType: `Signature(${sig.name})`, score: sig.score, lat: 20+Math.random()*20, lng: 78+Math.random()*20, ip: `45.${Math.floor(Math.random()*255)}.0.1` };
  }
  return { name: t.name, type: 'Clean', action: 'MONITORED', detectionType: 'AI-Behavior', score: 0.2, lat: 20+Math.random()*20, lng: 78+Math.random()*20, ip: `192.168.1.${Math.floor(Math.random()*100)}` };
}