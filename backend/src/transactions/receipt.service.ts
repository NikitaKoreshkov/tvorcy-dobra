import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Генерация HTML квитанции
  async generateReceiptHTML(userId: string, transactionId: string): Promise<string> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
      relations: ['paymentMethod', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const amount = Number(transaction.amount) / 100; // Конвертируем из копеек
    const date = new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = new Date(transaction.createdAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Квитанция о пожертвовании</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #000;
            background: #fff;
            padding: 40px 20px;
            line-height: 1.6;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 2px solid #000;
            padding: 40px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header p {
            font-size: 14px;
            color: #666;
        }
        .receipt-info {
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #333;
        }
        .info-value {
            color: #000;
            text-align: right;
        }
        .amount-section {
            background: #f8f8f8;
            padding: 20px;
            margin: 30px 0;
            border: 1px solid #000;
            text-align: center;
        }
        .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .amount-value {
            font-size: 36px;
            font-weight: bold;
            color: #000;
        }
        .project-section {
            margin: 30px 0;
            padding: 20px;
            background: #fafafa;
            border-left: 4px solid #000;
        }
        .project-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .project-description {
            color: #666;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .legal-info {
            margin-top: 30px;
            padding: 20px;
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            font-size: 11px;
            color: #666;
            line-height: 1.8;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 0;
            }
            .receipt {
                border: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Творцы Добра</h1>
            <p>Благотворительная организация</p>
            <p style="margin-top: 10px; font-size: 16px; font-weight: bold;">КВИТАНЦИЯ О ПОЖЕРТВОВАНИИ</p>
        </div>

        <div class="receipt-info">
            <div class="info-row">
                <span class="info-label">Номер квитанции:</span>
                <span class="info-value">${transaction.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Дата и время:</span>
                <span class="info-value">${date} в ${time}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Тип платежа:</span>
                <span class="info-value">${transaction.type === 'recurring' ? 'Регулярное пожертвование' : 'Единовременное пожертвование'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value">${
                  transaction.status === 'completed'
                    ? 'Завершено'
                    : transaction.status === 'pending'
                    ? 'В обработке'
                    : transaction.status === 'failed'
                    ? 'Ошибка'
                    : 'Отменено'
                }</span>
            </div>
            ${transaction.paymentMethod ? `
            <div class="info-row">
                <span class="info-label">Способ оплаты:</span>
                <span class="info-value">${transaction.paymentMethod.brand} •••• ${transaction.paymentMethod.last4}</span>
            </div>
            ` : ''}
        </div>

        <div class="amount-section">
            <div class="amount-label">Сумма пожертвования</div>
            <div class="amount-value">${amount.toLocaleString('ru-RU')} ₽</div>
        </div>

        <div class="project-section">
            <div class="project-title">${transaction.projectName}</div>
            ${transaction.description ? `<div class="project-description">${transaction.description}</div>` : ''}
        </div>

        <div class="receipt-info">
            <div class="info-row">
                <span class="info-label">Жертвователь:</span>
                <span class="info-value">${user.name || user.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${user.email}</span>
            </div>
        </div>

        <div class="legal-info">
            <p><strong>Юридическая информация:</strong></p>
            <p>Настоящая квитанция подтверждает факт добровольного пожертвования средств в пользу благотворительной организации Творцы Добра.</p>
            <p>Пожертвование является безвозмездной передачей денежных средств и не подлежит возврату, за исключением случаев, предусмотренных законодательством Российской Федерации.</p>
            <p>Все средства используются исключительно в целях реализации благотворительных программ и проектов организации.</p>
            <p style="margin-top: 15px;"><strong>Благодарим вас за вашу поддержку!</strong></p>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <p>Жертвователь</p>
                <p style="margin-top: 40px;">_________________</p>
            </div>
            <div class="signature-box">
                <p>Представитель организации</p>
                <p style="margin-top: 40px;">_________________</p>
            </div>
        </div>

        <div class="footer">
            <p>Творцы Добра - Создаём добро с масштабом</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Творцы Добра. Все права защищены.</p>
            <p style="margin-top: 5px; font-size: 10px;">Эта квитанция является официальным документом и может быть использована для налоговых целей.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

