import { IsEmail, IsString, MinLength } from 'class-validator';
import { getValidationMessage } from '../../common/i18n/validation-messages';

function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class LoginDto {
  @IsEmail({}, { message: getMessage('email.invalid') })
  email: string;

  @IsString()
  @MinLength(1, { message: getMessage('password.required', 'ru') })
  password: string;
}

