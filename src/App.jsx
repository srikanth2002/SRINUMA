import { useEffect, useRef, useState } from 'react'
import { T, ITEMS, PHONE, EMAIL } from './i18n.js'
import { LOGO_D, LOGO_W, LOGO_H, LOGO_TOP, LOGO_BOT } from './logoPath.js'

const LOGO = import.meta.env.BASE_URL + 'logo.png'
const fmt = (n) => n.toLocaleString('en-IN')

// Vector logo: the outline draws itself, then the gradient fills in. Crisp at any size.
function LogoMark() {
  return (
    <svg className="mark" viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LOGO_TOP} /><stop offset="1" stopColor={LOGO_BOT} />
        </linearGradient>
      </defs>
      <path className="mfill" d={LOGO_D} fill="url(#lg)" stroke="url(#lg)" strokeWidth="7" strokeLinejoin="round" fillRule="evenodd" />
      <path className="mline" d={LOGO_D} pathLength="1" fill="none" stroke="#1f5cff" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  )
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>
}

// Each digit is a rolling column, so the total ticks like an odometer.
function Odo({ value }) {
  const s = fmt(value)
  return (
    <span className="odo" aria-label={`₹${s}`}>
      ₹
      {[...s].map((c, i) =>
        /\d/.test(c) ? (
          <span key={s.length - i} className="col" aria-hidden="true">
            <span style={{ transform: `translateY(${-c * 10}%)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <b key={d}>{d}</b>)}
            </span>
          </span>
        ) : <span key={s.length - i}>{c}</span>
      )}
    </span>
  )
}

export default function App() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('lang') || 'en' } catch { return 'en' } })
  const [picked, setPicked] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState(false)
  const t = T[lang]
  const [intro, setIntro] = useState(() => { try { return !sessionStorage.getItem('seen') } catch { return true } })
  const [firstLoad] = useState(intro)
  const icoRef = useRef(null)

  useEffect(() => {
    if (!intro) return
    const id = setTimeout(() => { setIntro(false); try { sessionStorage.setItem('seen', '1') } catch {} }, 3300)
    return () => clearTimeout(id)
  }, [intro])

  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    if (icoRef.current) icoRef.current.style.transform = `rotateX(${-y * 40}deg) rotateY(${x * 50}deg)`
  }
  const untilt = () => { if (icoRef.current) icoRef.current.style.transform = '' }

  useEffect(() => {
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en'
    try { localStorage.setItem('lang', lang) } catch {}
  }, [lang])

  const toggle = (id) => { setErr(false); setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])) }
  const chosen = ITEMS.filter((i) => picked.includes(i.id))
  const total = chosen.reduce((s, i) => s + (i.price || 0), 0)
  const hasQuote = chosen.some((i) => i.price === null)
  const date = new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const send = () => {
    if (!chosen.length || !name.trim()) { setErr(true); setOpen(true); return }
    const lines = chosen.map((i) => `- ${T.en.items[i.id][0]}: ${i.price ? `from ₹${fmt(i.price)}` : 'price on request'}`)
    const text = `Hello SRINUMA, I'm ${name.trim()}${phone ? ` (${phone})` : ''}.\nI'd like:\n${lines.join('\n')}\nStarting total: ₹${fmt(total)}`
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <div className="shell">
      {intro && <div className="intro" aria-hidden="true">
          <LogoMark />
          <div className="iname">{[...'SRINUMA'].map((c, i) => <span key={i} style={{ animationDelay: `${0.8 + i * 0.07}s` }}>{c}</span>)}</div>
          <div className="isub">DIGITAL SOLUTIONS</div>
        </div>}
      <header className="top">
        <a className="brand" href="#top"><img src={LOGO} alt="" /><span>SRINUMA<small>DIGITAL SOLUTIONS</small></span></a>
        <nav className="nav">{['services', 'work', 'about'].map((id, i) => <a key={id} href={`#${id}`}>{t.nav[i]}</a>)}</nav>
        <button className="lang" onClick={() => setLang(lang === 'en' ? 'ta' : 'en')} aria-label="Language">
          {lang === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </header>

      <div className="grid" id="top">
        <main>
          <div className="hero" style={{ '--d': firstLoad ? '2.7s' : '0.1s' }} onMouseMove={tilt} onMouseLeave={untilt}>
            <h1>
              <span>{t.heroA}</span>
              <span className="b">{t.heroB}</span>
            </h1>
            <div className="cube3d" aria-hidden="true"><img ref={icoRef} src={LOGO} alt="" /></div>
          </div>
          <p className="sub">{t.heroSub}</p>

          <Reveal as="h2" id="services">{t.pickHead}</Reveal>
          <ul className="picks">
            {ITEMS.map((i, idx) => {
              const on = picked.includes(i.id)
              const [n, d] = t.items[i.id]
              return (
                <Reveal as="li" key={i.id} delay={idx * 80}>
                  <button className={`pick ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(i.id)}>
                    <span className="mark" aria-hidden="true" />
                    <span className="txt"><strong>{n}</strong><em>{d}</em></span>
                    <span className="pr">{i.price ? <><small>{t.from}</small> ₹{fmt(i.price)}</> : <small>{t.onRequest}</small>}</span>
                  </button>
                </Reveal>
              )
            })}
          </ul>

          <Reveal as="h2" id="work">{t.workHead}</Reveal>
          <div className="cards">
            {t.work.map(([n, d, k], idx) => (
              <Reveal as="article" key={n + lang} className="card" delay={idx * 90}>
                <div className={`shot k${k}`}><i /><i /><i /></div>
                <h3>{n}</h3><p>{d}</p>
              </Reveal>
            ))}
          </div>

          <Reveal as="h2" id="about">{t.aboutHead}</Reveal>
          <div className="about">{t.about.map((x, idx) => <Reveal as="p" key={x} delay={idx * 120}>{x}</Reveal>)}</div>

          <footer>
            <img className="fmark" src={LOGO} alt="" />
            <div className="fx">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · <a href={`tel:+${PHONE}`}>+{PHONE.slice(0, 2)} {PHONE.slice(2)}</a>
            <span>© {new Date().getFullYear()} SRINUMA Digital Solutions. {t.rights}</span>
            </div>
          </footer>
        </main>

        <aside className={`receipt ${open ? 'open' : ''} ${firstLoad ? 'late' : ''}`}>
          <button className="bar" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span>{t.show}</span><b>₹{fmt(total)}</b><small>{chosen.length} {t.items_n}</small>
          </button>
          <div className="paper" style={{ '--logo': `url(${LOGO})` }}>
            <div className="rh"><b><img src={LOGO} alt="" />SRINUMA</b><span>{t.receipt} · {date}</span></div>
            <label className="fld">{t.forWho}
              <input placeholder={t.name} value={name} onChange={(e) => { setName(e.target.value); setErr(false) }} />
            </label>
            <label className="fld"><span className="sr">{t.phone}</span>
              <input type="tel" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <ul className="lines">
              {chosen.length === 0 && <li className="none">{t.empty}</li>}
              {chosen.map((i) => (
                <li key={i.id} className="ln">
                  <span>{t.items[i.id][0]}</span>
                  <b>{i.price ? `₹${fmt(i.price)}` : t.onRequest}</b>
                </li>
              ))}
            </ul>
            <div className="tot"><span>{t.total}</span><Odo value={total} /></div>
            {hasQuote && <p className="qn">{t.quoteNote}</p>}
            {err && <p className="err" role="alert">{t.need}</p>}
            {chosen.length > 0 && <span className="stamp" aria-hidden="true"><img src={LOGO} alt="" />{t.stamp}</span>}
            <button className="btn" onClick={send}>{t.send}</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
