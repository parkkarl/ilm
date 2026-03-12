import { useState } from 'react'

function fetchForecast(lat: number, lon: number) {
  return fetch(
    `https://api.kalaradar.ee/api/weather/met-forecast?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}`,
  )
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
        return `${Math.round(closest.temp)}°`
      }
      throw new Error('no temp')
    })
}

function reverseGeocode(lat: number, lon: number) {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
  )
    .then((res) => res.json())
    .then((data) => {
      const addr = data?.address
      return addr?.city || addr?.town || addr?.village || addr?.county || ''
    })
    .catch(() => '')
}

export function App() {
  const [temp, setTemp] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [asked, setAsked] = useState(false)

  function requestLocation() {
    setAsked(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetchForecast(latitude, longitude)
          .then(setTemp)
          .catch(() => setError(true))
        reverseGeocode(latitude, longitude).then((name) => {
          if (name) setLocation(name)
        })
      },
      () => {
        fetchForecast(59.44, 24.75)
          .then(setTemp)
          .catch(() => setError(true))
        setLocation('Tallinn')
      },
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#fff',
        margin: 0,
      }}
    >
      {!asked ? (
        <button
          onClick={requestLocation}
          style={{
            fontSize: '1.2rem',
            fontWeight: 400,
            color: '#222',
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '0.6em 1.2em',
            cursor: 'pointer',
          }}
        >
          Anna nõusolek
        </button>
      ) : (
        <>
          <span style={{ fontSize: '6rem', fontWeight: 300, color: '#222' }}>
            {error ? '–' : temp ?? ''}
          </span>
          {location && (
            <span style={{ fontSize: '1.2rem', fontWeight: 400, color: '#888' }}>
              {location}
            </span>
          )}
        </>
      )}
    </div>
  )
}
