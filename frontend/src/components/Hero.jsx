import "./Hero.css";

function Hero({ onGetStarted }) {
  const bars = [35, 55, 43, 80, 57, 92, 47, 67, 38, 76, 50, 64];

  return (
    <section className="mm-hero" id="home">
      <div className="mm-layout">
        <div className="mm-copy">
          <div className="mm-pill">
            <span className="mm-pulse-dot" />
            NEXT-GEN AI HEALTHCARE
          </div>

          <h1>
            Your health.
            <br />
            <span className="mm-gradient-text">Intelligently</span>
            <br />
            cared for.
          </h1>

          <p>
            Meet your personal healthcare companion. Bring your medical
            records, medicine routine and health insights together in one
            intelligent, beautifully connected space.
          </p>

          <div className="mm-buttons">
            <a
              href="#login"
              className="mm-btn mm-btn-primary"
              onClick={(event) => {
                event.preventDefault();
                onGetStarted?.();
              }}
            >
              Get started <span>↗</span>
            </a>

            <a href="#features" className="mm-btn mm-btn-secondary">
              Explore features <span>→</span>
            </a>
          </div>

          <div className="mm-trust">
            <span><b>✦</b> AI-assisted insights</span>
            <span><b>♡</b> Personal health space</span>
            <span><b>⌁</b> Connected care</span>
          </div>
        </div>

        <div className="mm-dashboard">
          <div className="mm-dash-head">
            <div className="mm-brand">
              <div className="mm-brand-icon">✚</div>
              <div>
                <strong>MediMatrix AI</strong>
                <small>INTELLIGENT HEALTH SYSTEM</small>
              </div>
            </div>

            <span className="mm-live">
              <span className="mm-pulse-dot" />
              DASHBOARD PREVIEW
            </span>
          </div>

          <div className="mm-dash-title">
            <div>
              <h2>Your health space</h2>
              <p>Everything important, thoughtfully organized</p>
            </div>
            <span>✧ AI powered</span>
          </div>

          <div className="mm-metrics">
            <div className="mm-card mm-card-heart">
              <div className="mm-card-top">
                <div className="mm-icon">
                  <span className="mm-heart">♥</span>
                </div>
                <span className="mm-card-label">Heart health</span>
              </div>

              <div className="mm-card-value">
                ♡ <span className="mm-card-unit">Heart rate</span>
              </div>

              <div className="mm-ecg">
                <svg viewBox="0 0 240 43" preserveAspectRatio="none">
                  <path
                    d="M0 24 L32 24 L43 19 L52 29 L65 3 L78 37 L90 23 L120 23 L132 18 L141 28 L153 8 L165 34 L176 23 L205 23 L217 17 L226 26 L240 23"
                    fill="none"
                    stroke="#ff7897"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mm-card-note">
                Add a real measurement to view your trend
              </div>
            </div>

            <div className="mm-card mm-card-blue">
              <div className="mm-card-top">
                <div className="mm-icon mm-blue-icon">◉</div>
                <span className="mm-card-label">Blood pressure</span>
              </div>

              <div className="mm-card-value">-- / --</div>
              <div className="mm-card-note">
                mmHg · No reading added yet
              </div>

              <div className="mm-bars">
                {bars.map((height, index) => (
                  <span
                    key={index}
                    style={{
                      height: height + "%",
                      animationDelay: index * 0.12 + "s",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mm-card mm-card-purple">
              <div className="mm-card-top">
                <div className="mm-icon mm-purple-icon">✧</div>
                <span className="mm-card-label">AI Health Twin</span>
              </div>

              <div className="mm-card-value mm-card-value-small">
                Your insights
              </div>

              <div className="mm-card-note">
                Understand patterns in your recorded health data
              </div>
            </div>

            <div className="mm-card mm-card-green">
              <div className="mm-card-top">
                <div className="mm-icon mm-green-icon">✚</div>
                <span className="mm-card-label">Medicine care</span>
              </div>

              <div className="mm-card-value mm-card-value-small">
                Your routine
              </div>

              <div className="mm-card-note">
                Organize doses, reminders and refills
              </div>
            </div>
          </div>

          <div className="mm-bottom">
            <div className="mm-insight">
              <div className="mm-insight-title">✦ AI HEALTH INSIGHTS</div>
              <p>
                Explore patterns in your recorded readings and prepare
                questions for your healthcare professional.
              </p>
            </div>

            <div className="mm-reminder">
              <div className="mm-reminder-title">♡ CARE CENTER</div>

              <div className="mm-reminder-line">
                <span className="mm-reminder-icon">▤</span>
                <span>Medical records &amp; reports</span>
              </div>

              <div className="mm-reminder-line">
                <span className="mm-reminder-icon">◷</span>
                <span>Medicine schedule &amp; refills</span>
              </div>
            </div>
          </div>

          <div className="mm-note">
            Preview interface · Readings appear when real data is entered
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;