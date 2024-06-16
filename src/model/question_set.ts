import { SetRandomDrawer } from '../utils/random_draw'
import { MultipleChoiceBuilder, MultipleChoice } from './mc'
import { v4 as uuidv4 } from 'uuid'
import { MultipleChoiceSwapper } from './swap'
export class QuestionSet {
  readonly name: string

  readonly questions: ReadonlyArray<Question>

  private readonly currentPlayQuestions?: ReadonlyArray<Question>

  readonly id: string

  static create({
    name,
    questions,
    id = uuidv4(),
  }: {
    name: string
    questions: ReadonlyArray<Question>
    id?: string
  }) {
    return new QuestionSet({
      name,
      questions,
      id,
    })
  }

  /* Serialize or Deserialize methods may be more make sense to be exist in other layers.
   * However, to achieve this, may need to make below constructor public and have extra validation logic in this model, which will be more complicated in this project size.
   * Noted that serialize and deserialize method will be covered by unit test in repo layer.
   */
  static serialize(questionSet: QuestionSet): string {
    return JSON.stringify(questionSet)
  }

  // See the comment of `serialize`.
  static deserialize(payload: string): QuestionSet {
    return new QuestionSet(JSON.parse(payload))
  }

  private constructor({
    name,
    questions,
    id,
    currentPlayQuestions,
  }: {
    name: string
    questions: ReadonlyArray<Question>
    id: string
    currentPlayQuestions?: ReadonlyArray<Question>
  }) {
    this.name = name
    this.questions = questions
    this.id = id
    this.currentPlayQuestions = currentPlayQuestions
  }

  newSwappedChoicesQuestionSet(): QuestionSet {
    const drawer = SetRandomDrawer.create()

    const swappedChoicesQuestions = this.getCurrentPlayQuestions().map(
      (question) => {
        const possibleMcs = MultipleChoiceSwapper.getSignificantlySwapped(
          question.mc,
        )
        return {
          ...question,
          mc: drawer.draw(possibleMcs),
        }
      },
    )

    return new QuestionSet({
      id: this.id,
      name: this.name,
      questions: this.questions,
      currentPlayQuestions: swappedChoicesQuestions,
    })
  }

  getCurrentPlayQuestions(): ReadonlyArray<Question> {
    return this.currentPlayQuestions || this.questions
  }
}

export interface Question {
  readonly description: string
  readonly mc: MultipleChoice
}

export class QuestionSetBuilderForTest {
  private name: string = 'Dummy question set'
  private questions: {
    description: string
    mc: MultipleChoice
  }[] = []

  setName(name: string): QuestionSetBuilderForTest {
    this.name = name
    return this
  }

  appendQuestion({
    description = 'dummy question',
    mc = new MultipleChoiceBuilder()
      .setCorrectChoiceIndex(0)
      .appendNonFixedChoice('dummy choice 1')
      .appendNonFixedChoice('dummy choice 2')
      .build(),
  } = {}): QuestionSetBuilderForTest {
    this.questions.push({
      description,
      mc: mc,
    })
    return this
  }

  build(): QuestionSet {
    return QuestionSet.create({
      name: this.name,
      questions: this.questions,
    })
  }
}
