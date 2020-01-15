const { expect } = require('chai');
const sinon = require('sinon');

const isAuthorized = require('../../middlewares/is-authorized.middleware');

describe('Is authorized middleware', () => {
  it('should throw bad request error', () => {
    const req = { params: {} };
    const res = {};
    const next = () => {};

    try {
      isAuthorized(req, res, next);
    } catch (error) {
      expect(error.message).to.be.equal('Bad request');
      expect(error.statusCode).to.be.equal(400);
    }
  });

  it('should fail id check', () => {
    const req = { params: { id: 1 }, user: { _id: 2 } };
    const res = {};
    const next = () => {};

    try {
      isAuthorized(req, res, next);
    } catch (error) {
      expect(error.message).to.be.equal('Unauthorized');
      expect(error.statusCode).to.be.equal(403);
    }
  });

  it('should success', () => {
    const req = { params: { id: 1 }, user: { _id: 1 } };
    const res = {};
    const factory = { next: () => {} };

    const stub = sinon.stub(factory, 'next');

    try {
      isAuthorized(req, res, factory.next);
      expect(stub.called).to.be.true;
    } catch (error) {
      throw error;
    }
  });
});
