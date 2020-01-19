export default interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  [key: string]: string;
}
