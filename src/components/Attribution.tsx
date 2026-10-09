import { useState } from 'react'

// The StatsBomb Public Data User Agreement (§1.4) requires every publication of
// analysis based on their data to show the StatsBomb logo. Download it from
// https://statsbomb.com/media-pack/ and save it as public/statsbomb-logo.png.
// Until then, only the text credit is shown.
const LOGO = `${import.meta.env.BASE_URL}statsbomb-logo.png`

export function Attribution() {
  const [logoMissing, setLogoMissing] = useState(false)
  return (
    <footer className="attribution">
      {!logoMissing && <img src={LOGO} alt="StatsBomb" height={28} onError={() => setLogoMissing(true)} />}
      <p>
        Data: <a href="https://github.com/statsbomb/open-data">StatsBomb open data</a>, used under the StatsBomb
        Public Data User Agreement. The analysis on this page is my own and not necessarily StatsBomb's view.
      </p>
    </footer>
  )
}
