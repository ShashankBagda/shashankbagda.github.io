import { useEffect, useRef } from 'react'
import './HighlightsStack.css'

const cards = [
  {
    title: 'Profile',
    body:
      'Tech enthusiast and aspiring researcher, blending software engineering with embedded and systems work across AI, IoT, and hardware.',
    count: '6/6',
  },
  {
    title: 'Research',
    body:
      'Deep learning accelerators, in-memory computing, and secure Network-on-Chip architectures through internships at IIT Guwahati.',
    count: '5/6',
  },
  {
    title: 'Leadership',
    body:
      'Founder of Circuitology Club and Chair of IEEE MEFGI Student Branch, leading 20+ events and building communities around making.',
    count: '4/6',
  },
  {
    title: 'Systems & Tools',
    body:
      'Comfortable across C/C++, Python, Java, GEM5, SIAM, embedded boards, and cloud-native software engineering practices.',
    count: '3/6',
  },
  {
    title: 'Recognition',
    body:
      'Multiple patents, awards including GATE 2024, Club Founder Award, SSIP Hackathon success, and global ranking in Google Kick Start.',
    count: '2/6',
  },
  {
    title: 'What I’m Looking For',
    body:
      'Opportunities at the intersection of hardware, AI, and software—research roles, engineering teams, and collaborations that value systems thinking.',
    count: '1/6',
  },
]

function HighlightsStack() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = Array.from(
      container.querySelectorAll('.stack-cards__item'),
    )

    if (!items.length) return

    const handleScroll = () => {
      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight

      // Only react while the stack is roughly in view
      if (rect.bottom < 0 || rect.top > viewportHeight * 1.5) {
        return
      }

      const start = rect.top + window.scrollY - viewportHeight
      const end = start + rect.height + viewportHeight
      const scrollY = window.scrollY
      const total = end - start
      const progress = total > 0 ? (scrollY - start) / total : 0

      const totalCards = items.length

      items.forEach((card, index) => {
        const threshold = (index + 1) / totalCards
        if (progress > threshold) {
          card.classList.add('slide-up')
        } else {
          card.classList.remove('slide-up')
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="stack-cards-container" ref={containerRef}>
      <div className="stack-cards-rays">
        <div className="s__rays">
          <a-rays data-angle="90" data-velocity="1">
            <svg className="a__scene" width="395" height="3118">
              <g>
                {/* Trimmed subset of paths to keep things lightweight */}
                <path
                  stroke="#00F8F1"
                  d="M 1,0 L 1,51 M 1,175 L 1,199 M 1,237 L 1,252 M 1,298 L 1,325 M 1,382 L 1,406 M 1,507 L 1,530 M 1,607 L 1,655 M 1,770 L 1,776 M 1,869 L 1,920"
                />
                <path
                  stroke="#FFBD1E"
                  d="M 16,0 L 16,34 M 16,95 L 16,127 M 16,355 L 16,361 M 16,390 L 16,433 M 16,521 L 16,526 M 16,679 L 16,697"
                />
                <path
                  stroke="#FE848F"
                  d="M 31,0 L 31,32 M 31,198 L 31,248 M 31,470 L 31,475 M 31,701 L 31,722 M 31,835 L 31,877"
                />
              </g>
            </svg>
          </a-rays>
        </div>
      </div>

      <div className="stack-cards">
        {cards.map((card) => (
          <div key={card.title} className="stack-cards__item">
            <div className="stack-card-inner">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <div className="stack-card-counter">{card.count}</div>
            </div>
            <div className="stack-card-shadow" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HighlightsStack
