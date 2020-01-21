import { HttpException } from '.';

export default class UnauthenticatedException extends HttpException {
  constructor(message?: string) {
    super(401, message || 'Unauthenticated');
  }
}
