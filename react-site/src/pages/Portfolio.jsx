import { useState } from 'react'
import './Portfolio.css'

const RESUME_URL =
  'https://docs.google.com/document/d/1HAgAFUYyYDZCXNvO3zHaOwUrOJaCGBupRh8fTzBwvRA/export?format=pdf'

const experiences = [
  {
    title: 'Research Intern – IIT Guwahati',
    timeframe: 'May 2024 – Aug 2024',
    org: 'Indian Institute of Technology Guwahati · CSE',
    bullets: [
      'Achieved scalable AI solutions by designing homogeneous and heterogeneous multi-network architectures for deep learning workloads.',
      'Improved computational efficiency using parallel processing and In-Memory Computing across multicore systems.',
      'Engineered hybrid network structures and optimised end-to-end execution using the SIAM Simulator.',
      'Developed high-performance algorithms in C++ and Python for neural network inference and system-level analysis.',
    ],
  },
  {
    title: 'Research Intern – IIT Guwahati',
    timeframe: 'May 2023 – Jun 2023',
    org: 'Indian Institute of Technology Guwahati · CSE',
    bullets: [
      'Designed and implemented security algorithms for Hardware Trojan detection in multicore Network-on-Chip (NoC) systems.',
      'Enhanced cyber-physical system protection with optimised routing protocols and intrusion-aware data paths.',
      'Used GEM5 with Garnet to model multicore platforms, assess security vulnerabilities, and tune performance.',
      'Programmed analysis and routing algorithms in C++ and Python, improving reliability and throughput.',
    ],
  },
]

const leadership = [
  {
    title: 'Founder – Circuitology Club',
    timeframe: 'Jul 2022 – Present',
    org: 'Marwadi University',
    bullets: [
      'Created a hardware technologies club focused on robotics, embedded systems, and real-world problem-solving.',
      'Grew the community to 110+ members, organising 30+ workshops, hackathons, and STEM outreach initiatives.',
      'Secured over $3.5k in funding and partnerships to support student-led projects and competitions.',
    ],
  },
  {
    title: 'Chair – IEEE MEFGI Student Branch',
    timeframe: 'Apr 2024 – Oct 2024',
    org: 'Marwadi Education Foundation Group of Institutions',
    bullets: [
      'Led branch operations, technical events, and collaborations with industry experts and IEEE initiatives.',
      'Curated programs that combined research, innovation, and outreach for the campus community.',
    ],
  },
]

const education = [
  {
    degree: 'Master of Technology – Software Engineering',
    timeframe: 'Aug 2025 – Sep 2026',
    place: 'National University of Singapore · ISS',
    highlights: [
      'Focus: Software Architecture & Design, Cloud-Native & Platform Engineering, DevSecOps, SDLC.',
      'Project: GOMOKU – online multiplayer strategy game.',
    ],
  },
  {
    degree: 'Bachelor of Technology – Information and Communication Technology',
    timeframe: 'Sep 2021 – May 2025',
    place: 'Marwadi University, India',
    highlights: ['Graduated with First Class with Distinction.'],
  },
]

const skills = [
  {
    title: 'Software',
    items: [
      'C++, Python, Java',
      'ReactJS, REST APIs, JSP/Servlets',
      'MySQL, HTML/CSS/JavaScript',
    ],
  },
  {
    title: 'Systems & Simulation',
    items: [
      'Linux (Ubuntu, RaspbianOS, CentOS), Windows',
      'GEM5, SIAM, Proteus',
      'Git, GitHub, GitLab, VS Code, IntelliJ',
    ],
  },
  {
    title: 'Embedded & IoT',
    items: [
      'Arduino, Raspberry Pi, ESP32/ESP8266, Zigbee',
      'Sensor integration, device control, IoT dashboards',
      'PCB design, circuit simulation, logic design',
    ],
  },
  {
    title: 'Soft Skills',
    items: [
      'Leadership & community building',
      'Team collaboration & communication',
      'Problem solving, adaptability, critical thinking',
    ],
  },
]

const recognition = {
  patents: [
    'Method for Converting Handwritten Characters into Machine-Readable Instructions (202421033236).',
    'Telecom Architecture (8416/2023-CO/SW).',
  ],
  awards: [
    'GATE 2024 – Indian Institute of Science (AIR 31880).',
    'Club Founder Award 2024 – Circuitology Club, Marwadi University.',
    'SSIP Hackathon 2022 – Second highest honour at state level (Government of Gujarat & SSIP).',
    'Google Kick Start 2021 – Global Rank 3868.',
  ],
  certifications: [
    'Cisco thingQbator – PCB Architecture and Design.',
    'Coursera · UCDAVIS – Tableau design and data visualisation.',
    'Oracle Academy – Database Foundations.',
  ],
}

