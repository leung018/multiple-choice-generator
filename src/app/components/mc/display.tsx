import { MultipleChoiceQuestion } from '../../../mc/question'

interface MultipleChoicePageProps {
  questions: MultipleChoiceQuestion[]
}

export default function MultipleChoicePage({
  questions,
}: MultipleChoicePageProps) {
  return (
    <div className="p-4">
      {questions.map((question, index) => (
        <div key={index} className="mb-4">
          <p className="font-bold whitespace-pre-line">{question.title}</p>
          <div className="ml-4">
            {question.mc.choices.map((choice, index) => (
              <label key={index} className="flex items-center mb-2">
                <input type="radio" className="mr-2" />
                {choice}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Submit
      </button>
    </div>
  )
}
