import { useState, useEffect } from 'react'
import { db } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'

const LEVELS = [
  { level: 1, title: "Beginner", minXp: 0, maxXp: 99 },
  { level: 2, title: "Warrior", minXp: 100, maxXp: 249 },
  { level: 3, title: "Knight", minXp: 250, maxXp: 449 },
  { level: 4, title: "Master", minXp: 450, maxXp: 699 },
  { level: 5, title: "Champion", minXp: 700, maxXp: 999 },
  { level: 6, title: "Legend", minXp: 1000, maxXp: 1499 },
  { level: 7, title: "Mythic", minXp: 1500, maxXp: 2099 },
  { level: 8, title: "Immortal", minXp: 2100, maxXp: 2799 },
  { level: 9, title: "Titan", minXp: 2800, maxXp: 3599 },
  { level: 10, title: "GOD", minXp: 3600, maxXp: 999999 },
]

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [xp, setXp] = useState(0)
  const [isLogin, setIsLogin] = useState(true)
  const auth = getAuth()

  const getLevelInfo = (totalXp) => {
    let current = LEVELS[0]
    for (let l of LEVELS) {
      if (totalXp >= l.minXp && totalXp <= l.maxXp) { current = l; break }
      if (totalXp >= l.minXp) current = l
    }
    const isMax = current.level === 10
    const xpInLevel = totalXp - current.minXp
    const xpNeeded = current.maxXp - current.minXp + 1
    const progress = isMax? 100 : (xpInLevel / xpNeeded) * 100
    return {...current, xpInLevel, xpNeeded, progress, isMax, totalXp }
  }
  const info = getLevelInfo(xp)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) setXp(snap.data().xp)
          else setXp(0)
        } catch { setXp(0) }
      }
    })
    return () => unsub()
  }, [])

  const handleAuth = async () => {
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password)
      else await createUserWithEmailAndPassword(auth, email, password)
    } catch (e) { alert(e.message) }
  }

  const completeQuest = async (points) => {
    const newXp = Math.min(xp + points, 3600)
    setXp(newXp)
    if (user) {
      await setDoc(doc(db, "users", user.uid), { xp: newXp, email: user.email })
    }
  }

  // LOGIN SCREEN - BaaS Auth
  if (!user) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div style={{ background: "#1e293b", padding: "30px", borderRadius: "15px", width: "300px", textAlign: "center" }}>
          <h2>⚔️ LIFE RPG ⚔️</h2>
          <p>{isLogin? "Login" : "Register"} with BaaS</p>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "8px", border: "none" }} />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: "100%", padding: "10px", margin: "8px 0", borderRadius: "8px", border: "none" }} />
          <button onClick={handleAuth} style={{ width: "100%", padding: "10px", background: "#3b82f6", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>{isLogin? "Login" : "Create Account"}</button>
          <p onClick={()=>setIsLogin(!isLogin)} style={{ fontSize: "12px", cursor: "pointer", color: "#94a3b8", marginTop: "15px" }}>{isLogin? "No account? Register" : "Have account? Login"}</p>
        </div>
      </div>
    )
  }

  // GAME SCREEN
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>👋 {user.email}</h3>
        <button onClick={()=>signOut(auth)} style={{ background: "#ef4444", border: "none", padding: "6px 12px", borderRadius: "6px", color: "white", cursor: "pointer" }}>Logout</button>
      </div>
      <h1 style={{ textAlign: "center" }}>⚔️ LIFE RPG ⚔️</h1>
      <div style={{ background: "#1e293b", padding: "15px", borderRadius: "12px", textAlign: "center" }}>
        <h2>Level {info.level}/10 - {info.title} {info.isMax && "👑 MAX!"}</h2>
        <p>{info.totalXp}/3600 XP</p>
        {!info.isMax && <><div style={{ background: "#334155", height: "20px", borderRadius: "10px" }}><div style={{ background: "#22c55e", width: `${info.progress}%`, height: "20px", borderRadius: "10px" }}></div></div><p>{Math.round(info.progress)}% to next level</p></>}
      </div>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ background: "#1e3a8a", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}><span>Workout +25</span><button onClick={() => completeQuest(25)} style={{ background: "#22c55e", border: "none", padding: "5px 12px", borderRadius: "5px", color: "white" }}>Done</button></div>
        <div style={{ background: "#1e3a8a", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}><span>Code +30</span><button onClick={() => completeQuest(30)} style={{ background: "#22c55e", border: "none", padding: "5px 12px", borderRadius: "5px", color: "white" }}>Done</button></div>
        <div style={{ background: "#1e3a8a", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}><span>Read +20</span><button onClick={() => completeQuest(20)} style={{ background: "#22c55e", border: "none", padding: "5px 12px", borderRadius: "5px", color: "white" }}>Done</button></div>
      </div>
    </div>
  )
}
export default App
