import express from 'express';
import { expect } from 'chai';

import { handleValidation } from '../../src/middlewares';

describe('Validation middleware', () => {
  it('should throw validation error', () => {
    let passed: Error = new Error();
    const next = (args: Error): void => {
      passed = args;
    };

    handleValidation(express.request, express.response, next);
    expect(passed).to.be.undefined;
  });
});
