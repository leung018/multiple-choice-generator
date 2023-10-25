import MultipleChoiceQuiz from './components/mc/quiz'
import { MultipleChoiceQuestion } from '../mc/question'
import { MultipleChoice } from '../mc/mc'

export default function Home() {
  const questions: MultipleChoiceQuestion[] = [
    {
      title: 'What is correct color of the sky?',
      mc: new MultipleChoice({
        choices: ['Red', 'Blue', 'Green'],
        correctChoiceIndex: 1,
      }),
    },
    {
      title: '1 + 1 = ?',
      mc: new MultipleChoice({
        choices: ['1', '2', '3'],
        correctChoiceIndex: 0,
      }),
    },
    {
      title:
        'Which of the below is a programming language?\n I. Java\n II. Python\n III. JavaScript',
      mc: new MultipleChoice({
        choices: [
          'I Only',
          'I and II Only',
          'II and III Only',
          'All of the above',
        ],
        correctChoiceIndex: 3,
      }),
    },
  ]
  return <MultipleChoiceQuiz questions={questions} />
}
