// const { expect } = require('chai');
// const sinon = require('sinon');
// const expressValidator = require('express-validator');

// const handleValidation = require('../../middlewares/handle-validation.middleware');

// describe('Handle validation middleware', () => {
//   it('should throw validation error', () => {
//     sinon
//       .stub(expressValidator, 'validationResult')
//       .returns({ isEmpty: () => false, array: () => [1, 2] });

//     try {
//       handleValidation({}, {}, () => {});
//     } catch (error) {
//       expect(error.message).to.be.equal('Validation error');
//       expect(error.statusCode).to.be.equal(422);
//       expect(error.data).to.be.eql([1, 2]);
//     } finally {
//       expressValidator.validationResult.restore();
//     }
//   });

//   it('should handle validation successfully', () => {
//     const factory = {
//       next: () => {},
//     };
//     const stub = sinon.stub(factory, 'next');
//     sinon
//       .stub(expressValidator, 'validationResult')
//       .returns({ isEmpty: () => true, array: () => [1, 2] });

//     try {
//       handleValidation({}, {}, factory.next);
//       expect(stub.called).to.be.true;
//     } catch (error) {
//       throw error;
//     } finally {
//       expressValidator.validationResult.restore();
//     }
//   });
// });
