describe('Тестирование раздела Категории 5. Удаление', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('button.settings').click();
    cy.wait(300);
    cy.get('section[name="settings"] [cy="categories"]').click();
    cy.wait(300);
  });

  const createCategory = (folderName, categoryName) => {
    cy.contains('.folder-item', folderName).find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField input[type="text"]').type(categoryName);
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.contains('.folder-item', folderName).find('.category-item').contains(categoryName).should('be.visible');
  };
  const clickMenuButton = (itemName, buttonText) => {
    cy.contains('.folder-item', itemName).click(); 
    cy.contains('.folder-item', itemName).find('.actions').contains('button', buttonText).should('be.visible').click();
  };

  it('5.1 Защита непустой папки', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('NotEmpty');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    createCategory('NotEmpty', 'Category 1');
    cy.contains('.folder-item', 'NotEmpty').contains('NotEmpty').click();
    cy.contains('.folder-item', 'NotEmpty').find('.actions').contains('button', 'Remove').should('be.disabled');
  });

  it('5.2 Удаление пустой папки', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('Empty');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.contains('.folder-item', 'Empty').contains('Empty').click();
    cy.contains('.folder-item', 'Empty').find('.actions').contains('button', 'Remove').click();
    cy.contains('.folder-item', 'Empty').should('not.exist');
  });

  it('5.3 Удаление пустой категории', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('ForDeletion');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    createCategory('ForDeletion', 'EmptyCat');
    cy.contains('.category-item', 'EmptyCat').click();
    cy.contains('.category-item', 'EmptyCat').find('.actions').contains('button', 'Remove').click();
    cy.contains('.category-item', 'EmptyCat').should('not.exist');
  });

  it('5.4, 5.5, 5.6 Вызов, отмена и удаление категории с задачами', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('WithTasks');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    createCategory('WithTasks', 'FirstCat');
    createCategory('WithTasks', 'SecondCat');
    cy.contains('.category-item', 'SecondCat').click();
    cy.contains('.category-item', 'SecondCat').find('.actions').contains('button', 'Remove').click();
    cy.get('dialog#dialogElement').should('be.visible');
    cy.get('dialog#dialogElement h4').should('contain.text', 'This category contains tasks');
    
    // 5.5 Отмена
    cy.get('dialog#dialogElement [cy="dialog-cancel"]').click();
    cy.get('dialog#dialogElement').should('not.be.visible');
    cy.contains('.category-item', 'SecondCat').should('be.visible');

    // 5.6 Удаление
    cy.contains('.category-item', 'SecondCat').click();
    cy.contains('.category-item', 'SecondCat').find('.actions').contains('button', 'Remove').click();
    cy.get('dialog#dialogElement [cy="dialog-action"]').click();
    
    cy.contains('.category-item', 'SecondCat').should('not.exist');
  });
});