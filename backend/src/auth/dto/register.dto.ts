import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { getValidationMessage } from '../../common/i18n/validation-messages';

// Helper function to get localized message
function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class RegisterDto {
  @IsEmail({}, { message: getMessage('email.invalid') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: getMessage('name.required') })
  @MinLength(2, { message: getMessage('name.minLength') })
  name: string;

  @IsString()
  @MinLength(8, { message: getMessage('password.minLength') })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: getMessage('password.pattern'),
  })
  password: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsIn(['ru', 'en'], { message: getMessage('locale.invalid') })
  locale?: 'ru' | 'en';
}

