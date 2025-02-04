import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'incorrect email' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @Length(6, 32, {
    message:
      'password must be longer than or equal to 6 characters and less than or equal to 32 characters',
  })
  password: string;
}
