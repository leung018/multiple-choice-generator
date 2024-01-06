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
})
