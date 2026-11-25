describe('Тестирование раздела Категории 5. Перенос', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('button.settings').click();
    cy.wait(300);
    cy.get('section[name="settings"] [cy="categories"]').click();
    cy.wait(300);
    
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('ForMove');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    
    // Пустая кат
    cy.contains('.folder-item', 'ForMove').find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField input[type="text"]').type('FirstEmpty');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    
    // Источник
    cy.contains('.folder-item', 'ForMove').find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField input[type="text"]').type('SourceCat');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    
    // Цель
    cy.contains('.folder-item', 'ForMove').find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField input[type="text"]').type('TargetCat');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
  });
  const startMoveMode = () => {
    cy.contains('.category-item', 'SourceCat').click();
    cy.contains('.category-item', 'SourceCat').find('[cy="menu-move"]').click();
  };

  it('5.7 Отображение исходной категории', () => {
    startMoveMode();
    cy.contains('.category-item', 'SourceCat').should('have.class', 'self');
    cy.get('.screen-top-bar').contains('button', 'Cancel').should('be.visible');
  });

  it('5.8 Отображение целевой категории', () => {
    startMoveMode();
    cy.contains('.category-item', 'TargetCat').click();
    cy.contains('.category-item', 'TargetCat').should('have.class', 'outline');
    cy.contains('.category-item', 'TargetCat').find('.added').should('be.visible').and('contain.text', '+5');
  });

  it('5.8.1 Смена целевой категории', () => {
    startMoveMode();
    cy.contains('.category-item', 'TargetCat').click(); // первая
    cy.contains('.category-item', 'TargetCat').find('.added').should('contain.text', '+5');
    cy.contains('.category-item', 'FirstEmpty').click();     // сменили
    cy.contains('.category-item', 'TargetCat').should('not.have.class', 'outline');   // с TargetCat снялось выделение
    cy.contains('.category-item', 'TargetCat').find('.added').should('not.be.visible');
    cy.contains('.category-item', 'FirstEmpty').should('have.class', 'outline');
    cy.contains('.category-item', 'FirstEmpty').find('.added').should('contain.text', '+5');
  });

  it('5.9 Блокировка выбора папки', () => {
    startMoveMode();
    cy.contains('.folder-item', 'ForMove').contains('ForMove').click();
    cy.contains('.folder-item', 'ForMove').find('.folder').should('not.have.class', 'outline');
  });

  it(' 5.10 Перенос без удаления исходной категории', () => {
    startMoveMode();
    
    cy.contains('.category-item', 'TargetCat').click();
    cy.contains('.category-item', 'TargetCat').find('.added').should('contain.text', '+5');
    cy.get('.screen-top-bar').contains('button', 'Move to').should('be.visible').click();
    cy.contains('.category-item', 'SourceCat').should('be.visible');
    cy.contains('.category-item', 'SourceCat').find('.wrapper-count').should('contain.text', '0');
    cy.contains('.category-item', 'TargetCat').find('.wrapper-count').should('contain.text', '10');
  });

  it('5.11 Отмена переноса задач', () => {
    startMoveMode();
    
    cy.contains('.category-item', 'TargetCat').click();
    cy.contains('.category-item', 'TargetCat').find('.added').should('contain.text', '+5');
    cy.get('.screen-top-bar').contains('button', 'Cancel').should('be.visible').click();
    cy.get('.screen-top-bar').contains('button', 'Move to').should('not.be.visible');
    cy.contains('.category-item', 'SourceCat').should('be.visible');
    cy.contains('.category-item', 'TargetCat').should('not.have.class', 'outline');
    cy.contains('.category-item', 'TargetCat').find('.added').should('not.be.visible');
  });

  it('5.12 Перенос с удалением исходной категории (Delete and Move)', () => {
    cy.contains('.category-item', 'SourceCat').find('.wrapper-count').should('contain.text', '5');
    cy.contains('.category-item', 'SourceCat').click();
    cy.contains('.category-item', 'SourceCat').find('[cy="menu-remove"]').click();
    cy.get('dialog#dialogElement').should('be.visible');
    cy.get('dialog#dialogElement [cy="dialog-action2"]').click();
    cy.contains('.category-item', 'TargetCat').click();
    cy.contains('.category-item', 'TargetCat').find('.added').should('contain.text', '+5');
    cy.get('.screen-top-bar').contains('button', 'Move to').should('be.visible').click();
    cy.contains('.category-item', 'SourceCat').should('not.exist');
    cy.contains('.category-item', 'TargetCat').find('.wrapper-count').should('contain.text', '10');
  });

});
