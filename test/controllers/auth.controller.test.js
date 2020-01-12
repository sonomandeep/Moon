const { expect } = require('chai');

const authController = require('../../controllers/auth.controller');

describe('Auth controller', () => {
  describe('Register', () => {
    // Validazione dati
    // Salvataggio nel database
    // Ritorno della risposta
    it('should create new user without errors', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'testuser@test.com',
          password: 'password',
        },
      };
      const res = { json: (data) => data };

      return authController
        .register(req, res, () => {})
        .then(({ id, username, email }) => {
          expect(id).to.not.be.null;
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
