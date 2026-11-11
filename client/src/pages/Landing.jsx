import { useState, useEffect, useRef } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../theme";
import { ROOM_IMG, GALLERY, hideBroken } from "../images";
import { ROLES } from "../roles";
const rooms = [
  ["Single", "🛏️", 80, "A cozy room for solo travellers"],
  ["Double", "🛌", 130, "Bright and spacious for two guests"],
  ["Deluxe", "🌆", 180, "City view and premium amenities"],
  ["Suite", "👑", 250, "Our finest, with a separate living area"],
];
const services = [
  ["🛎️", "24/7 Room Service"],
  ["🧺", "Laundry"],
  ["🚗", "Airport Transport"],
  ["⏰", "Wake-up Calls"],
];
const steps = [
  ["1", "🧳", "Register", "Create a guest account in 30 seconds"],
  ["2", "📅", "Book", "Pick your dates and book a free room"],
  ["3", "🔑", "Stay", "Check in, get your key card and request services"],
  ["4", "🧾", "Check-out", "Your bill and invoice are ready instantly"],
];
const WORDS = ["stay", "holiday", "escape", "getaway"];
// Scroll karne par number 0 se ginti karta hai
function Count({ to, suffix = "" }) {
  const ref = useRef();
  const [n, setN] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let t = 0;
        const id = setInterval(() => {
          t++;
          setN(Math.round(to * Math.min(t / 40, 1)));
          if (t >= 40) clearInterval(id);
        }, 30);
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return (
    <b ref={ref}>
      {n}
      {suffix}
    </b>
  );
}
export default function Landing() {
  const [media, setMedia] = useState({});
  const [w, setW] = useState(0);
  useEffect(() => {
    api
      .get("/public")
      .then((r) => setMedia(r.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const id = setInterval(() => setW((x) => (x + 1) % WORDS.length), 2300);
    return () => clearInterval(id);
  }, []);
  // Scroll karne par sections nazar aate hain (reveal animation)
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="land">
      <header className="lnav">
        <a href="/" className="brand">
          🏨 <span>LuxuryStay</span>
        </a>
        <div className="lmenu">
          <a href="#rooms">Rooms</a>
          <a href="#how">How it works</a>
          <a href="#roles">Roles</a>
          <a href="#gallery">Gallery</a>
          <a href="#services">Services</a>
          <ThemeToggle />
          <Link to="/login" className="lbtn ghost">
            Sign In
          </Link>
          <Link to="/login?mode=register" className="lbtn">
            Sign Up
          </Link>
        </div>
      </header>
      <section
        className="lhero"
        style={
          media.heroImage ? { backgroundImage: `url(${media.heroImage})` } : {}
        }
      >
        <video
          className="lvideo"
          key={media.heroVideo}
          src={media.heroVideo || "/videos/hero.mp4"}
          autoPlay
          muted
          loop
          playsInline
          onError={hideBroken}
        />
        <div className="bubbles">
          {[...Array(8)].map((_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="lcontent">
          <span className="chip">⭐ 5-Star Hospitality</span>
          <h1>
            Your perfect{" "}
            <em key={w} className="rot">
              {WORDS[w]}
            </em>
            ,<br />
            one click away.
          </h1>
          <p>
            Book a room, request services and manage your whole stay with ease.
          </p>
          <div className="ctas">
            <Link to="/login?mode=register" className="lbtn big pulse">
              Book Your Stay →
            </Link>
            <Link to="/login" className="lbtn ghost big">
              Staff / Guest Login
            </Link>
          </div>
          <div className="scrollhint">⌄ Scroll down</div>
        </div>
      </section>
      <section className="band">
        <div>
          <Count to={ROLES.length} />
          <small>User Roles</small>
        </div>
        <div>
          <Count to={rooms.length} />
          <small>Room Types</small>
        </div>
        <div>
          <Count to={12} />
          <small>Modules</small>
        </div>
        <div>
          <Count to={99} suffix="%" />
          <small>Uptime Goal</small>
        </div>
      </section>
      <section id="rooms" className="lsec">
        <h2 className="rv">Our Rooms</h2>
        <p className="lsub rv">The right option for every budget</p>
        <div className="rgrid">
          {rooms.map(([n, i, p, d], k) => (
            <div
              className="lroom rv"
              style={{ transitionDelay: k * 90 + "ms" }}
              key={n}
            >
              <div className="limg">
                <span>{i}</span>
                <img
                  src={ROOM_IMG[n]}
                  alt={n}
                  loading="lazy"
                  onError={hideBroken}
                />
              </div>
              <h3>{n}</h3>
              <p>{d}</p>
              <div className="lprice">
                from <b>${p}</b> / night
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="how" className="lsec alt">
        <h2 className="rv">How it works</h2>
        <p className="lsub rv">Just 4 simple steps</p>
        <div className="steps">
          {steps.map(([n, i, t, d], k) => (
            <div
              className="step rv"
              style={{ transitionDelay: k * 110 + "ms" }}
              key={n}
            >
              <em>{n}</em>
              <span>{i}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="roles" className="lsec">
        <h2 className="rv">{ROLES.length} Roles, One System</h2>
        <p className="lsub rv">
          Every user gets their own dashboard and permissions
        </p>
        <div className="rolegrid">
          {ROLES.map((r, k) => (
            <div
              className="rolecard rv"
              style={{ transitionDelay: k * 90 + "ms" }}
              key={r.key}
            >
              <div className="rico">{r.icon}</div>
              <h3>{r.name}</h3>
              <ul>
                {r.can.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section id="gallery" className="lsec alt">
        <h2 className="rv">Photo Gallery</h2>
        <p className="lsub rv">A glimpse of our hotel</p>
        <div className="gallery">
          {GALLERY.map(([n, src], k) => (
            <figure
              className="rv"
              style={{ transitionDelay: k * 90 + "ms" }}
              key={n}
            >
              <span>📷</span>
              <img src={src} alt={n} loading="lazy" onError={hideBroken} />
              <figcaption>{n}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section id="services" className="lsec">
        <h2 className="rv">Guest Services</h2>
        <p className="lsub rv">Always ready for your comfort</p>
        <div className="sgrid">
          {services.map(([i, n], k) => (
            <div
              className="lserv rv"
              style={{ transitionDelay: k * 90 + "ms" }}
              key={n}
            >
              <span>{i}</span>
              {n}
            </div>
          ))}
        </div>
      </section>
      <section className="cta rv">
        <h2>Ready to book your next stay?</h2>
        <p>Register now and book a room in just a few clicks.</p>
        <Link to="/login?mode=register" className="lbtn big pulse">
          Get Started →
        </Link>
      </section>
      <footer className="lfoot">
        <div>
          <b>🏨 LuxuryStay</b>
          <small>Hotel Management System</small>
        </div>
        <div className="flinks">
          <a href="#rooms">Rooms</a>
          <a href="#roles">Roles</a>
          <a href="#gallery">Gallery</a>
          <Link to="/login">Sign In</Link>
        </div>
        <small>© {new Date().getFullYear()} LuxuryStay Hospitality</small>
      </footer>
    </div>
  );
}
