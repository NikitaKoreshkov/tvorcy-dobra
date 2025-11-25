import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Обновляем lastActivityAt для авторизованных пользователей
    if (request.user && request.user.id) {
      const userId = request.user.id;
      // Обновляем асинхронно, не блокируя запрос
      this.userRepository
        .update({ id: userId }, { lastActivityAt: new Date() })
        .catch((err) => {
          // Игнорируем ошибки обновления активности
          console.error('Error updating user activity:', err);
        });
    }

    return next.handle();
  }
}