const projects = [
  {
    title: 'AI-Powered Handwriting to G-code Pipeline',
    tag: 'Embedded AI · Automation',
    summary:
      'Transforms handwritten patterns into machine-ready G-code, bridging human creativity with CNC-style fabrication.',
  },
  {
    title: 'Gesture-Controlled Vehicle',
    tag: 'Robotics · Human–Machine Interaction',
    summary:
      'Built a gesture-driven control system for a small-scale vehicle, combining sensing, control logic, and real-time feedback.',
  },
  {
    title: 'Secure NoC Frameworks',
    tag: 'Research · Hardware Security',
    summary:
      'Worked on secure routing and intrusion detection for Network-on-Chip architectures using simulation-driven design.',
  },
  {
    title: 'IoT Monitoring & Control Dashboards',
    tag: 'IoT · Systems Design',
    summary:
      'Built dashboards and backends to monitor sensors, actuators, and system health across embedded and cloud-connected devices.',
  },
]

function Portfolio() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [formStatus, setFormStatus] = useState('idle')

  const handleResumeClick = (event) => {
    event.preventDefault()
    if (isDownloading) return

    setIsDownloading(true)

    const link = document.createElement('a')
    link.href = RESUME_URL
    link.download = 'Shashank_Bagda_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.setTimeout(() => {
      setIsDownloading(false)
    }, 1500)
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    if (formStatus === 'sending') return

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      setFormStatus('sending')
      const response = await fetch('https://formspree.io/f/mblylqlz', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setFormStatus('success')
        form.reset()
        window.setTimeout(() => setFormStatus('idle'), 4000)
      } else {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      setFormStatus('error')
      window.setTimeout(() => setFormStatus('idle'), 4000)
    }
  }

  return (
    <div className="portfolio-page">
      <aside className="portfolio-rail">
        <div className="rail-inner">
          <div className="rail-avatar">
            <img
              src="/app/profile-img.jpg"
              alt="Portrait of Shashank Bagda"
            />
          </div>
          <h1 className="rail-name">Shashank Bagda</h1>
          <p className="rail-role">
            Engineering intelligent systems that sit at the intersection of
            software, hardware, and research.
          </p>
          <p className="rail-tagline">
            Crafted by engineering. Driven by curiosity. Defined by innovation.
          </p>

          <div className="rail-chips">
            <span className="chip">Software &amp; Hardware Engineer</span>
            <span className="chip">Research Intern @ IIT Guwahati</span>
            <span className="chip">Community Builder</span>
          </div>

          <div className="rail-meta">
            <span>Singapore / India</span>
            <a href="mailto:work.shashankbagda@gmail.com">
              work.shashankbagda@gmail.com
            </a>
          </div>

          <div className="rail-social">
            <a
              href="https://www.linkedin.com/in/shashank-bagda/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/ShashankBagda"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>

          <button
            type="button"
            className={`rail-resume ${isDownloading ? 'is-downloading' : ''}`}
            onClick={handleResumeClick}
            aria-busy={isDownloading}
          >
            {isDownloading && <span className="resume-spinner" aria-hidden />}
            {isDownloading ? 'Preparing download…' : 'Download resume'}
          </button>
        </div>
      </aside>

      <div className="portfolio-main">
        <nav className="section-nav">
          <a href="#overview">Overview</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#education">Education</a>
          <a href="#experience">Experience</a>
          <a href="#leadership">Leadership</a>
          <a href="#highlights">Highlights</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>

        <section className="section hero with-trail" id="overview">
          <p className="eyebrow">Tech Enthusiast · Innovator · Researcher</p>
          <h2>
            Designing systems where silicon, software, and intelligence meet.
          </h2>
          <p className="lede">
            I am an MTech Software Engineering student (NUS, ISS) and BTech ICT
            graduate (Marwadi University), building systems that blend embedded
            hardware, AI, and cloud-native software — from research prototypes
            at IIT Guwahati to community-driven engineering initiatives.
          </p>
          <div className="hero-grid">
            <div className="hero-card">
              <h3>01 · Research</h3>
              <p>
                Exploring architectures for in-memory computing, secure
                Network-on-Chip designs, and high-throughput neural network
                inference.
              </p>
            </div>
            <div className="hero-card">
              <h3>02 · Engineering</h3>
              <p>
                Building systems that span firmware, embedded platforms, and
                software — turning complex ideas into reliable, testable tools.
              </p>
            </div>
            <div className="hero-card">
              <h3>03 · Community</h3>
              <p>
                Leading technical communities, mentoring peers, and designing
                experiences that make engineering more accessible and exciting.
              </p>
            </div>
          </div>
        </section>

        <section className="section with-trail" id="about">
          <h3>About</h3>
          <div className="section-body">
            <p>
              I’m Shashank — a technology enthusiast, creative thinker, and
              aspiring researcher dedicated to shaping the future of intelligent
              systems. I specialise in bridging hardware and software to build
              systems that are not just functional, but expressive and
              impactful.
            </p>
            <p>
              I hold a Bachelor’s degree in Information and Communication
              Technology from Marwadi University and am currently pursuing my
              MTech in Software Engineering at the National University of
              Singapore (ISS). My journey spans embedded systems, IoT, robotics,
              and software engineering.
            </p>
            <p>
              Over the years, I’ve led research internships, hackathons, and
              technical clubs, developing skills across C/C++, Java, Python, AI,
              and digital design. I am particularly fascinated by how intelligent
              systems, hardware acceleration, and scalable architectures can
              shape the next generation of computing.
            </p>
            <p>
              My research work at IIT Guwahati focuses on multi-network
              architectures for deep learning, in-memory computing, and security
              for Network-on-Chip systems using tools like GEM5 and SIAM. I
              enjoy navigating the full stack of these problems — from
              architecture and simulation to the code that brings them to life.
            </p>
            <p>
              Beyond research, I founded the Circuitology Club and chaired the
              IEEE MEFGI Student Branch, where I led 20+ events, mentored
              peers, and built communities around curiosity and making.
            </p>
            <p>
              Whether it’s next‑gen chip architectures or tools that simplify
              engineering workflows, I’m interested in problems that demand both
              precision and imagination. Let’s connect and build something
              remarkable together.
            </p>
          </div>
        </section>

        <section className="section with-trail" id="skills">
          <h3>Skills &amp; Platforms</h3>
          <div className="section-body skills-grid">
            {skills.map((group) => (
              <div key={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section with-trail" id="education">
          <h3>Education</h3>
          <div className="section-body cards-list">
            {education.map((edu) => (
              <article key={edu.degree} className="card-block">
                <header>
                  <h4>{edu.degree}</h4>
                  <p className="meta">
                    <span>{edu.place}</span>
                    <span>{edu.timeframe}</span>
                  </p>
                </header>
                {edu.highlights && (
                  <ul>
                    {edu.highlights.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="section with-trail" id="experience">
          <h3>Experience</h3>
          <div className="section-body">
            <div className="cards-list">
              {experiences.map((exp) => (
                <article key={exp.title} className="card-block">
                  <header>
                    <h4>{exp.title}</h4>
                    <p className="meta">
                      <span>{exp.org}</span>
                      <span>{exp.timeframe}</span>
                    </p>
                  </header>
                  <ul>
                    {exp.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section with-trail" id="leadership">
          <h3>Leadership &amp; Community</h3>
          <div className="section-body">
            <div className="cards-list">
              {leadership.map((role) => (
                <article key={role.title} className="card-block">
                  <header>
                    <h4>{role.title}</h4>
                    <p className="meta">
                      <span>{role.org}</span>
                      <span>{role.timeframe}</span>
                    </p>
                  </header>
                  <ul>
                    {role.bullets.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section with-trail" id="highlights">
          <h3>Highlights &amp; Recognition</h3>
          <div className="section-body skills-grid">
            <div>
              <h4>Patents &amp; IP</h4>
              <ul>
                {recognition.patents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Awards</h4>
              <ul>
                {recognition.awards.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Certifications</h4>
              <ul>
                {recognition.certifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section with-trail" id="projects">
          <h3>Selected Work</h3>
          <div className="section-body cards-grid">
            {projects.map((project) => (
              <article key={project.title} className="card-block">
                <p className="tag">{project.tag}</p>
                <h4>{project.title}</h4>
                <p>{project.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section with-trail" id="contact">
          <h3>Let’s build something meaningful</h3>
          <div className="section-body contact-body">
            <p>
              Open to research collaborations, engineering roles, and projects
              at the edge of software, hardware, and AI. Tell me what you’re
              building — or what you wish existed.
            </p>

            <form
              className="contact-form"
              onSubmit={handleContactSubmit}
            >
              <input type="hidden" name="_redirect" value="" />

              <div className="field-row">
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  placeholder="How can we work together?"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell me a bit about your idea, team, or challenge."
                  required
                />
              </div>

              <button
                type="submit"
                className={`primary-button${
                  formStatus === 'sending' ? ' is-sending' : ''
                }${formStatus === 'success' ? ' is-success' : ''}${
                  formStatus === 'error' ? ' is-error' : ''
                }`}
              >
                {formStatus === 'sending' && (
                  <span className="button-spinner" aria-hidden />
                )}
                {formStatus === 'idle' && 'Send message'}
                {formStatus === 'sending' && 'Sending…'}
                {formStatus === 'success' && 'Sent! Thank you'}
                {formStatus === 'error' && 'Something went wrong – retry'}
              </button>
            </form>
          </div>
        </section>

        <footer className="portfolio-footer">
          <p>© {new Date().getFullYear()} Shashank Bagda</p>
        </footer>
      </div>
    </div>
  )
}

export default Portfolio
