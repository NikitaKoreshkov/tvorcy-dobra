import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';
import { getValidationMessage } from '../../common/i18n/validation-messages';

function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class AddCardDto {
  @IsString()
  @IsNotEmpty({ message: getMessage('cardNumber.required') })
  @Matches(/^[\d\s-]{13,19}$/, { message: getMessage('cardNumber.invalid') })
  cardNumber: string;

  @IsString()
  @IsNotEmpty({ message: getMessage('expiryMonth.required') })
  @Matches(/^(0[1-9]|1[0-2])$/, { message: getMessage('expiryMonth.invalid') })
  expiryMonth: string;

  @IsString()
  @IsNotEmpty({ message: getMessage('expiryYear.required') })
  @Matches(/^\d{4}$/, { message: getMessage('expiryYear.invalid') })
  expiryYear: string;

  @IsString()
  @IsNotEmpty({ message: getMessage('cvv.required') })
  @Matches(/^\d{3,4}$/, { message: getMessage('cvv.invalid') })
  cvv: string;

  @IsString()
  @IsOptional()
  cardholderName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

