describe('Authentication Tests', () => {
  it('should login', () => {
    cy.visit('http://localhost:5173')

    cy.get('[data-cy="emailInput"]').type('nidhi@example.com')

    cy.get('[data-cy="passwordInput"]').type('NewPassword123!')

    cy.get('[data-cy="submitBtn"]').click();


  })
})


describe('Login Flow', () => {
  it('logs in successfully through the backend API', () => {
    // Watch the backend login API request
    cy.intercept('POST', 'http://localhost:3000/auth/login').as('loginRequest');

    // Open the React login page
    cy.visit('http://localhost:5173/login');

    // Enter credentials
    cy.get('input[type="email"]')
      .type('akash@gmail.com');

    cy.get('input[type="password"]')
      .type('akash');

    // Submit login form
    cy.get('button[type="submit"]')
      .click();

    // Wait for and inspect the backend response
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);

      expect(interception.response?.body.message)
        .to.equal('Login successful');

      expect(interception.response?.body.user.email)
        .to.equal('akash@gmail.com');
    });

    // Finally verify the frontend reacted correctly
  cy.url().should('include', '/dashboard');
  });
});


it('redirects unauthenticated users away from the dashboard', () => {
  // Watch the authentication check
  cy.intercept('GET', 'http://localhost:3000/auth/me').as('getMe');

  // Try to access the protected dashboard directly
  cy.visit('http://localhost:5173/dashboard');

  // Wait for the frontend to check authentication
  cy.wait('@getMe').then((interception) => {
    // Backend should reject the request because there is no session
    expect(interception.response?.statusCode).to.equal(401);
  });

  // User should be redirected to login
  cy.url().should('include', '/login');
});


