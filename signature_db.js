export const signatures = [
  { name: 'Mimikatz', pattern: 'mimikatz', score: 0.99, action: 'BLOCKED' },
  { name: 'EICAR', pattern: 'eicar', score: 0.99, action: 'BLOCKED' },
  { name: 'XMRig', pattern: 'xmrig', score: 0.95, action: 'BLOCKED' },
  { name: 'Malware', pattern: 'malware', score: 0.90, action: 'BLOCKED' }
];
export function checkSignature(name){
  if(!name) return null;
  const low = name.toLowerCase();
  for(const s of signatures){
    if(low.includes(s.pattern)) return s;
  }
  return null;
}