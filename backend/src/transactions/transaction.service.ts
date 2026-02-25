import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, FindOptionsOrder } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @Inject(forwardRef(() => GamificationService))
    private gamificationService: GamificationService,
  ) {}

  // Получение всех транзакций пользователя с сортировкой
  async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ transactions: Transaction[]; total: number }> {
    // Валидация и маппинг полей сортировки
    const sortFieldMap: Record<string, keyof Transaction> = {
      date: 'createdAt',
      createdAt: 'createdAt',
      amount: 'amount',
      status: 'status',
      projectName: 'projectName',
    };

    const sortField = sortFieldMap[sortBy] || 'createdAt';
    const order: FindOptionsOrder<Transaction> = {
      [sortField]: sortOrder,
    };

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { userId },
      relations: ['paymentMethod'],
      order,
      take: limit,
      skip: offset,
    });

    return { transactions, total };
  }

  // Получение регулярных платежей пользователя (только активные)
  async getRecurringPayments(userId: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.RECURRING,
        status: TransactionStatus.COMPLETED,
      },
      relations: ['paymentMethod'],
      order: { createdAt: 'DESC' },
    });
  }

  // Получение транзакции по ID
  async getTransactionById(userId: string, transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
      relations: ['paymentMethod'],
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  // Создание тестовых транзакций для пользователя
  async createTestTransactions(userId: string): Promise<Transaction[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const testTransactions = [
      {
        userId,
        type: TransactionType.ONE_TIME,
        status: TransactionStatus.COMPLETED,
        amount: 50000, // 500 рублей
        currency: 'RUB',
        projectName: 'Вода для Непала',
        description: 'Единовременное пожертвование на проект обеспечения чистой водой',
        projectId: 'project-1',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 дней назад
      },
      {
        userId,
        type: TransactionType.ONE_TIME,
        status: TransactionStatus.COMPLETED,
        amount: 100000, // 1000 рублей
        currency: 'RUB',
        projectName: 'Образование в Африке',
        description: 'Поддержка образовательных программ',
        projectId: 'project-2',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 дней назад
      },
      {
        userId,
        type: TransactionType.RECURRING,
        status: TransactionStatus.COMPLETED,
        amount: 250000, // 2500 рублей
        currency: 'RUB',
        projectName: 'Здравоохранение',
        description: 'Ежемесячное пожертвование на медицинские программы',
        projectId: 'project-3',
        recurringPaymentId: 'recurring-1',
        nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // через 20 дней
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 дней назад
      },
      {
        userId,
        type: TransactionType.ONE_TIME,
        status: TransactionStatus.COMPLETED,
        amount: 75000, // 750 рублей
        currency: 'RUB',
        projectName: 'Помощь детям',
        description: 'Разовое пожертвование',
        projectId: 'project-4',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 дня назад
      },
      {
        userId,
        type: TransactionType.ONE_TIME,
        status: TransactionStatus.PENDING,
        amount: 30000, // 300 рублей
        currency: 'RUB',
        projectName: 'Экология',
        description: 'Пожертвование в обработке',
        projectId: 'project-5',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // вчера
      },
    ];

    const createdTransactions = [];
    for (const transactionData of testTransactions) {
      const transaction = this.transactionRepository.create(transactionData);
      const saved = await this.transactionRepository.save(transaction);
      createdTransactions.push(saved);
    }

    // Проверяем достижения после создания транзакций
    try {
      await this.gamificationService.checkAndUpdateAchievements(userId);
    } catch (error) {
      console.error('Error checking achievements:', error);
      // Не прерываем выполнение, если проверка достижений не удалась
    }

    return createdTransactions;
  }

  // Обновление регулярного платежа
  async updateRecurringPayment(
    userId: string,
    transactionId: string,
    updateData: {
      amount?: number;
      projectName?: string;
      description?: string;
      nextPaymentDate?: Date;
    },
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        userId,
        type: TransactionType.RECURRING,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Регулярный платёж не найден');
    }

    if (updateData.amount !== undefined) {
      transaction.amount = updateData.amount;
    }
    if (updateData.projectName) {
      transaction.projectName = updateData.projectName;
    }
    if (updateData.description !== undefined) {
      transaction.description = updateData.description;
    }
    if (updateData.nextPaymentDate) {
      transaction.nextPaymentDate = updateData.nextPaymentDate;
    }

    return await this.transactionRepository.save(transaction);
  }

  // Отмена регулярного платежа
  async cancelRecurringPayment(userId: string, transactionId: string): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id: transactionId,
        userId,
        type: TransactionType.RECURRING,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Регулярный платёж не найден');
    }

    // Помечаем транзакцию как отмененную
    transaction.status = TransactionStatus.CANCELLED;
    transaction.nextPaymentDate = null;
    await this.transactionRepository.save(transaction);
  }

  // Обновление проекта при пожертвовании
  private async updateProjectAfterDonation(projectId: string | null, amount: number): Promise<void> {
    if (!projectId) {
      return; // Если проект не указан, ничего не делаем
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return; // Проект не найден, ничего не делаем
    }

    // Обновляем собранную сумму (amount в копейках, конвертируем в рубли для raised)
    const amountInRubles = amount / 100;
    project.raised = Number(project.raised) + amountInRubles;
    project.donors = Number(project.donors) + 1;

    // Проверяем, достигнута ли цель
    if (Number(project.raised) >= Number(project.goal) && project.status === ProjectStatus.ACTIVE) {
      project.status = ProjectStatus.COMPLETED;
      project.completedAt = new Date();
    }

    await this.projectRepository.save(project);
  }

  // Создание разового пожертвования
  async createOneTimeDonation(
    userId: string,
    createData: {
      amount: number;
      currency?: string;
      projectName?: string;
      description?: string;
      projectId?: string;
      paymentMethodId?: string;
    },
  ): Promise<Transaction> {
    // Проверяем наличие платежного метода, если указан
    if (createData.paymentMethodId) {
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: {
          id: createData.paymentMethodId,
          userId,
          isActive: true,
        },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Платёжный метод не найден или неактивен');
      }
    }

    // Создаем разовую транзакцию
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.ONE_TIME,
      status: TransactionStatus.COMPLETED, // В реальном проекте сначала PENDING, затем COMPLETED после успешного платежа
      amount: createData.amount * 100, // Конвертируем рубли в копейки
      currency: createData.currency || 'RUB',
      projectName: createData.projectName || 'Общий фонд',
      description: createData.description || null,
      projectId: createData.projectId || null,
      paymentMethodId: createData.paymentMethodId || null,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Обновляем проект (raised и donors)
    try {
      await this.updateProjectAfterDonation(createData.projectId || null, savedTransaction.amount);
    } catch (error) {
      console.error('Error updating project after donation:', error);
      // Не прерываем выполнение, если обновление проекта не удалось
    }

    // Проверяем достижения
    try {
      await this.gamificationService.checkAndUpdateAchievements(userId);
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    return savedTransaction;
  }

  // Создание регулярного платежа
  async createRecurringPayment(
    userId: string,
    createData: {
      amount: number;
      currency: string;
      projectName: string;
      description?: string;
      projectId?: string;
      paymentMethodId: string;
      nextPaymentDate: Date;
    },
  ): Promise<Transaction> {
    // Проверяем наличие платежного метода
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: createData.paymentMethodId,
        userId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Платёжный метод не найден или неактивен');
    }

    // Конвертируем рубли в копейки для amount
    const amountInCents = createData.amount * 100;

    // Создаем регулярную транзакцию
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.RECURRING,
      status: TransactionStatus.COMPLETED, // В реальном проекте сначала PENDING, затем COMPLETED после успешного списания
      amount: amountInCents,
      currency: createData.currency || 'RUB',
      projectName: createData.projectName,
      description: createData.description || null,
      projectId: createData.projectId || null,
      paymentMethodId: createData.paymentMethodId,
      nextPaymentDate: createData.nextPaymentDate,
      recurringPaymentId: null, // Будет установлен после первого успешного платежа
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Обновляем recurringPaymentId для связи с самим собой
    savedTransaction.recurringPaymentId = savedTransaction.id;
    await this.transactionRepository.save(savedTransaction);

    // Обновляем проект (raised и donors) - для регулярного платежа тоже обновляем сразу
    try {
      await this.updateProjectAfterDonation(createData.projectId || null, savedTransaction.amount);
    } catch (error) {
      console.error('Error updating project after recurring payment:', error);
      // Не прерываем выполнение, если обновление проекта не удалось
    }

    // Проверяем достижения
    try {
      await this.gamificationService.checkAndUpdateAchievements(userId);
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    return savedTransaction;
  }

  // Получение статистики транзакций пользователя
  async getUserTransactionStats(userId: string): Promise<{
    totalAmount: number;
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    recurringPayments: number;
  }> {
    const [allTransactions, completed, pending, recurring] = await Promise.all([
      this.transactionRepository.find({ where: { userId } }),
      this.transactionRepository.find({
        where: { userId, status: TransactionStatus.COMPLETED },
      }),
      this.transactionRepository.find({
        where: { userId, status: TransactionStatus.PENDING },
      }),
      this.transactionRepository.find({
        where: { userId, type: TransactionType.RECURRING, status: TransactionStatus.COMPLETED },
      }),
    ]);

    const totalAmount = completed.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalAmount,
      totalTransactions: allTransactions.length,
      completedTransactions: completed.length,
      pendingTransactions: pending.length,
      recurringPayments: recurring.length,
    };
  }

  // Получение данных для dashboard
  async getDashboardData(userId: string): Promise<{
    totalDonated: number;
    projectsCount: number;
    countriesCount: number;
    recentDonations: Array<{
      id: string;
      project: string;
      amount: number;
      date: string;
      status: string;
    }>;
    totalPlatformAmount: number;
  }> {
    // Получаем все завершенные транзакции пользователя
    const completedTransactions = await this.transactionRepository.find({
      where: { userId, status: TransactionStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });

    // Общая сумма пожертвований пользователя (в копейках, конвертируем в рубли)
    const totalDonated = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / 100;

    // Уникальные проекты
    const uniqueProjects = new Set(completedTransactions.map((t) => t.projectId || t.projectName));
    const projectsCount = uniqueProjects.size;

    // Уникальные страны (из metadata или используем тестовые данные)
    const countries = new Set<string>();
    completedTransactions.forEach((t) => {
      if (t.metadata?.country) {
        countries.add(t.metadata.country);
      }
    });
    // Если нет стран в metadata, используем тестовые данные на основе проектов
    const countriesCount = countries.size > 0 ? countries.size : Math.min(projectsCount, 3);

    // Последние пожертвования (максимум 5)
    const recentDonations = completedTransactions.slice(0, 5).map((t) => ({
      id: t.id,
      project: t.projectName,
      amount: Number(t.amount) / 100, // Конвертируем из копеек в рубли
      date: t.createdAt.toISOString().split('T')[0],
      status: t.status === TransactionStatus.COMPLETED ? 'Завершено' : 'Сбор продолжается',
    }));

    // Общая сумма всех транзакций на платформе (для отображения общего эффекта)
    const allPlatformTransactions = await this.transactionRepository.find({
      where: { status: TransactionStatus.COMPLETED },
    });
    const totalPlatformAmount = allPlatformTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    ) / 100; // Конвертируем из копеек в рубли

    return {
      totalDonated,
      projectsCount,
      countriesCount,
      recentDonations,
      totalPlatformAmount,
    };
  }
}

