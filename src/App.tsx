import { useState, useEffect } from 'react'

export function App() {
  const [temp, setTemp] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('https://api.kalaradar.ee/api/weather/met-forecast?lat=59.44&lon=24.75')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then((data) => {
        const now = Date.now()
        const hourly = data?.hourly ?? []
        let closest = hourly[0]
        let minDiff = Infinity
        for (const h of hourly) {
          const diff = Math.abs(new Date(h.time).getTime() - now)
          if (diff < minDiff) {
            minDiff = diff
            closest = h
          }
        }
        if (closest?.temp != null) {
          setTemp(`${Math.round(closest.temp)}°`)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#fff',
        margin: 0,
      }}
    >
      <span style={{ fontSize: '6rem', fontWeight: 300, color: '#222' }}>
        {error ? '–' : temp ?? ''}
      </span>
    </div>
  )
}
