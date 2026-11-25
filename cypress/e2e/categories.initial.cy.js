describe('Тестирование раздела Категории 1. Системные дефолты и начальное состояние', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('button.settings').click();
    cy.wait(300);
    cy.get('section[name="settings"] [cy="categories"]').click();
    cy.wait(300);
  });

  it('1.0.1 Шапка экрана', () => {
    cy.get('section[name="categories"] .screen-top-bar h4').should('contain', 'Categories');
  });

  it('1.1 Отображение папки Inbox...', () => {
    cy.contains('.folder-item', 'Inbox').should('be.visible').within(() => {
        cy.contains('General').should('be.visible');
    });
  });

  it('1.2 Счетчик General', () => {
    cy.contains('.category-item', 'General').within(() => {
        cy.get('.wrapper-count').should('include.text', '0');
    });  
  });

  it('1.3 Счетчик Inbox', () => {
    cy.contains('.folder-item', 'Inbox').within(() => {
        cy.get('.count-folder').should('include.text', '1 of 5');
    });
  });

  it('1.4 Защита папки Inbox (меню не открывается)', () => {
    // Проверка иконки для inbox
    cy.contains('.folder-item', 'Inbox').find('sprite-icon').should('have.attr', 'name', 'inbox');

    // click force
    cy.contains('.folder-item', 'Inbox').find('.folder').click({ force: true });

    cy.contains('.folder-item', 'Inbox').find('.folder').should('not.have.class', 'active');
});


it('1.5 Защита категории General', () => {
    // Проверка иконки для General
    cy.contains('.category-item', 'General').find('sprite-icon').should('have.attr', 'name', 'general');
    // вызов меню
    cy.contains('.category-item', 'General').find('.content').click({ force: true });
    cy.contains('.category-item', 'General').find('.actions').contains('button', 'Move Tasks');
    // Видно только "Move Tasks"
    cy.contains('.category-item', 'General').find('.actions').contains('button', 'Move Tasks').should('be.visible').and('be.disabled');
    cy.contains('.category-item', 'General').find('.actions').contains('button', 'Rename').should('not.be.visible');
    cy.contains('.category-item', 'General').find('.actions').contains('button', 'Remove').should('not.be.visible');
});

it('1.0.2 Закрытие экрана Categories', () => {
    cy.get('section[name="categories"] [cy="close"]').click();
    cy.wait(500); 
});
});