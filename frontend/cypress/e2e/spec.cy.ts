describe('Authentication Tests', () => {
  it('should login', () => {
    cy.visit('http://localhost:5173')

    cy.get('[data-cy="emailInput"]').type('nidhi@example.com')

    cy.get('[data-cy="passwordInput"]').type('NewPassword123!')

    cy.get('[data-cy="submitBtn"]').click();
  })
})