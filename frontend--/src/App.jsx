
import { useState, useEffect, useRef } from 'react'
import Globe from 'react-globe.gl'

const INDIA_HUB = { lat: 20.5937, lng: 78.9629, city: 'INDIA HUB', name: 'INDIA-HUB', ip: 'INDIA-MAIN' }

export default function App(){
  const [threats, setThreats] = useState([])
  const [soundOn, setSoundon] = useState(true)
  const [voice, setVoice] = useState(true)
  const globeRef = useRef()
  const prevBlocked = useRef(0)

  const blocked = threats.filter(t=>t.action==='BLOCKED').length

  const playSound = () => {
    if(!soundOn) return
    const ctx = new (window.AudioContext||window.webkitAudioContext)()
    const o = ctx.createOscillator()
    o.connect(ctx.destination)
    o.frequency.value = 900
    o.start()
    o.stop(ctx.currentTime+0.4)
  }

  useEffect(()=>{
    const fetchLive = () => {
      fetch('http://localhost:5000/api/threats')
       .then(r=>r.json())
       .then(data=>{
          setThreats(data)
          const newBlocked = data.filter(t=>t.action==='BLOCKED').length
          if(newBlocked > prevBlocked.current){
            playSound()
            if(voice && data[0]){
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${data[0].name} attacking India Hub from ${data[0].city}`))
            }
          }
          prevBlocked.current = newBlocked
        })
    }
    fetchLive()
    const interval = setInterval(fetchLive, 2000)
    return ()=>clearInterval(interval)
  },[soundOn, voice])

  useEffect(()=>{
    if(globeRef.current){
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.4
      globeRef.current.pointOfView({lat: 20.59, lng: 78.96, altitude: 2.0}) // Focus on INDIA
    }
  },[])

  // Arcs from threats TO INDIA HUB
  const arcsData = threats.map(t=>({
    startLat: t.lat,
    startLng: t.lng,
    endLat: INDIA_HUB.lat,
    endLng: INDIA_HUB.lng,
    color: t.action==='BLOCKED'? ['red','orange'] : ['green','cyan'],
    status: t.action
  }))

  // Points = India Hub + threats
  const allPoints = [
    {...INDIA_HUB, action:'HUB', type:'INDIA HUB', color:'gold', size:1.5 },
   ...threats
  ]

  return(
    <div style={{background:'#020617',color:'white',minHeight:'100vh',padding:10,fontFamily:'monospace'}}>
      <h2 style={{margin:5}}>🛡️ SentinelMesh - INDIA HUB LIVE 🇮🇳 {new Date().toLocaleTimeString()}</h2>
      <div style={{display:'flex',gap:10,height:'85vh'}}>
        {/* LEFT */}
        <div style={{width:240,background:'#0f172a',border:'2px solid gold',borderRadius:10,padding:10}}>
          <h3 style={{color:'gold'}}>📊 Stats + Location:</h3>
          <p>Blocked: <b style={{color:'#ff0000',fontSize:28}}>{blocked}</b></p>
          <p>Monitored: {threats.length-blocked}</p>
          <p style={{fontSize:12, color:'#fbbf24'}}>📍 HUB: INDIA (20.59, 78.96)</p>
          <p style={{fontSize:11}}>Backend: ✅ LIVE India Hub</p>
          <button onClick={()=>setSoundon(!soundOn)} style={{width:'100%',padding:8,margin:'4px 0',background:soundOn?'#0f0':'#333',border:'none',borderRadius:5}}>🔊 Sound: {soundOn?'ON':'OFF'}</button>
          <button onClick={()=>setVoice(!voice)} style={{width:'100%',padding:8,background:voice?'#0af':'#333',border:'none',borderRadius:5}}>🎤 Voice: {voice?'ON':'OFF'}</button>
          <div style={{marginTop:10,background:'#000',padding:8,borderRadius:5,fontSize:11}}>
            <div>🇮🇳 India Hub: SAVED ✅</div><div>🌍 Globe: ✅</div><div>🔴 Arcs to India: ✅</div><div>🦠 Live: 2s</div>
          </div>
        </div>

        {/* CENTER - GLOBE WITH INDIA HUB */}
        <div style={{flex:1,background:'#000',borderRadius:10,overflow:'hidden',border:'2px solid gold'}}>
          <Globe
            ref={globeRef}
            width={680}
            height={520}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            pointsData={allPoints}
            pointLat="lat"
            pointLng="lng"
            pointColor={d=> d.action==='HUB'? 'gold' : d.action==='BLOCKED'? 'red' : '#00ff00'}
            pointAltitude={d=> d.action==='HUB'? 0.4 : d.action==='BLOCKED'? 0.25 : 0.05}
            pointRadius={d=> d.action==='HUB'? 0.8 : d.action==='BLOCKED'? 0.6 : 0.3}
            pointLabel={d=>`<div style="background:#000;padding:6px;border-radius:4px;border:1px solid gold"><b>${d.name}</b><br/>${d.city||d.type}<br/>${d.ip}<br/>${d.action}</div>`}

            arcsData={arcsData}
            arcStartLat={d=>d.startLat}
            arcStartLng={d=>d.startLng}
            arcEndLat={d=>d.endLat}
            arcEndLng={d=>d.endLng}
            arcColor={d=>d.color}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcStroke={d=>d.status==='BLOCKED'?1:0.5}
            onPointClick={d=>{ playSound(); }}
          />
        </div>

        {/* RIGHT */}
        <div style={{width:280,background:'#0f172a',borderRadius:10,padding:10,overflowY:'auto'}}>
          <h4>🇮🇳 India Hub - Live Attacks</h4>
          <div style={{background:'rgba(255,215,0,0.1)',border:'1px solid gold',padding:6,borderRadius:4,marginBottom:8,fontSize:11}}>
            <b style={{color:'gold'}}>⬤ INDIA HUB</b><br/>20.59N, 78.96E<br/>All threats routed here
          </div>
          {threats.map((t,i)=>(
            <div key={i} style={{background: i===0?'#450a0a':'#1e293b',margin:'6px 0',padding:8,borderLeft:`4px solid ${t.action==='BLOCKED'?'red':'#0f0'}`,borderRadius:4}}>
              <div style={{fontWeight:'bold',fontSize:12}}>{i===0?'🆕 ':''}{t.name} → INDIA</div>
              <div style={{color:'cyan',fontSize:11}}>{t.detectionType}</div>
              <div style={{fontSize:10}}>📍 {t.city} → 🇮🇳 Hub</div>
              <div style={{fontSize:10}}>{t.ip} | {t.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}