export default function QuestionSetEditor() {
  return (
    <div className="container mx-auto p-4">
      <div className="form-group">
        <label htmlFor="question-set-name">
          <h1 className="text-lg font-bold mb-2">Question Set Name:</h1>
        </label>
        <input
          type="text"
          id="question-set-name"
          className="border border-gray-300 px-2 py-1 w-full"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2">Question 1</h2>
        <div className="form-group">
          <label>Question:</label>
          <input
            type="text"
            className="border border-gray-300 px-2 py-1 w-full"
          />
        </div>
        <div className="form-group">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3"></div>
            <div className="col-span-1 text-center">Correct Answer</div>
            <div className="col-span-1 text-center">Fixed Position</div>

            <div className="col-span-3">
              <label>Choice 1:</label>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 ml-2"
              />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="mr-1" />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="mr-1" />
            </div>

            <div className="col-span-3">
              <label>Choice 2:</label>
              <input
                type="text"
                className="border border-gray-300 px-2 py-1 ml-2"
              />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="mr-1" />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="mr-1" />
            </div>

            <div className="col-span-1">
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Choice
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Question
      </button>

      <div className="flex items-center justify-center w-full">
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  )
}
