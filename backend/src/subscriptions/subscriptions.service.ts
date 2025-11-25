import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import { SubscriptionPlan, SubscriptionPlanType } from '../entities/subscription-plan.entity';
import { UserSubscription, SubscriptionStatus } from '../entities/user-subscription.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource, // Для транзакций БД
  ) {}

  // Инициализация планов подписок (вызывается при старте приложения)
  async initializePlans() {
    const plans = [
      {
        type: SubscriptionPlanType.BASIC,
        name: 'Базовый',
        description: 'Базовый доступ к платформе',
        price: 299,
        billingPeriod: 'monthly',
        features: ['Доступ к базовым функциям', 'Отчеты о пожертвованиях'],
        includesAI: false,
        includesAdvancedReports: false,
        includesPrioritySupport: false,
      },
      {
        type: SubscriptionPlanType.PREMIUM,
        name: 'Премиум',
        description: 'Расширенный доступ с ИИ помощником',
        price: 799,
        billingPeriod: 'monthly',
        features: ['Все функции базового плана', 'Доступ к AliusAI', 'Расширенные отчеты', 'Приоритетная поддержка'],
        includesAI: true,
        includesAdvancedReports: true,
        includesPrioritySupport: true,
      },
      {
        type: SubscriptionPlanType.ULTIMATE,
        name: 'Максимальный',
        description: 'Полный доступ ко всем функциям',
        price: 1499,
        billingPeriod: 'monthly',
        features: ['Все функции премиум плана', 'Неограниченный доступ к ИИ', 'Персональный менеджер', 'Эксклюзивные функции'],
        includesAI: true,
        includesAdvancedReports: true,
        includesPrioritySupport: true,
      },
    ];

    for (const planData of plans) {
      const existingPlan = await this.subscriptionPlanRepository.findOne({
        where: { type: planData.type },
      });

      if (!existingPlan) {
        const plan = this.subscriptionPlanRepository.create(planData);
        await this.subscriptionPlanRepository.save(plan);
      } else {
        // Обновляем существующий план
        Object.assign(existingPlan, planData);
        await this.subscriptionPlanRepository.save(existingPlan);
      }
    }
  }

  // Получение всех доступных планов
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlanRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  // Получение активных подписок пользователя
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const subscriptions = await this.userSubscriptionRepository.find({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan', 'paymentMethod'],
      order: { createdAt: 'DESC' },
    });
    
    // Фильтруем только те, у которых nextBillingDate в будущем или подписка еще не истекла
    const now = new Date();
    return subscriptions.filter(sub => {
      if (sub.nextBillingDate && new Date(sub.nextBillingDate) > now) {
        return true;
      }
      if (sub.expiresAt && new Date(sub.expiresAt) > now) {
        return true;
      }
      return false;
    });
  }

  // Создание новой подписки
  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string,
  ): Promise<UserSubscription> {
    // Используем транзакцию БД для атомарности операций
    const queryRunner = this.dataSource.createQueryRunner();
    let isTransactionStarted = false;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      isTransactionStarted = true;

      // Проверяем, есть ли уже активная подписка (с блокировкой для предотвращения race condition)
      const existingSubscriptions = await queryRunner.manager.find(UserSubscription, {
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        lock: { mode: 'pessimistic_write' }, // Блокируем строки для предотвращения дублирования
      });

      // Фильтруем только те, которые еще не истекли
      const now = new Date();
      const activeSubscription = existingSubscriptions.find(sub => {
        if (sub.nextBillingDate && new Date(sub.nextBillingDate) > now) {
          return true;
        }
        if (sub.expiresAt && new Date(sub.expiresAt) > now) {
          return true;
        }
        return false;
      });

      if (activeSubscription) {
        if (isTransactionStarted) {
          await queryRunner.rollbackTransaction();
        }
        this.logger.warn(`Пользователь ${userId} попытался создать дублирующую подписку`);
        throw new BadRequestException('У вас уже есть активная подписка');
      }

      // Получаем план
      const plan = await queryRunner.manager.findOne(SubscriptionPlan, {
        where: { id: planId, isActive: true },
      });

      if (!plan) {
        if (isTransactionStarted) {
          await queryRunner.rollbackTransaction();
        }
        this.logger.warn(`План подписки ${planId} не найден или неактивен`);
        throw new NotFoundException('План подписки не найден');
      }

      // Проверяем платежный метод
      const paymentMethod = await queryRunner.manager.findOne(PaymentMethod, {
        where: { id: paymentMethodId, userId, isActive: true },
      });

      if (!paymentMethod) {
        // Проверяем, существует ли карта вообще
        const anyPaymentMethod = await queryRunner.manager.findOne(PaymentMethod, {
          where: { id: paymentMethodId },
        });
        
        if (isTransactionStarted) {
          await queryRunner.rollbackTransaction();
        }
        
        if (!anyPaymentMethod) {
          this.logger.warn(`Платежный метод ${paymentMethodId} не найден`);
          throw new NotFoundException('Платежный метод не найден');
        }
        if (anyPaymentMethod.userId !== userId) {
          this.logger.warn(`Пользователь ${userId} попытался использовать платежный метод ${paymentMethodId}, принадлежащий другому пользователю`);
          throw new BadRequestException('Платежный метод принадлежит другому пользователю');
        }
        if (!anyPaymentMethod.isActive) {
          this.logger.warn(`Платежный метод ${paymentMethodId} неактивен`);
          throw new BadRequestException('Платежный метод неактивен');
        }
        throw new NotFoundException('Платежный метод не найден');
      }

      // Проверяем, не истекла ли карта
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const cardYear = parseInt(paymentMethod.expiryYear);
      const cardMonth = parseInt(paymentMethod.expiryMonth);
      
      if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
        if (isTransactionStarted) {
          await queryRunner.rollbackTransaction();
        }
        this.logger.warn(`Срок действия платежного метода ${paymentMethodId} истек`);
        throw new BadRequestException('Срок действия карты истек');
      }

      // Валидация цены (защита от подмены)
      const planPrice = Number(plan.price);
      if (isNaN(planPrice) || planPrice <= 0) {
        if (isTransactionStarted) {
          await queryRunner.rollbackTransaction();
        }
        this.logger.error(`Некорректная цена плана ${planId}: ${plan.price}`);
        throw new BadRequestException('Некорректная цена плана подписки');
      }

      // Вычисляем дату следующего списания
      const nextBillingDate = new Date();
      if (plan.billingPeriod === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (plan.billingPeriod === 'yearly') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      // Создаем подписку
      const subscription = queryRunner.manager.create(UserSubscription, {
        userId,
        planId: plan.id,
        paymentMethodId: paymentMethod.id,
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate,
        amount: planPrice, // Используем цену из БД, а не из запроса
        autoRenew: true,
      });

      const savedSubscription = await queryRunner.manager.save(UserSubscription, subscription);

      // ВАЖНО: В реальном проекте здесь должна быть интеграция с платежным процессором
      // (Stripe, PayPal, YooKassa и т.д.) для реального списания средств
      // Сейчас создаем транзакцию как COMPLETED для тестирования
      
      // Создаем транзакцию для первого платежа
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        amount: Math.round(planPrice * 100), // В копейках, округляем для точности
        type: TransactionType.SUBSCRIPTION,
        status: TransactionStatus.COMPLETED, // В реальном проекте: сначала PENDING, затем COMPLETED после успешного списания
        projectName: `Подписка: ${plan.name}`,
        description: `Оплата подписки ${plan.name}`,
        paymentMethodId: paymentMethod.id,
        recurringPaymentId: savedSubscription.id, // Связываем с подпиской
        nextPaymentDate: savedSubscription.nextBillingDate,
      });

      await queryRunner.manager.save(Transaction, transaction);

      // Коммитим транзакцию
      await queryRunner.commitTransaction();

      this.logger.log(`Подписка успешно создана: ${savedSubscription.id} для пользователя ${userId}, план ${plan.name}`);

      return savedSubscription;
    } catch (error) {
      // Откатываем транзакцию только если она была начата
      if (isTransactionStarted) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (rollbackError) {
          this.logger.error(`Ошибка при откате транзакции для пользователя ${userId}:`, rollbackError);
        }
      }
      
      // Логируем ошибку с понятным русским текстом
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        this.logger.warn(`Ошибка создания подписки для пользователя ${userId}: ${error.message}`);
      } else {
        this.logger.error(`Ошибка создания подписки для пользователя ${userId}:`, error);
      }
      
      throw error;
    } finally {
      // Освобождаем соединение
      try {
        await queryRunner.release();
      } catch (releaseError) {
        this.logger.error(`Ошибка при освобождении соединения для пользователя ${userId}:`, releaseError);
      }
    }
  }

  // Отмена подписки
  async cancelSubscription(userId: string, subscriptionId: string): Promise<UserSubscription> {
    // Проверяем права доступа: пользователь может отменять только свои подписки
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { id: subscriptionId, userId }, // userId в where гарантирует, что пользователь может отменить только свою подписку
      relations: ['plan'],
    });

    if (!subscription) {
      this.logger.warn(`User ${userId} attempted to cancel non-existent subscription ${subscriptionId}`);
      throw new NotFoundException('Подписка не найдена');
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      this.logger.warn(`User ${userId} attempted to cancel already cancelled subscription ${subscriptionId}`);
      throw new BadRequestException('Подписка уже отменена или неактивна');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    // Подписка остается активной до даты следующего списания
    subscription.expiresAt = subscription.nextBillingDate;

    const savedSubscription = await this.userSubscriptionRepository.save(subscription);
    
    this.logger.log(`Subscription ${subscriptionId} cancelled by user ${userId}`);

    return savedSubscription;
  }

  // Получение активной подписки пользователя (для проверки доступа к функциям)
  async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
    return this.userSubscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: MoreThan(new Date()),
      },
      relations: ['plan'],
    });
  }

  // Проверка, имеет ли пользователь доступ к ИИ
  async hasAIAccess(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    return subscription?.plan.includesAI || false;
  }
}

