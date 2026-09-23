
import { useState, useEffect, useRef } from 'react'
import Globe from 'react-globe.gl'

const CITIES = [
  { city: 'China', lat: 35.86, lng: 104.19 },
  { city: 'USA', lat: 37.09, lng: -95.71 },
  { city: 'Russia', lat: 61.52, lng: 105.31 },
  { city: 'Bangalore', lat: 12.97, lng: 77.59 },
  { city: 'Japan', lat: 36.20, lng: 138.25 },
]

const VIRUSES = [
  { type:"Trojan", sig:"EICAR-TEST", risk:"High" },
  { type:"Ransomware", sig:"SIG.RANSOM.POWERSHELL", risk:"Critical" },
  { type:"Worm", sig:"SIG.WORM.SQL", risk:"High" },
  { type:"Keylogger", sig:"SIG.KEYLOG.WIN32", risk:"Medium" },
  { type:"Rootkit", sig:"SIG.ROOTKIT.TDSS", risk:"Critical" },
  { type:"Spyware", sig:"SIG.SPYWARE.COOKIE", risk:"Medium" },
]

export default function App() {
  const globeRef = useRef()
  const audioRef = useRef(null)
  const [soundOn, setSoundOn] = useState(false)
  const [aiVoiceOn, setAiVoiceOn] = useState(true)
  const [threats, setThreats] = useState([])
  const [arcs, setArcs] = useState([])
  const [stats, setStats] = useState({ blocked:0, sig:0, beh:0, agent:0 })

  const enableSound = () => {
    try{
      if(!audioRef.current) audioRef.current = new (window.AudioContext||window.webkitAudioContext)()
      audioRef.current.resume()
      setSoundOn(true)
      const o=audioRef.current.createOscillator(); const g=audioRef.current.createGain()
      o.connect(g); g.connect(audioRef.current.destination); o.frequency.value=880; g.gain.value=0.15
      o.start(); o.stop(audioRef.current.currentTime+0.2)
      const welcome = new SpeechSynthesisUtterance("AI Threat Defense System Activated. India hub at 20.59 North, 78.96 East is now monitoring global threats with location tracking.")
      window.speechSynthesis.speak(welcome)
    }catch(e){}
  }

  const beep = () => {
    if(!soundOn ||!audioRef.current) return
    try{ const o=audioRef.current.createOscillator(); const g=audioRef.current.createGain(); o.connect(g); g.connect(audioRef.current.destination); o.frequency.value=880; g.gain.value=0.1; o.start(); o.stop(audioRef.current.currentTime+0.1) }catch(e){}
  }

  const aiSpeakLocation = (city, lat, lng, type, method) => {
    if(!soundOn || !aiVoiceOn) return
    try{
      window.speechSynthesis.cancel()
      const latDir = lat>0 ? "North" : "South"
      const lngDir = lng>0 ? "East" : "West"
      // AI speaks location also
      const text = `${type} blocked from ${city}, location ${Math.abs(lat).toFixed(1)} ${latDir}, ${Math.abs(lng).toFixed(1)} ${lngDir}. ${method} matched. Threat redirected to India hub.`
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1.1
      utter.pitch = 0.9
      utter.volume = 1
      window.speechSynthesis.speak(utter)
    }catch(e){}
  }

  useEffect(()=>{
    const id=setInterval(()=>{
      const c=CITIES[Math.floor(Math.random()*CITIES.length)]
      const v=VIRUSES[Math.floor(Math.random()*VIRUSES.length)]
      const method=["SIGNATURE","BEHAVIOURAL","AGENTLESS_SCAN"][Math.floor(Math.random()*3)]
      
      beep()
      // Speak location 50% times to avoid spam
      if(Math.random()>0.5) aiSpeakLocation(c.city, c.lat, c.lng, v.type, method)

      setStats(s=>({ blocked:s.blocked+1, sig:s.sig+(method==="SIGNATURE"), beh:s.beh+(method==="BEHAVIOURAL"), agent:s.agent+(method==="AGENTLESS_SCAN") }))
      setThreats(p=>[{city:c.city, lat:c.lat.toFixed(2), lng:c.lng.toFixed(2), status:'BLOCKED', method, type:v.type, sig:v.sig, risk:v.risk, time:new Date().toLocaleTimeString()},...p].slice(0,12))
      setArcs(p=>[...p.slice(-12), {startLat:c.lat, startLng:c.lng, endLat:20.59, endLng:78.96, color:['#ff0000','#ffaa00']}])
    },3000)
    return()=>clearInterval(id)
  },[soundOn, aiVoiceOn])

  return (
    <div style={{display:'flex', width:'100vw', height:'100vh', background:'#020c1b', color:'white', fontFamily:'monospace'}} onClick={soundOn?undefined:enableSound}>
      <div style={{width:'390px', minWidth:'390px', background:'#0a1931', borderRight:'3px solid #ffaa00', padding:'10px', overflowY:'auto'}}>
        <h2 style={{color:'#ffaa00', textAlign:'center', fontSize:'16px'}}>🛡️ AI Defense + Location</h2>
        <h1 style={{textAlign:'center', color:'#ff4444', fontSize:'28px'}}>{stats.blocked} BLOCKED</h1>

        {!soundOn && <button onClick={enableSound} style={{width:'100%', background:'#ffaa00', color:'black', fontWeight:'bold', padding:'10px', borderRadius:'6px', cursor:'pointer', fontSize:'14px'}}>🔊 CLICK TO ENABLE AI + LOCATION SOUND</button>}
        {soundOn && <div style={{background:'#001', padding:'6px', borderRadius:'6px', fontSize:'10px', border:'1px solid #0f8'}}>
          <div>📍 HUB: INDIA (20.59°N, 78.96°E) - LIVE</div>
          <div>🔊 Beep: ON | 🤖 AI Voice + Location: <span style={{color: aiVoiceOn?'#0f8':'#f88'}}>{aiVoiceOn?'ON':'OFF'}</span></div>
          <div>🔒 Sig:{stats.sig} 🧠 Beh:{stats.beh} 👁️ Agent:{stats.agent}</div>
          <button onClick={()=>setAiVoiceOn(!aiVoiceOn)} style={{marginTop:'5px', width:'100%', background: aiVoiceOn?'#00aa00':'#660000', color:'white', padding:'4px', borderRadius:'4px', cursor:'pointer', fontSize:'10px'}}>
            {aiVoiceOn?'🔇 Mute AI Location Voice':'🔊 Enable AI Location Voice'}
          </button>
        </div>}

        <div style={{marginTop:'10px', fontSize:'10px'}}>
          {threats.map((t,i)=><div key={i} style={{borderBottom:'1px solid #222', padding:'6px 0', color:'#ffaaaa'}}>
            <b>{t.city} ({t.lat}, {t.lng})</b> - {t.status} <span style={{color:t.risk==='Critical'?'#ff0000':'#ffaa00'}}>[{t.risk}]</span><br/>
            <span style={{color:'#ffdd00'}}>[{t.method}]</span> <span style={{color:'#00ddff'}}>{t.type}</span><br/>
            <span style={{color:'#aaa'}}>📍 Loc: {t.lat}°N, {t.lng}°E | Sig: {t.sig}</span><br/>
            <span style={{color:'#666', fontSize:'9px'}}>{t.time}</span>
          </div>)}
        </div>
      </div>
      <div style={{flex:1, background:'black'}}>
        <Globe ref={globeRef} width={window.innerWidth-390} height={window.innerHeight} globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg" backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" arcsData={arcs} arcColor="color" arcDashLength={0.5} arcDashAnimateTime={1200} />
      </div>
    </div>
  )
}