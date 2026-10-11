import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { QuestionCard } from '../components/QuestionCard'
import { scoreAnswers } from '../quiz/quizEngine'
import { questionCatalog } from './catalog'

describe('question catalog display integrity', () => {
  it('renders every imported question with all answer controls', () => {
    for (const question of questionCatalog.questions) {
      const markup = renderToStaticMarkup(
        <QuestionCard
          question={question}
          selectedAnswerId={null}
          onSelectAnswer={() => undefined}
          revealAnswer={false}
          isBookmarked={false}
          onToggleBookmark={() => undefined}
        />,
      )

      expect(markup, question.id).toContain(`<legend`)
      expect(markup.match(/type="radio"/g), question.id).toHaveLength(4)
      for (const asset of question.assets) {
        expect(markup, `${question.id}: ${asset.src}`).toContain(asset.src)
      }
    }
  })

  it('scores the JSON-defined correct answer as correct for every question', () => {
    for (const question of questionCatalog.questions) {
      expect(question.correctAnswerId, question.id).not.toBeNull()
      const score = scoreAnswers([question], {
        [question.id]: question.correctAnswerId!,
      })

      expect(score.correct, question.id).toBe(1)
      expect(score.percentage, question.id).toBe(100)
    }
  })

  it('references image files that exist in the public directory', () => {
    for (const question of questionCatalog.questions) {
      for (const asset of question.assets) {
        expect(existsSync(resolve('public', asset.src.replace(/^\//, ''))), asset.src).toBe(true)
      }
    }
  })
})
