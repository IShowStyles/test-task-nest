import { IsEmail, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @Length(6, 32, { message: 'Неверная длина пароля' })
  password: string;
}
