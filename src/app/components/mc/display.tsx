'use client'

import { useState } from 'react'
import { MultipleChoiceQuestion } from '../../../mc/question'

interface MultipleChoicePageProps {
  questions: MultipleChoiceQuestion[]
}

// TODO: Noted that won't test the rendering of submit button by now. Test that part later in the feature of submitting the answer is more meaningful.
export default function MultipleChoicePage({
  questions,
}: MultipleChoicePageProps) {
  const [questionToCheckedChoiceMap, setCheckedChoice] = useState<
    Map<number, number>
  >(new Map<number, number>())

  const handleChoiceChange = (questionIndex: number, choiceIndex: number) => {
    const newMap = new Map<number, number>(questionToCheckedChoiceMap)
    newMap.set(questionIndex, choiceIndex)
    setCheckedChoice(newMap)
  }

  return (
    <div className="p-4">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-4">
          <p className="font-bold whitespace-pre-line">{question.title}</p>
          <div className="ml-4">
            {question.mc.choices.map((choice, choiceIndex) => (
              <label key={choiceIndex} className="flex items-center mb-2">
                <input
                  type="radio"
                  className="mr-2"
                  checked={
                    choiceIndex ===
                    questionToCheckedChoiceMap.get(questionIndex)
                  }
                  onChange={() =>
                    handleChoiceChange(questionIndex, choiceIndex)
                  }
                />
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
