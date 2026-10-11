export type AnswerId = 'a' | 'b' | 'c' | 'd'

export type QuestionSection = 'basis' | 'binnen' | 'segeln'

export interface AnswerOption {
  id: AnswerId
  text: string
}

export interface QuestionAsset {
  src: string
  alt: string
}

export interface Question {
  id: string
  officialNumber: number
  section: QuestionSection
  prompt: string
  answers: AnswerOption[]
  correctAnswerId: AnswerId | null
  assets: QuestionAsset[]
  sourcePage: number
  requiresManualReview: boolean
}

export interface QuestionCatalog {
  schemaVersion: 1
  catalog: {
    title: string
    validFrom: string
    source: string
    sourceFile: string
    sourceSha256: string
    questionCount: number
    answerKey: {
      type: 'global' | 'none'
      correctAnswerId: AnswerId | null
      evidence: string | null
      occurrences: number
    }
  }
  questions: Question[]
}
