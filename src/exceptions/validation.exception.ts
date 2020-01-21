import { HttpException } from '.';
import { ValidationError } from 'express-validator';

export default class ValidationException extends HttpException {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(422, 'Validation error');
    this.errors = errors;
  }
}
