import { IsEmail, IsOptional, IsIn } from 'class-validator';
import { getValidationMessage } from '../../common/i18n/validation-messages';

function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class SendCodeDto {
  @IsEmail({}, { message: getMessage('email.invalid') })
  email: string;

  @IsOptional()
  @IsIn(['ru', 'en'], { message: getMessage('locale.invalid') })
  locale?: 'ru' | 'en';
}

