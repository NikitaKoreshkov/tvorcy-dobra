import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Пользователь неактивен');
    }

    return { 
      id: user.id, 
      email: user.email,
      name: user.name,
      hasSeenTutorial: user.hasSeenTutorial,
      profileAvatar: user.profileAvatar || null,
      profileDescription: user.profileDescription || null,
      profileBackground: user.profileBackground || null,
      pageBackground: user.pageBackground || null,
      profilePhotos: user.profilePhotos || [],
      profileVideo: user.profileVideo || null,
    };
  }
}

