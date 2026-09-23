import express from 'express'
import cors from 'cors'
import { signatures } from './signature_db.js'
import { agentlessScan } from './agentless_scanner.js'
import { detectTrojan } from './behavioral_engine.js'
import { blockThreat } from './blocker.js'

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

let threats = []

// --- THIS IS THE MISSING LINK ---

function fullSecurityCheck(payload, req) {
  // 1. Signature Matching
  const sig = agentlessScan(payload)
  if (sig.detected) {
    return sig
  }
  // 2. Behavioral Engine - TROJAN detection
  const behav = detectTrojan(req || { body: payload, headers: {} })
  if (behav.detected) {
    return behav
  }
  return { detected: false }
}

// Generate live threats WITH behavioural engine
setInterval(() => {
  const fakePayload = {
    city: ['China','Bangalore','Japan','Russia','USA'][Math.floor(Math.random()*5)],
    lat: (Math.random()*180-90),
    lng: (Math.random()*360-180),
    data: Math.random() > 0.7 ? 'powershell -enc abc' : 'normal request'
  }
  
  const check = fullSecurityCheck(fakePayload, { body: fakePayload, headers: { 'user-agent': 'test' } })
  
  const newThreat = {
    id: Date.now(),
    city: fakePayload.city,
    lat: fakePayload.lat,
    lng: fakePayload.lng,
    type: check.detected ? check.type : 'BENIGN',
    method: check.detected ? (check.method || 'BEHAVIORAL') : 'NONE',
    action: check.detected ? 'BLOCKED' : 'MONITORED',
    blockedAt: check.detected ? new Date().toLocaleTimeString() : null,
    reason: check.reason || check.match || ''
  }

  // 3. Blocker
  if (check.detected) {
    blockThreat(newThreat)
  }

  threats.unshift(newThreat)
  if (threats.length > 50) threats.pop()

}, 2000)

// API Routes
app.get('/api/threats', (req, res) => {
  res.json(threats)
})

app.post('/api/scan', (req, res) => {
  const result = fullSecurityCheck(req.body, req)
  if (result.detected) {
    const threat = {
      id: Date.now(),
      city: 'Manual Scan',
      lat: 20.59, lng: 78.96,
      ...result,
      action: 'BLOCKED',
      blockedAt: new Date().toLocaleTimeString()
    }
    threats.unshift(threat)
    return res.json({ blocked: true, details: result })
  }
  res.json({ blocked: false, status: 'CLEAN' })
})

app.get('/', (req,res)=> res.send('SentinelMesh LIVE with Behavioural Engine'))

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log('LIVE on', PORT))