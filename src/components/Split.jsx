/**
 * Splits a heading into masked words/characters for GSAP reveals while
 * keeping the real text available to screen readers via aria-label.
 * Use "\n" for hard line breaks; wrap a word in *asterisks* to accent it.
 */
export default function Split({ as: Tag = 'h2', text, className = '', mode = 'chars', ...rest }) {
  const lines = text.split('\n')
  const plain = text.replace(/\*/g, '').replace(/\n/g, ' ')
  let ci = 0
  return (
    <Tag className={`split ${className}`} aria-label={plain} data-split={mode} {...rest}>
      {lines.map((line, li) => (
        <span className="split-line" key={li} aria-hidden="true">
          {line.split(' ').map((word, wi) => {
            const accent = /^\*.*\*[.,!?]?$/.test(word)
            const w = word.replace(/\*/g, '')
            return (
              <span className={`split-word${accent ? ' is-accent' : ''}`} key={wi}>
                {mode === 'chars'
                  ? [...w].map((ch, i) => (
                      <span className="split-char" key={i} style={{ '--i': ci++ }}>
                        {ch}
                      </span>
                    ))
                  : <span className="split-char">{w}</span>}
                {wi < line.split(' ').length - 1 ? ' ' : ''}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}
