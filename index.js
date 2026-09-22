import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ================== INDIA HUB SAVED ==================
const INDIA_HUB = {
  lat: 20.5937,
  lng: 78.9629,
  city: "INDIA HUB",
  country: "India",
  name: "INDIA-HUB",
  ip: "INDIA-MAIN-SERVER"
};

// ================== SIGNATURE DB ==================
const sigDB = {
  "mimikatz": { type: "Mimikatz", score: 0.99 },
  "eicar": { type: "EICAR", score: 0.99 },
  "xmrig": { type: "XMRig", score: 0.95 },
  "trojan": { type: "Trojan", score: 0.92 },
  "ransom": { type: "Ransomware", score: 0.98 },
  "encrypt": { type: "Ransomware", score: 0.98 },
  "keylog": { type: "Keylogger", score: 0.94 }
};

function checkThreat(t) {
  const low = t.name.toLowerCase();
  for (let k in sigDB) {
    if (low.includes(k)) {
      return {
       ...t,
        type: sigDB[k].type,
        action: "BLOCKED",
        detectionType: `Signature(${sigDB[k].type})`,
        score: sigDB[k].score,
        blockedAt: new Date().toLocaleTimeString()
      };
    }
  }
  return {
   ...t,
    type: "Clean",
    action: "MONITORED",
    detectionType: "AI-Behavior",
    score: parseFloat((0.15 + Math.random() * 0.3).toFixed(2)),
    blockedAt: null
  };
}

// ================== INITIAL THREATS ==================
let liveThreats = [
  { name: "mimikatz.exe", lat: 40.71, lng: -74.00, ip: "45.149.0.1", city: "New York" },
  { name: "eicar_test.exe", lat: 51.50, lng: -0.12, ip: "45.114.0.1", city: "London" },
  { name: "xmrig.exe", lat: 35.68, lng: 139.69, ip: "45.62.0.1", city: "Tokyo" },
  { name: "chrome.exe", lat: 28.61, lng: 77.20, ip: "192.168.1.5", city: "Delhi" }
].map(t => checkThreat(t));

// ================== LIVE THREAT GENERATOR ==================
const threatPool = [
  "mimikatz.exe", "eicar_test.exe", "xmrig.exe",
  "trojan_dropper.exe", "ransom_encrypt.exe", "keylogger.exe",
  "chrome.exe", "svchost.exe", "explorer.exe", "discord.exe", "notepad.exe"
];

const worldLocations = [
  { lat: 40.71, lng: -74.00, city: "USA" },
  { lat: 51.50, lng: -0.12, city: "UK" },
  { lat: 35.68, lng: 139.69, city: "Japan" },
  { lat: 55.75, lng: 37.61, city: "Russia" },
  { lat: 39.90, lng: 116.40, city: "China" },
  { lat: -33.86, lng: 151.20, city: "Australia" },
  { lat: 19.07, lng: 72.87, city: "Mumbai" },
  { lat: 12.97, lng: 77.59, city: "Bangalore" },
  { lat: 28.61, lng: 77.20, city: "Delhi" },
  { lat: 13.08, lng: 80.27, city: "Chennai" }
];

function generateLiveThreat() {
  const name = threatPool[Math.floor(Math.random() * threatPool.length)];
  const loc = worldLocations[Math.floor(Math.random() * worldLocations.length)];
  const base = {
    name,
    lat: loc.lat + (Math.random() - 0.5) * 1.5,
    lng: loc.lng + (Math.random() - 0.5) * 1.5,
    ip: `${Math.floor(Math.random() * 223)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    city: loc.city,
    time: new Date().toLocaleTimeString(),
    target: "INDIA HUB"
  };
  const checked = checkThreat(base);
  liveThreats.unshift(checked);
  if (liveThreats.length > 15) liveThreats.pop();
  console.log(`[LIVE] ${checked.name} -> ${checked.action} from ${checked.city} -> INDIA HUB | ${checked.detectionType}`);
}

// New threat every 2.5 seconds
setInterval(generateLiveThreat, 2500);

// ================== API ROUTES ==================
app.get("/", (req, res) => {
  res.send("✅ SentinelMesh INDIA HUB Backend Running - Use /api/threats");
});

app.get("/api/threats", (req, res) => {
  res.json(liveThreats);
});

app.get("/api/india-hub", (req, res) => {
  res.json({
    hub: INDIA_HUB,
    threats: liveThreats,
    total: liveThreats.length,
    blocked: liveThreats.filter(t => t.action === 'BLOCKED').length,
    monitored: liveThreats.filter(t => t.action === 'MONITORED').length,
    live: true
  });
});

app.get("/api/scan", (req, res) => {
  res.json({
    status: "Agentless LIVE",
    method: "Cloud API Scan - No Agent Needed",
    hub: INDIA_HUB,
    scanned: 150 + Math.floor(Math.random() * 50),
    lastScan: new Date().toLocaleTimeString(),
    agentless: true
  });
});

app.get("/api/stats", (req, res) => {
  const blocked = liveThreats.filter(t => t.action === 'BLOCKED').length;
  res.json({
    total: liveThreats.length,
    blocked,
    monitored: liveThreats.length - blocked,
    hub: INDIA_HUB,
    live: true,
    globe: "Visible"
  });
});

// ================== START SERVER ==================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n✅ INDIA HUB LIVE Backend Running on http://localhost:${PORT}`);
  console.log(`🇮🇳 Hub Location: ${INDIA_HUB.lat}, ${INDIA_HUB.lng} - ${INDIA_HUB.city}`);
  console.log(`🌍 Globe Arcs: Enabled - Threats -> India Hub`);
  console.log(`🔴 Live Threats: Every 2.5 seconds\n`);
});