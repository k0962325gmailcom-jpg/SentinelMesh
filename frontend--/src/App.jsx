
import { useEffect, useState, useRef } from 'react'
import Globe from 'react-globe.gl'

const API_URL = 'https://sentinelmesh-tbiv.onrender.com/api/threats'
const INDIA_HUB = { lat: 20.59, lng: 78.96 }

export default function App() {
  const [threats, setThreats] = useState([])
  const [blocked, setBlocked] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [voice, setVoice] = useState(false)
  const globeRef = useRef()

  useEffect(() => {
    const fetchThreats = () => {
      fetch(API_URL)
       .then(r => r.json())
       .then(data => {
          const list = Array.isArray(data)? data : data.threats || []
          setThreats(list)
          const b = list.filter(t => (t.action && t.action.includes('BLOCK')) || t.blockedAt).length
          setBlocked(b)

          if (voice && list.length > 0) {
            const last = list[0]
            if (last.city) {
              const msg = new SpeechSynthesisUtterance(`Threat blocked from ${last.city}`)
              speechSynthesis.speak(msg)
            }
          }
        })
       .catch(e => console.log(e))
    }

    fetchThreats()
    const id = setInterval(fetchThreats, 2000)
    return () => clearInterval(id)
  }, [voice])

  const arcsData = threats.map(t => ({
    startLat: t.lat,
    startLng: t.lng,
    endLat: INDIA_HUB.lat,
    endLng: INDIA_HUB.lng,
    color: (t.action?.includes('BLOCK') || t.blockedAt)? ['red','orange'] : ['#00ff00','cyan'],
    city: t.city
  }))

  return (
    <div style={{background: '#020617', color: 'white', minHeight: '100vh', padding: 10, fontFamily: 'monospace'}}>
      <h2 style={{margin:5}}>🛡️ SentinelMesh - INDIA HUB LIVE IN {new Date().toLocaleTimeString()} </h2>
      <div style={{display: 'flex', gap: 10, height: '85vh'}}>
        {/* LEFT */}
        <div style={{width: 240, background: '#0f172a', border: '2px solid gold', borderRadius: 10, padding: 10}}>
          <h3 style={{color: 'gold'}}>📊 Stats + Location:</h3>
          <p>Blocked: <b style={{color: '#ff0000', fontSize: 28}}>{blocked}</b></p>
          <p>Monitored: {threats.length - blocked}</p>
          <p style={{fontSize: 12, color: '#fbbf24'}}>📍 HUB: INDIA (20.59, 78.96)</p>
          <p style={{fontSize: 11}}>Backend: 🟢 LIVE India Hub: 🟢</p>
          <button onClick={()=>setSoundOn(!soundOn)} style={{width: '100%', padding: 8, background: soundOn?'green':'red', margin: '4px 0'}}>🔊 Voice: {soundOn?'ON':'OFF'}</button>
          <button onClick={()=>setVoice(!voice)} style={{width: '100%', padding: 8, borderRadius: 8, fontSize: 11}}>🎤 {voice?'Voice ON':'Voice OFF'}</button>
          <div style={{marginTop: 10, background: '#000', padding: 8, borderRadius: 8, fontSize: 11}}>
            <div>🇮🇳 India Hub: SAVED ✅</div>
            <div>🌐 Globe: ✅</div>
            <div>📡 Arcs to India: ✅ {arcsData.length}</div>
          </div>
          <div style={{marginTop:10, maxHeight: 200, overflowY: 'auto', fontSize: 10}}>
            {threats.slice(0,10).map((t,i)=>(
              <div key={i} style={{borderBottom: '1px solid #333', padding: 2}}>
                {t.city} - {t.action || 'BLOCKED'}
              </div>
            ))}
          </div>
        </div>

        {/* GLOBE */}
        <div style={{flex: 1, background: '#000', borderRadius: 10, overflow: 'hidden'}}>
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            arcsData={arcsData}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={1500}
            arcStroke={1.5}
            backgroundColor="#000"
            width={800}
            height={600}
          />
        </div>
      </div>
    </div>
  )
}