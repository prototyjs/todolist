describe('Тестирование раздела Категории 4. Редактирование', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('button.settings').click();
    cy.wait(300);
    cy.get('section[name="settings"] [cy="categories"]').click();
    cy.wait(300);
    
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('ForEditing');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.get('.folder .title').contains('ForEditing').should('be.visible');
  });

  const openRenameMode = () => {
    cy.contains('.folder-item', 'ForEditing').contains('ForEditing').click();
    cy.contains('.folder-item', 'ForEditing').find('.actions').contains('button', 'Rename').should('be.visible').click();
  };

  it('4.1 Вход в режим Rename', () => {
    openRenameMode();
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().should('be.visible').and('have.value', 'ForEditing');
  });

  it('4.2 Очистка поля крестиком', () => {
    openRenameMode();
    cy.contains('.folder-item', 'ForEditing').find('.cancel-rename').first().click();
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().should('be.visible').and('have.value', '');
  });

  it('4.3 Ограничение длины', () => {
    openRenameMode();
    //  21 символ
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().type('Достопримечательность');
    // обрезалось до 20
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().should('have.value', 'Достопримечательност');
  });

  it('4.4 Автосохранение (blur)', () => {
    openRenameMode();
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().clear().type('NewName');
    cy.get('h4').contains('Categories').click();
    cy.contains('.folder-item', 'NewName').should('be.visible');
    cy.contains('.folder-item', 'NewName').find('input[type="text"]').should('not.be.visible');
  });

  it('4.5 Отмена при пустом поле', () => {
    openRenameMode();
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').first().clear();
    cy.get('h4').contains('Categories').click();
    
    // Проверяем, что имя осталось прежним
    cy.contains('.folder-item', 'ForEditing').should('be.visible');
    // Инпут не виден
    cy.contains('.folder-item', 'ForEditing').find('input[type="text"]').should('not.be.visible');
  });
});