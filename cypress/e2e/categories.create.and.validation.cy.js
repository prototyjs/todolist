describe('Тестирование раздела Категории 2. Создание элементов + 3. Валидация', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('button.settings').click();
    cy.wait(300);
    cy.get('section[name="settings"] [cy="categories"]').click();
    cy.wait(300);
  }); 

  it('2.1 Вызов окна создания папки', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('#dialogField').should('be.visible');
    cy.get('dialog#dialogField h4').should('have.text', 'Folder name');
    cy.get('dialog#dialogField input[type="text"]').should('be.visible');
    cy.get('dialog#dialogField [cy="dialog-cancel"]').should('be.visible').and('have.text', 'Cancel');
    cy.get('dialog#dialogField [cy="dialog-create"]').should('be.visible').and('be.disabled');
  });

  it('2.2 Создание папки', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('Work');
  cy.get('dialog#dialogField [cy="dialog-create"]').click();
  cy.get('.folder .title').contains('Work').should('be.visible');
   cy.contains('.folder .title', /^Work$/).parents('.folder').find('.count-folder').should('have.text', '0 of 5');
});

  it('2.3 Отмена создания папки', () => {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type('Study');
    cy.get('dialog#dialogField [cy="dialog-cancel"]').click();
    cy.get('dialog#dialogField').should('not.be.visible');
    cy.get('.folder .title').contains('Study').should('not.exist');
  });

  it('2.4 Вызов окна создания категории', () => {
    cy.contains('.folder-item', 'Inbox').should('be.visible');
    cy.contains('.folder-item', 'Inbox').find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField').should('be.visible');
    cy.get('dialog#dialogField h4').should('have.text', 'Category name');
    cy.get('dialog#dialogField input[type="text"]').should('be.visible');
    cy.get('dialog#dialogField [cy="dialog-cancel"]').should('be.visible').and('have.text', 'Cancel');
    cy.get('dialog#dialogField [cy="dialog-create"]').should('be.visible').and('be.disabled');
});

  it('2.5 Создание категории', () => {
    cy.contains('.folder-item', 'Inbox').find('li[cy="addCategory"]').should('be.visible').click(); 
    cy.get('dialog#dialogField input[type="text"]').type('Sport');
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.contains('.folder-item', 'Inbox').find('.category-item').contains('Sport').should('be.visible')
}); 

  it('2.6 Отмена создания категории', () => {
  cy.contains('.folder-item', 'Inbox').find('li[cy="addCategory"]').should('be.visible').click();
  cy.get('dialog#dialogField input[type="text"]').type('Code');
  cy.get('dialog#dialogField [cy="dialog-cancel"]').click();
  cy.get('dialog#dialogField').should('not.be.visible');
  cy.contains('.folder-item', 'Inbox').find('.category-item').contains('Code').should('not.exist');
});

it('2.7 Сброс состояния при отмене (Папки)', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('Meetings');
  cy.get('dialog#dialogField [cy="dialog-cancel"]').click();
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').should('have.value', '');
});

it('2.8 Сброс состояния при отмене (Категории)', () => {
  cy.contains('.folder-item', 'Inbox').find('li[cy="addCategory"]').should('be.visible').click();
  cy.get('dialog#dialogField input[type="text"]').type('Team schedule');
  cy.get('dialog#dialogField [cy="dialog-cancel"]').click();
  cy.contains('.folder-item', 'Inbox').find('li[cy="addCategory"]').should('be.visible').click();
  // Поле должно быть пустым
  cy.get('dialog#dialogField input[type="text"]').should('have.value', '');
  cy.get('dialog#dialogField [cy="dialog-cancel"]').click(); // Закрываем окно
  cy.get('[cy="addFolder"]').click(); // Открываем создание папки
  cy.get('dialog#dialogField input[type="text"]').should('have.value', ''); // Текст не перенесся
});

it('2.9 Клик вне модального окна', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('Test');
  cy.get('dialog#dialogField').click('topLeft', { force: true });
  cy.get('dialog#dialogField').should('be.visible');
  cy.get('dialog#dialogField input[type="text"]').should('have.value', 'Test');
});

it('3.1 Валидация пустого ввода', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField [cy="dialog-create"]').should('be.disabled');
  cy.get('dialog#dialogField input[type="text"]').type('А');
  cy.get('dialog#dialogField [cy="dialog-create"]').should('not.be.disabled');
  cy.get('dialog#dialogField input[type="text"]').clear();
  cy.get('dialog#dialogField [cy="dialog-create"]').should('be.disabled');
});

it('3.2 Нижняя граница длины', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('A');
  cy.get('dialog#dialogField [cy="dialog-create"]').click();
  cy.get('.folder .title').contains('A').should('be.visible');
});

it('3.3 Спецсимволы', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('Test_#1');
  cy.get('dialog#dialogField [cy="dialog-create"]').click();
  cy.get('.folder .title').contains('Test_#1').should('be.visible');
});

it('3.4 Строка из пробелов', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('   ');
  cy.get('dialog#dialogField [cy="dialog-create"]').should('be.disabled');
});

it('3.5 Максимальный лимит папок', () => {
  for (let i = 1; i <= 4; i++) {
    cy.get('[cy="addFolder"]').click();
    cy.get('dialog#dialogField input[type="text"]').type(`Folder ${i}`);
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.get('.folder .title').contains(`Folder ${i}`).should('be.visible');
  }
  cy.get('[cy="addFolder"]').should('not.be.visible');
});

it('3.6 Максимальный лимит категорий', () => {
  cy.get('[cy="addFolder"]').click();
  cy.get('dialog#dialogField input[type="text"]').type('Max');
  cy.get('dialog#dialogField [cy="dialog-create"]').click();
  cy.get('.folder .title').contains('Max').should('be.visible');
  for (let i = 1; i <= 5; i++) {
    cy.contains('.folder-item', 'Max').find('li[cy="addCategory"]').should('be.visible').click();
    cy.get('dialog#dialogField input[type="text"]').type(`Category ${i}`);
    cy.get('dialog#dialogField [cy="dialog-create"]').click();
    cy.contains('.folder-item', 'Max').find('.category-item').contains(`Category ${i}`).should('be.visible');
  
   if (i === 1) {
      cy.contains('.category-item', 'Category 1').should('contain.text', '0');
    } else {
      cy.contains('.category-item', `Category ${i}`).should('contain.text', '5');
    }
  }
  cy.contains('.folder-item', 'Max').find('.count-folder').should('have.text', '5 of 5');
  cy.contains('.folder-item', 'Max').find('li[cy="addCategory"]').should('not.be.visible');
});
});
