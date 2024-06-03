describe('End to end tests', () => {
  it('should save question set and navigate to quiz of that question set', () => {
    createQuestionSet({
      cy,
      questionSetName: 'Test Question Set',
      questions: [
        {
          description: 'Test Question 1',
          choices: [
            { answer: 'Answer 1', markAsCorrect: true },
            { answer: 'Answer 2' },
          ],
        },
      ],
    })

    // Navigate to quiz of that question set and check the contents
    cy.visit('/')
    cy.contains('Take Quiz').click()

    cy.contains('Test Question Set')
    cy.contains('Test Question 1')
    cy.contains('Answer 1')
    cy.contains('Answer 2')
  })

  it('should swap the choices of question set after submit', () => {
    createQuestionSet({
      cy,
      questions: [
        {
          description: 'Test Question 1',
          choices: [
            { answer: 'Answer 1', markAsCorrect: true },
            { answer: 'Answer 2' },
          ],
        },
      ],
    })

    cy.visit('/')
    cy.contains('Take Quiz').click()
    cy.contains('Submit').click()

    // Check if the choices are swapped after previous submit
    cy.visit('/')
    cy.contains('Take Quiz').click()

    cy.findByText('Answer 1').then(($el1) => {
      cy.findByText('Answer 2').then(($el2) => {
        expect($el2[0].compareDocumentPosition($el1[0])).to.eq(
          Node.DOCUMENT_POSITION_FOLLOWING,
        )
      })
    })
  })

  it('should only go back to home page when create question set successfully', () => {
    createQuestionSet({ cy, questionSetName: '' }) // Do not allow empty question set name

    // Should stay in the edit page
    cy.contains('Question Set Name').type('Valid Question Set Name')
    cy.contains('Save').click()

    assertIsInHomePage(cy)
    cy.contains('Valid Question Set Name')
  })

  it('should allow navigate to home page after submitted quiz', () => {
    createQuestionSet({ cy })

    cy.visit('/')
    cy.contains('Take Quiz').click()

    // Do the quiz
    cy.contains('Submit').click()
    cy.contains('Back').click()

    assertIsInHomePage(cy)
  })
})

// TODO: Perhaps can move to command.ts after typescript configuration of cypress, jest is configured properly

function assertIsInHomePage(cy) {
  cy.contains('Take Quiz')
}

/**
 * TODO: Currently not support more than 2 choices or more than 1 question. But no need for e2e testing currently
 */
function createQuestionSet({
  cy,
  questionSetName = 'Dummy Question Set',
  questions = [
    {
      description: 'Dummy Question 1',
      choices: [
        { answer: 'Dummy Answer 1', markAsCorrect: true },
        { answer: 'Dummy Answer 2' },
      ],
    },
  ],
}) {
  // TODO: Perhaps can move to command.ts after typescript configuration of cypress, jest is configured properly
  // TODO: Perhaps can reuse QuestionSetBuilderForTest from the main codebase, but can't figure out how to import it here

  cy.visit('/')
  cy.contains('Add New Question Set').click()

  if (questionSetName) cy.contains('Question Set Name').type(questionSetName)

  questions.forEach((question, index) => {
    cy.contains(`Question ${index + 1}`).type(question.description)

    question.choices.forEach((choice, choiceIndex) => {
      cy.findByLabelText(
        `answer of question ${index + 1} choice ${choiceIndex + 1}`,
      ).type(choice.answer)

      if (choice.markAsCorrect) {
        cy.findByLabelText(
          `question ${index + 1} choice ${choiceIndex + 1} is correct answer`,
        ).click()
      }
    })
  })

  cy.contains('Save').click()
}
