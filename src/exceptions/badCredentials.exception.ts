import { HttpException } from '.';

export default class BadCredentialsException extends HttpException {
  constructor(message?: string) {
    super(401, message || 'Bad credentials');
  }
}
