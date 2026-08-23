describe('Проверка Todo App', () => {
  it('Должен быть список задач с карточками', () => {
    cy.visit('http://localhost:3000');
    
    // Проверка списока задач
    cy.get('.task-list').should('be.visible');
    
    // Проверка карточки 
    cy.get('.task-card').should('be.visible');
  });
});