describe('Todo App Verification', () => {
  it('Should display a task list with task cards', () => {
    cy.visit('http://localhost:3000');
    
    // Check task list display
    cy.get('.task-list').should('be.visible');
    
    // Check task card display
    cy.get('.task-card').should('be.visible');
  });
});