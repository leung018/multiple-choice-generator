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
        assertIsBefore($el2[0], $el1[0])
      })
    })
  })

  it('should only go back to home page when create question set successfully', () => {
    createQuestionSet({ cy, questionSetName: '' }) // Do not allow empty question set name. Expect staying in the edit page

    // Should stay in the edit page and able to continue to edit
    cy.contains('Question Set Name').type('Valid Question Set Name')
    cy.contains('Save').click()

    assertIsInHomePage(cy)
    cy.contains('Valid Question Set Name')
  })

  it('should able to modify existing question set', () => {
    createQuestionSet({ cy })

    cy.contains('Edit').click()
    cy.contains('Question Set Name').type('Edited name')
    cy.contains('Save').click()

    assertIsInHomePage(cy)
    cy.contains('Edited name')
  })

  it('should navigate back to home page after clicking home button', () => {
    cy.visit('/')
    cy.contains('Add New Question Set').click()

    cy.contains('Home').click()

    assertIsInHomePage(cy)
  })

  it('should after confirming delete question set will navigate to home page', () => {
    createQuestionSet({ cy })

    cy.contains('Edit').click()
    cy.contains('Delete').click()
    cy.contains('Confirm').click()

    assertIsInHomePage(cy)
  })
})

// TODO: Perhaps can move to command.ts after typescript configuration of cypress, jest is configured properly

function assertIsInHomePage(cy) {
  cy.contains('Add New Question Set')
}

// TODO: Copy from the main codebase, can't figure out how to import it here yet
function assertIsBefore(aHtmlElement, bHtmlElement) {
  expect(aHtmlElement.compareDocumentPosition(bHtmlElement)).to.eq(
    Node.DOCUMENT_POSITION_FOLLOWING,
  )
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
