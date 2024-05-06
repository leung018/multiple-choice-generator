describe('End to end tests', () => {
  it('should save question set and navigate to quiz of that question set', () => {
    cy.visit('/')
    cy.contains('Add New Question Set').click()

    // Adding question set

    cy.contains('Question Set Name').type('Test Question Set')
    cy.contains('Question 1').type('Test Question 1')

    // choice 1
    cy.findByLabelText('answer of question 1 choice 1').type('Answer 1')
    cy.findByLabelText('question 1 choice 1 is correct answer').click()

    // choice 2
    cy.findByLabelText('answer of question 1 choice 2').type('Answer 2')

    cy.contains('Save').click()

    // Navigate to quiz of that question set and check the contents

    cy.visit('/')
    cy.contains('Take Quiz').click()

    cy.contains('Test Question Set')
    cy.contains('Test Question 1')
    cy.contains('Answer 1')
    cy.contains('Answer 2')
  })

  it('should swap the choices of question set after submit', () => {
    cy.visit('/')
    cy.contains('Add New Question Set').click()

    // Adding question set

    cy.contains('Question Set Name').type('Test Question Set')
    cy.contains('Question 1').type('Test Question 1')

    // choice 1
    cy.findByLabelText('answer of question 1 choice 1').type('Answer 1')
    cy.findByLabelText('question 1 choice 1 is correct answer').click()

    // choice 2
    cy.findByLabelText('answer of question 1 choice 2').type('Answer 2')

    cy.contains('Save').click()

    cy.visit('/')
    cy.contains('Take Quiz').click()
    cy.contains('Submit').click()

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
})
