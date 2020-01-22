import { HttpException } from '.';
export default class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(403, message || 'Unauthorized');
  }
}
