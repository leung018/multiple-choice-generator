import MultipleChoiceQuiz from './components/mc/quiz'

export default function Home() {
  const questions = [
    {
      title: 'What is correct color of the sky?',
      mc: {
        choices: ['Red', 'Blue', 'Green'],
        correctChoiceIndex: 1,
      },
    },
    {
      title: '1 + 1 = ?',
      mc: {
        choices: ['1', '2', '3'],
        correctChoiceIndex: 0,
      },
    },
    {
      title:
        'Which of the below is a programming language?\n I. Java\n II. Python\n III. JavaScript',
      mc: {
        choices: [
          'I Only',
          'I and II Only',
          'II and III Only',
          'All of the above',
        ],
        correctChoiceIndex: 3,
      },
    },
  ]
  return <MultipleChoiceQuiz questions={questions} />
}
