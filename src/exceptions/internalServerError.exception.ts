import { HttpException } from '.';

export default class InternalServerError extends HttpException {
  constructor(message?: string) {
    super(500, message || 'Internal server error');
  }
}
