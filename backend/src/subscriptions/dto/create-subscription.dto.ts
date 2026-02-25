import { IsNotEmpty, IsUUID } from 'class-validator';
import { getValidationMessage } from '../../common/i18n/validation-messages';

function getMessage(key: string, locale: 'ru' | 'en' = 'ru'): string {
  return getValidationMessage(key, locale);
}

export class CreateSubscriptionDto {
  @IsNotEmpty({ message: getMessage('planId.required', 'ru') })
  @IsUUID('4', { message: getMessage('planId.invalid', 'ru') })
  planId: string;

  @IsNotEmpty({ message: getMessage('paymentMethodId.required', 'ru') })
  @IsUUID('4', { message: getMessage('paymentMethodId.invalid', 'ru') })
  paymentMethodId: string;
}

