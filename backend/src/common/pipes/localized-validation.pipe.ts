import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getValidationMessage, Locale } from '../i18n/validation-messages';

@Injectable()
export class LocalizedValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Получаем locale из body или заголовков
    const locale: Locale = value.locale || 'ru';

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(error => {
        const constraints = error.constraints || {};
        const firstKey = Object.keys(constraints)[0];
        if (firstKey) {
          // Пытаемся найти локализованное сообщение
          const constraintKey = this.mapConstraintToKey(firstKey, error.property);
          return getValidationMessage(constraintKey, locale) || constraints[firstKey];
        }
        return 'Validation failed';
      });
      throw new BadRequestException(messages);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private mapConstraintToKey(constraint: string, property: string): string {
    const mapping: Record<string, string> = {
      'isEmail': 'email.invalid',
      'isNotEmpty': `${property}.required`,
      'minLength': `${property}.minLength`,
      'matches': `${property}.pattern`,
      'isIn': 'locale.invalid',
      'isString': `${property}.required`,
      'isUUID': `${property}.invalid`,
    };

    return mapping[constraint] || `${property}.invalid`;
  }
}

