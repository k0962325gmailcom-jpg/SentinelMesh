export function agentlessScan(){
  // Simulates scanning buckets for dormant malware
  const files = ["malware.exe","normal.pdf","mimikatz.exe"];
  const found = files.filter(f => Math.random() > 0.7);
  if(found.length > 0){
    console.log(`AGENTLESS FOUND: ${found.join(",")}`);
  }
  return found;
}

export function startAgentlessLoop(){
  setInterval(()=> agentlessScan(), 5000);
}
