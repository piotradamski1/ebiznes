describe('Produkty - lista i szczegóły', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('Ładuje listę produktów', () => {
        cy.get('article').should('have.length.at.least', 1)
    })

    it('Każdy produkt ma cenę > 0', () => {
        cy.get('article p').each(($el) => {
            const text = $el.text()
            const price = parseFloat(text.match(/([\d.]+)/)[1])
            expect(price).to.be.greaterThan(0)
        })
    })

    it('Kliknięcie produktu pokazuje szczegóły (modal lub strona)', () => {
        cy.get('article').first().click()
        cy.contains('Cena').should('exist')
    })

    it('Na liście nie ma duplikatów nazw', () => {
        const names = new Set()
        cy.get('article h2').each(($el) => {
            const name = $el.text().trim()
            expect(names.has(name)).to.be.false
            names.add(name)
        })
    })

    it('Co najmniej jeden produkt ma nazwę z wielką literą', () => {
        cy.get('article h2').then(($els) => {
            const hasCapital = Array.from($els).some((el) =>
                /^[A-ZĄĆĘŁŃÓŚŻŹ]/.test(el.textContent.trim())
            )
            expect(hasCapital).to.be.true
        })
    })
})

describe('Płatności - formularz', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.contains('Płatności').click()
    })


    it('Waliduje pusty formularz', () => {
        cy.get('input[name="amount"]').then(($input) => {
            expect($input[0].checkValidity()).to.be.false
        })
    })

    it('Select „Metoda” zawiera dokładnie 2 opcje', () => {
        cy.get('select[name="method"] option').should('have.length', 2)
    })

    it('Pole Kwota ma atrybut required', () => {
        cy.get('input[name="amount"]').should('have.attr', 'required')
    })

    it('Metoda płatności domyślnie ustawiona na "card"', () => {
        cy.get('select[name="method"]').should('have.value', 'card')
    })

    it('Wysyła poprawne dane', () => {
        cy.intercept('POST', '/payments').as('pay')
        cy.get('input[name="amount"]').type('123')
        cy.contains('Zapłać').click()
        cy.wait('@pay').its('request.body').should('have.property', 'amount', '123')
    })

    it('Czyści formularz', () => {
        cy.get('input[name="amount"]').should('have.value', '')
    })
})

describe('Nawigacja', () => {
    it('Przełącza się między Produktami a Płatnościami', () => {
        cy.visit('/')
        cy.contains('Płatności').click()
        cy.url().should('include', '/payments')
        cy.contains('Produkty').click()
        cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
})

describe('Produkty - dodatkowe scenariusze', () => {
    it('Pokazuje wskaźnik Ładowanie… dopóki nie przyjdą dane', () => {
        cy.intercept('GET', '/products', (req) => {
            req.reply((res) => {
                res.delay = 300
                res.send([{ id: 1, name: 'Test', price: 1 }])
            })
        })
        cy.visit('/')
        cy.contains('Ładowanie…').should('exist')
        cy.contains('Ładowanie…').should('not.exist')
    })

    it('Obsługuje błąd 500 wyświetla komunikat', () => {
        cy.intercept('GET', '/products', { statusCode: 500 }).as('err')
        cy.visit('/')
        cy.wait('@err')
        cy.contains(/Błąd/i).should('exist')
    })

    it('Format ceny zawiera „PLN”', () => {
        cy.intercept('GET', '/products', {
            body: [{ id: 1, name: 'AAA', price: 9.99 }],
        })
        cy.visit('/')
        cy.contains('PLN').should('exist')
    })

    it('Renderuje dokładnie 3 produkty', () => {
        cy.intercept('GET', '/products', {
            body: [
                { id: 1, name: 'A', price: 1 },
                { id: 2, name: 'B', price: 2 },
                { id: 3, name: 'C', price: 3 },
            ],
        })
        cy.visit('/')
        cy.get('article').should('have.length', 3)
    })
})

describe('Walidacje i statusy', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.contains('Płatności').click()
    })

    it('Obsługuje wybór metody BLIK i wysyła w body', () => {
        cy.intercept('POST', '/payments').as('pay')
        cy.get('select[name="method"]').select('blik')
        cy.get('input[name="amount"]').type('50')
        cy.contains('Zapłać').click()
        cy.wait('@pay')
            .its('request.body')
            .should('deep.equal', { amount: '50', method: 'blik' })
    })

    it('Resetuje method na „card” po sukcesie', () => {
        cy.intercept('POST', '/payments', { statusCode: 201 })
        cy.get('select[name="method"]').select('blik')
        cy.get('input[name="amount"]').type('1')
        cy.contains('Zapłać').click()
        cy.get('select[name="method"]').should('have.value', 'card')
    })

    it('Wyświetla Błąd serwera przy status 500', () => {
        cy.intercept('POST', '/payments', { statusCode: 500 })
        cy.get('input[name="amount"]').type('99')
        cy.contains('Zapłać').click()
        cy.contains('Błąd serwera').should('exist')
    })

    it('Pokazuje komunikat „Sukces” po udanym 201', () => {
        cy.intercept('POST', '/payments', { statusCode: 201 }).as('ok')
        cy.get('input[name="amount"]').type('10')
        cy.contains('Zapłać').click()
        cy.wait('@ok')
        cy.contains('Sukces').should('exist')
    })
})