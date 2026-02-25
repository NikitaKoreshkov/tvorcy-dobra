import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { EmailService } from './auth/email.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private newsletterRepository: Repository<NewsletterSubscription>,
    private emailService: EmailService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async subscribeToNewsletter(email: string, locale: 'ru' | 'en' = 'ru'): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
    // Проверяем, существует ли уже подписка с этим email
    const existingSubscription = await this.newsletterRepository.findOne({
      where: { email },
    });

    if (existingSubscription) {
      // Если подписка уже существует и активна
      if (existingSubscription.isActive) {
        return { success: true, alreadySubscribed: true };
      }
      // Если подписка была отключена, активируем её заново
      existingSubscription.isActive = true;
      existingSubscription.subscribedAt = new Date();
      await this.newsletterRepository.save(existingSubscription);
      await this.emailService.sendSubscriptionWelcome(email, locale);
      return { success: true, alreadySubscribed: false };
    }

    // Создаём новую подписку
    const subscription = this.newsletterRepository.create({
      email,
      isActive: true,
      subscribedAt: new Date(),
    });
    await this.newsletterRepository.save(subscription);
    await this.emailService.sendSubscriptionWelcome(email, locale);

    return { success: true, alreadySubscribed: false };
  }
}

