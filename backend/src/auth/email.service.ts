import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Используем переменные окружения или значения по умолчанию
    const smtpUser = process.env.SMTP_USER || 'pavelcvetkov03907@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'ktvt htkt hsuu sqry';
    const smtpFrom = process.env.SMTP_FROM || 'pavelcvetkov03907@gmail.com';

    // Сохраняем from для использования в методах
    this.fromEmail = smtpFrom;

    // Используем service: 'gmail' как на localhost - это автоматически настроит правильные параметры
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Дополнительные настройки для надежности
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Проверяем соединение при инициализации
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service configuration error:', error);
      } else {
        console.log('Email service is ready to send messages');
      }
    });
  }

  private fromEmail: string;

  async sendVerificationCode(email: string, code: string, locale: 'ru' | 'en' = 'ru'): Promise<void> {
    const htmlTemplate = this.getEmailTemplate(code, locale);

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: locale === 'en' 
          ? 'Registration verification code - The creators of Good'
          : 'Код подтверждения регистрации - Творцы Добра',
        html: htmlTemplate,
      });
      console.log(`Verification code sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new Error(`Failed to send verification code: ${error.message}`);
    }
  }

  async sendSubscriptionWelcome(email: string, locale: 'ru' | 'en' = 'ru'): Promise<void> {
    const htmlTemplate = this.getSubscriptionWelcomeTemplate(locale);

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: locale === 'en'
          ? 'Welcome to The creators of Good community! 🎉'
          : 'Добро пожаловать в сообщество Творцы Добра! 🎉',
        html: htmlTemplate,
      });
      console.log(`Subscription welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending subscription welcome email:', error);
      throw new Error(`Failed to send subscription welcome email: ${error.message}`);
    }
  }

  private getEmailTemplate(code: string, locale: 'ru' | 'en' = 'ru'): string {
    if (locale === 'en') {
      return this.getEmailTemplateEn(code);
    }
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Код подтверждения</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Код подтверждения регистрации
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Спасибо за регистрацию! Для завершения регистрации введите следующий код подтверждения:
                            </p>
                            
                            <!-- Code Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #000000; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                                                ${code}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                Этот код действителен в течение 10 минут. Если вы не запрашивали этот код, просто проигнорируйте это письмо.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getEmailTemplateEn(code: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Registration Verification Code
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Thank you for registering! To complete your registration, please enter the following verification code:
                            </p>
                            
                            <!-- Code Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #000000; border-radius: 12px; padding: 30px; display: inline-block;">
                                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">
                                                ${code}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                This code is valid for 10 minutes. If you did not request this code, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Creating good at scale
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getSubscriptionWelcomeTemplate(locale: 'ru' | 'en' = 'ru'): string {
    if (locale === 'en') {
      return this.getSubscriptionWelcomeTemplateEn();
    }
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Добро пожаловать в Творцы Добра</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Celebration Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="font-size: 64px; line-height: 1;">🎉</div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                Добро пожаловать в наше сообщество!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                Спасибо за подписку на рассылку Творцы Добра!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Теперь вы будете первыми узнавать о новых проектах, важных результатах нашей работы и возможностях изменить мир к лучшему.
                            </p>
                            
                            <!-- Features Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px;">
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">✨</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Актуальные новости
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Получайте информацию о запуске новых благотворительных программ
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8; padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Отчёты о результатах
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Узнавайте, как ваша поддержка меняет жизни людей
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">💝</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Возможности помочь
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Будьте в курсе всех способов внести свой вклад
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0 10px;">
                                        <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333; text-align: center; font-weight: 500;">
                                            Вместе мы создаём добро в масштабе!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Создаём добро с масштабом
                            </p>
                            <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.6; color: #bbbbbb;">
                                Вы получили это письмо, потому что подписались на рассылку Творцы Добра
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getSubscriptionWelcomeTemplateEn(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to The creators of Good</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Celebration Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="font-size: 64px; line-height: 1;">🎉</div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                Welcome to our community!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                Thank you for subscribing to The creators of Good newsletter!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Now you'll be the first to know about new projects, important results of our work, and opportunities to make the world a better place.
                            </p>
                            
                            <!-- Features Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px;">
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">✨</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Latest news
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Get information about new charity programs launch
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8; padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Results reports
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Learn how your support changes people's lives
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">💝</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Ways to help
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Stay informed about all ways to contribute
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0 10px;">
                                        <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333; text-align: center; font-weight: 500;">
                                            Together we create good at scale!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Creating good at scale
                            </p>
                            <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.6; color: #bbbbbb;">
                                You received this email because you subscribed to The creators of Good newsletter
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  async sendCardAddedNotification(
    email: string,
    userName: string,
    cardBrand: string,
    last4: string,
    locale: 'ru' | 'en' = 'ru',
  ): Promise<void> {
    const htmlTemplate = this.getCardAddedTemplate(userName, cardBrand, last4, locale);

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: email,
      subject: locale === 'en' ? 'Card added - The creators of Good' : 'Карта добавлена - Творцы Добра',
      html: htmlTemplate,
    });
  }

  async sendCardRemovedNotification(
    email: string,
    userName: string,
    cardBrand: string,
    last4: string,
    locale: 'ru' | 'en' = 'ru',
  ): Promise<void> {
    const htmlTemplate = this.getCardRemovedTemplate(userName, cardBrand, last4, locale);

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: email,
      subject: locale === 'en' ? 'Card removed - The creators of Good' : 'Карта удалена - Творцы Добра',
      html: htmlTemplate,
    });
  }

  private getCardAddedTemplate(userName: string, cardBrand: string, last4: string, locale: 'ru' | 'en' = 'ru'): string {
    if (locale === 'en') {
      return this.getCardAddedTemplateEn(userName, cardBrand, last4);
    }
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Карта добавлена</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Карта успешно добавлена
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Здравствуйте, ${userName}!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Мы уведомляем вас, что в ваш аккаунт была добавлена новая платёжная карта:
                            </p>
                            
                            <!-- Card Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px; border: 1px solid #e8e8e8;">
                                <tr>
                                    <td>
                                        <div style="font-size: 18px; font-weight: 600; color: #000000; margin-bottom: 10px;">
                                            ${cardBrand} •••• ${last4}
                                        </div>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                            Теперь вы можете использовать эту карту для пожертвований
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                Если вы не добавляли эту карту, пожалуйста, немедленно свяжитесь с нашей службой поддержки.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getCardAddedTemplateEn(userName: string, cardBrand: string, last4: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Added</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Card Successfully Added
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hello, ${userName}!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                We're notifying you that a new payment card has been added to your account:
                            </p>
                            
                            <!-- Card Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px; border: 1px solid #e8e8e8;">
                                <tr>
                                    <td>
                                        <div style="font-size: 18px; font-weight: 600; color: #000000; margin-bottom: 10px;">
                                            ${cardBrand} •••• ${last4}
                                        </div>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                            You can now use this card for donations
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                If you did not add this card, please contact our support service immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Creating good at scale
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  async sendEmail(email: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });
      console.log(`Email sent to ${email}: ${subject}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, userName: string, locale: 'ru' | 'en' = 'ru'): Promise<void> {
    const htmlTemplate = this.getWelcomeTemplate(userName, locale);

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: locale === 'en' ? 'Welcome to The creators of Good! 🎉' : 'Добро пожаловать в Творцы Добра! 🎉',
        html: htmlTemplate,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendAchievementEmail(
    email: string,
    userName: string,
    achievementName: string,
    achievementDescription: string,
    achievementIcon: string,
    locale: 'ru' | 'en' = 'ru',
  ): Promise<void> {
    const htmlTemplate = this.getAchievementTemplate(
      userName,
      achievementName,
      achievementDescription,
      achievementIcon,
      locale,
    );

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: email,
      subject: locale === 'en' 
        ? `🎉 Congratulations! You earned an achievement: ${achievementName}`
        : `🎉 Поздравляем! Вы получили достижение: ${achievementName}`,
      html: htmlTemplate,
    });
  }

  private getWelcomeTemplate(userName: string, locale: 'ru' | 'en' = 'ru'): string {
    if (locale === 'en') {
      return this.getWelcomeTemplateEn(userName);
    }
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Добро пожаловать в Творцы Добра</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Celebration Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="font-size: 64px; line-height: 1;">🎉</div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                Добро пожаловать, ${userName}!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                Спасибо за регистрацию в Творцы Добра!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Теперь вы часть сообщества, которое создаёт добро в масштабе. Вместе мы поддерживаем проекты, которые меняют жизни людей и развивают общество.
                            </p>
                            
                            <!-- Features Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px;">
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">💝</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Поддерживайте проекты
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Выбирайте проекты, которые вам близки, и делайте пожертвования
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8; padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Получайте достижения
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Отслеживайте свой вклад и получайте награды за добрые дела
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Следите за результатами
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Видите, как ваша поддержка меняет жизни людей
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0 10px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                            Начать делать добро
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getWelcomeTemplateEn(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to The creators of Good</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Celebration Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="font-size: 64px; line-height: 1;">🎉</div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                Welcome, ${userName}!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                Thank you for registering with The creators of Good!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Now you're part of a community that creates good at scale. Together we support projects that change people's lives and develop society.
                            </p>
                            
                            <!-- Features Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px;">
                                <tr>
                                    <td>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">💝</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Support projects
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Choose projects that are close to you and make donations
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8; padding-bottom: 20px;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Earn achievements
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        Track your contribution and get rewards for good deeds
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 20px; border-top: 1px solid #e8e8e8;">
                                                    <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                                                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #000000;">
                                                        Track results
                                                    </h3>
                                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                                        See how your support changes people's lives
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 20px 0 10px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                            Start doing good
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Creating good at scale
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getAchievementTemplate(
    userName: string,
    achievementName: string,
    achievementDescription: string,
    achievementIcon: string,
    locale: 'ru' | 'en' = 'ru',
  ): string {
    if (locale === 'en') {
      return this.getAchievementTemplateEn(userName, achievementName, achievementDescription, achievementIcon);
    }
    // Маппинг иконок на эмодзи
    const iconMap: Record<string, string> = {
      heart: '❤️',
      star: '⭐',
      check: '✅',
      trophy: '🏆',
      fire: '🔥',
    };
    const iconEmoji = iconMap[achievementIcon] || '🏆';

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Достижение получено</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Achievement Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4); margin: 0 auto;">
                                <div style="font-size: 64px; line-height: 1;">${iconEmoji}</div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                🎉 Поздравляем, ${userName}!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                Вы получили новое достижение!
                            </p>
                            
                            <!-- Achievement Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); border-radius: 12px; padding: 30px; border: 2px solid #ffd700;">
                                <tr>
                                    <td style="text-align: center;">
                                        <h3 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #000000;">
                                            ${achievementName}
                                        </h3>
                                        ${achievementDescription ? `<p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">${achievementDescription}</p>` : ''}
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Продолжайте делать добрые дела и получайте новые достижения! 💛
                            </p>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 30px 0 10px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                            Посмотреть все достижения
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getCardRemovedTemplateEn(userName: string, cardBrand: string, last4: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Removed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Card Removed from Account
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hello, ${userName}!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                We're notifying you that a payment card has been removed from your account:
                            </p>
                            
                            <!-- Card Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px; border: 1px solid #e8e8e8;">
                                <tr>
                                    <td>
                                        <div style="font-size: 18px; font-weight: 600; color: #000000; margin-bottom: 10px;">
                                            ${cardBrand} •••• ${last4}
                                        </div>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                            This card will no longer be used for payments
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                If you did not remove this card, please contact our support service immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Creating good at scale
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getCardRemovedTemplate(userName: string, cardBrand: string, last4: string, locale: 'ru' | 'en' = 'ru'): string {
    if (locale === 'en') {
      return this.getCardRemovedTemplateEn(userName, cardBrand, last4);
    }
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Карта удалена</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #000000; letter-spacing: -0.5px;">
                                The creators of Good
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">
                                Карта удалена из аккаунта
                            </h2>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Здравствуйте, ${userName}!
                            </p>
                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                                Мы уведомляем вас, что из вашего аккаунта была удалена платёжная карта:
                            </p>
                            
                            <!-- Card Info Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fafafa; border-radius: 12px; padding: 30px; border: 1px solid #e8e8e8;">
                                <tr>
                                    <td>
                                        <div style="font-size: 18px; font-weight: 600; color: #000000; margin-bottom: 10px;">
                                            ${cardBrand} •••• ${last4}
                                        </div>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                            Эта карта больше не будет использоваться для платежей
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #999999;">
                                Если вы не удаляли эту карту, пожалуйста, немедленно свяжитесь с нашей службой поддержки.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                © ${new Date().getFullYear()} Творцы Добра. Все права защищены.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                                Создаём добро с масштабом
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  private getAchievementTemplateEn(
    userName: string,
    achievementName: string,
    achievementDescription: string,
    achievementIcon: string,
  ): string {
    // Маппинг иконок на эмодзи
    const iconMap: Record<string, string> = {
      heart: '❤️',
      star: '⭐',
      check: '✅',
      trophy: '🏆',
      fire: '🔥',
    };
    const iconEmoji = iconMap[achievementIcon] || '🏆';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Achievement Earned</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden;">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 2px; text-transform: uppercase;">
                                The creators of Good
                            </h1>
                            <div style="margin-top: 20px; width: 60px; height: 4px; background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3)); border-radius: 2px; margin-left: auto; margin-right: auto;"></div>
                        </td>
                    </tr>
                    
                    <!-- Achievement Icon -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px;">
                            <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4); margin: 0 auto;">
                                <div style="font-size: 64px; line-height: 1;">${iconEmoji}</div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #000000; text-align: center; line-height: 1.3;">
                                🎉 Congratulations, ${userName}!
                            </h2>
                            <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.7; color: #333333; text-align: center;">
                                You've earned a new achievement!
                            </p>
                            
                            <!-- Achievement Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); border-radius: 12px; padding: 30px; border: 2px solid #ffd700;">
                                <tr>
                                    <td style="text-align: center;">
                                        <h3 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #000000;">
                                            ${achievementName}
                                        </h3>
                                        ${achievementDescription ? `<p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">${achievementDescription}</p>` : ''}
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.7; color: #666666; text-align: center;">
                                Keep doing good deeds and earn new achievements! 💛
                            </p>
                            
                            <!-- CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 30px 0 10px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                            View all achievements
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Decorative Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent);"></div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #999999;">
                                © ${new Date().getFullYear()} The creators of Good. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #999999; font-style: italic;">
                                Creating good at scale
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }
}

