import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { PaymentMethod, CardType } from '../entities/payment-method.entity';
import { User } from '../entities/user.entity';

export interface AddCardDto {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName?: string;
  isDefault?: boolean;
}

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Валидация номера карты по алгоритму Луна
  validateCardNumber(cardNumber: string): boolean {
    // Удаляем пробелы и дефисы
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    
    // Проверяем, что это только цифры и длина от 13 до 19
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    // Алгоритм Луна
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Определение типа карты по номеру
  detectCardType(cardNumber: string): CardType {
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Visa: начинается с 4
    if (/^4/.test(cleaned)) {
      return CardType.VISA;
    }

    // Mastercard: начинается с 51-55 или 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return CardType.MASTERCARD;
    }

    // МИР: начинается с 2200-2204
    if (/^220[0-4]/.test(cleaned)) {
      return CardType.MIR;
    }

    // American Express: начинается с 34 или 37
    if (/^3[47]/.test(cleaned)) {
      return CardType.AMEX;
    }

    return CardType.OTHER;
  }

  // Получение бренда карты
  getCardBrand(cardType: CardType): string {
    const brands = {
      [CardType.VISA]: 'Visa',
      [CardType.MASTERCARD]: 'Mastercard',
      [CardType.MIR]: 'МИР',
      [CardType.AMEX]: 'American Express',
      [CardType.OTHER]: 'Карта',
    };
    return brands[cardType];
  }

  // Валидация CVV
  validateCVV(cvv: string, cardType: CardType): boolean {
    const cleaned = cvv.replace(/\s/g, '');
    
    // AMEX имеет 4 цифры, остальные - 3
    if (cardType === CardType.AMEX) {
      return /^\d{4}$/.test(cleaned);
    }
    return /^\d{3}$/.test(cleaned);
  }

  // Валидация даты истечения
  validateExpiry(month: string, year: string): boolean {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (yearNum < currentYear) {
      return false;
    }

    if (yearNum === currentYear && monthNum < currentMonth) {
      return false;
    }

    return true;
  }

  // Создание фингерпринта карты (хеш от номера карты)
  async createFingerprint(cardNumber: string, userId: string): Promise<string> {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    // Используем комбинацию номера карты и userId для уникальности
    const data = `${cleaned}-${userId}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Генерация токена (в продакшене это будет токен от платежного процессора)
  async generateToken(cardNumber: string, cvv: string, userId: string): Promise<string> {
    // В реальном приложении здесь должен быть вызов API платежного процессора (Stripe, etc.)
    // Для демо создаем безопасный токен
    const data = `${cardNumber}-${cvv}-${userId}-${Date.now()}`;
    const hash = await argon2.hash(data, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    return hash;
  }

  // Получение последних 4 цифр карты
  getLast4(cardNumber: string): string {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    return cleaned.slice(-4);
  }

  // Добавление новой карты
  async addCard(userId: string, cardData: AddCardDto): Promise<PaymentMethod> {
    // Валидация номера карты
    if (!this.validateCardNumber(cardData.cardNumber)) {
      throw new BadRequestException('Неверный номер карты');
    }

    // Определение типа карты
    const cardType = this.detectCardType(cardData.cardNumber);

    // Валидация CVV
    if (!this.validateCVV(cardData.cvv, cardType)) {
      throw new BadRequestException('Неверный CVV код');
    }

    // Валидация даты истечения
    if (!this.validateExpiry(cardData.expiryMonth, cardData.expiryYear)) {
      throw new BadRequestException('Неверная дата истечения карты');
    }

    // Проверка существования пользователя
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Создание фингерпринта для проверки дубликатов
    const fingerprint = await this.createFingerprint(cardData.cardNumber, userId);

    // Проверка, не добавлена ли уже эта карта
    const existingCard = await this.paymentMethodRepository.findOne({
      where: { fingerprint, userId, isActive: true },
    });

    if (existingCard) {
      throw new BadRequestException('Эта карта уже добавлена');
    }

    // Генерация токена
    const token = await this.generateToken(cardData.cardNumber, cardData.cvv, userId);

    // Если это первая карта или указана как основная, делаем её основной
    const existingCards = await this.paymentMethodRepository.count({
      where: { userId, isActive: true },
    });

    const isDefault = cardData.isDefault ?? existingCards === 0;

    // Если устанавливаем новую карту как основную, снимаем флаг с других
    if (isDefault) {
      await this.paymentMethodRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    // Создание записи о карте
    const paymentMethod = this.paymentMethodRepository.create({
      userId,
      cardType,
      last4: this.getLast4(cardData.cardNumber),
      token,
      cardholderName: cardData.cardholderName || null,
      expiryMonth: cardData.expiryMonth.padStart(2, '0'),
      expiryYear: cardData.expiryYear,
      isDefault,
      isActive: true,
      brand: this.getCardBrand(cardType),
      fingerprint,
    });

    return await this.paymentMethodRepository.save(paymentMethod);
  }

  // Получение всех карт пользователя
  async getUserCards(userId: string): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  // Удаление карты
  async deleteCard(userId: string, cardId: string): Promise<void> {
    const card = await this.paymentMethodRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена');
    }

    // Не удаляем физически, а помечаем как неактивную (для истории)
    card.isActive = false;
    await this.paymentMethodRepository.save(card);

    // Если удаляли основную карту, делаем основную первую доступную
    if (card.isDefault) {
      const otherCards = await this.paymentMethodRepository.find({
        where: { userId, isActive: true },
        order: { createdAt: 'ASC' },
        take: 1,
      });

      if (otherCards.length > 0) {
        otherCards[0].isDefault = true;
        await this.paymentMethodRepository.save(otherCards[0]);
      }
    }
  }

  // Установка карты как основной
  async setDefaultCard(userId: string, cardId: string): Promise<PaymentMethod> {
    const card = await this.paymentMethodRepository.findOne({
      where: { id: cardId, userId, isActive: true },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена');
    }

    // Снимаем флаг основной с других карт
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    // Устанавливаем новую основную карту
    card.isDefault = true;
    return await this.paymentMethodRepository.save(card);
  }

  // Получение основной карты пользователя
  async getDefaultCard(userId: string): Promise<PaymentMethod | null> {
    return await this.paymentMethodRepository.findOne({
      where: { userId, isDefault: true, isActive: true },
    });
  }

  // Получение карты по ID
  async getCardById(userId: string, cardId: string): Promise<PaymentMethod> {
    const card = await this.paymentMethodRepository.findOne({
      where: { id: cardId, userId, isActive: true },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена');
    }

    return card;
  }
}

