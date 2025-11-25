import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, Between } from 'typeorm';
import { Project, ProjectStatus, ProjectCategory } from '../entities/project.entity';
import { CacheService } from '../common/cache/cache.service';

export interface ProjectFilters {
  category?: ProjectCategory;
  status?: ProjectStatus;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRaised?: number;
  maxRaised?: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export type ProjectSortBy = 
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'raised-asc'
  | 'raised-desc'
  | 'goal-asc'
  | 'goal-desc'
  | 'donors-asc'
  | 'donors-desc'
  | 'name-asc'
  | 'name-desc';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private readonly cacheService: CacheService,
  ) {}

  // Инициализация проектов (вызывается при старте приложения)
  async initializeProjects() {
    const projectsData = [
      {
        title: 'Операция для Миши',
        description: 'Срочная операция на сердце для ребенка с врожденным пороком сердца',
        category: ProjectCategory.HEALTHCARE,
        location: 'Москва',
        goal: 2500000,
        raised: 1200000,
        donors: 567,
        image: '/images/16.jpg',
        images: ['/images/q2.jpg', '/images/t.png'],
        isFeatured: true,
        isBestseller: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'сердце', 'операция'],
        age: '4-6 лет',
        disabilityType: 'Врожденный порок сердца',
        urgency: 'Экстренные случаи',
        metadata: {
          fullDescription: 'Нашему сыну Мише 5 лет требуется срочная операция на сердце. Врожденный порок сердца был обнаружен при рождении, и сейчас врачи говорят, что операция необходима в ближайшие месяцы. Без операции у ребенка могут развиться серьезные осложнения. Врачи дали надежду, но стоимость лечения очень высока. Мы обращаемся к вам за помощью, чтобы дать нашему ребенку шанс на здоровую жизнь. Каждое пожертвование приближает нас к цели.',
          name: 'Анна Петрова',
          daysLeft: 12,
        },
      },
      {
        title: 'Реабилитация для Саши с ДЦП',
        description: 'Комплексная реабилитация для ребенка с детским церебральным параличом',
        category: ProjectCategory.HEALTHCARE,
        location: 'Московская область',
        goal: 1800000,
        raised: 850000,
        donors: 423,
        image: '/images/17.jpg',
        images: ['/images/t.png', '/images/q.jpg'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'ДЦП', 'реабилитация'],
        age: '7-12 лет',
        disabilityType: 'ДЦП',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Саше 9 лет, у него детский церебральный паралич. Мальчик очень старается, делает большие успехи, но нужна регулярная профессиональная реабилитация. Родители не могут полностью оплатить все необходимые процедуры. Ваша поддержка поможет Саше улучшить двигательные функции, речь и адаптироваться к жизни. Каждое занятие приближает его к большей независимости.',
          name: 'Мария Иванова',
          daysLeft: 45,
        },
      },
      {
        title: 'Развитие для Лены с аутизмом',
        description: 'Специализированная коррекционная программа для девочки с расстройством аутистического спектра',
        category: ProjectCategory.HEALTHCARE,
        location: 'Санкт-Петербург',
        goal: 1200000,
        raised: 560000,
        donors: 289,
        image: '/images/11.jpg',
        images: ['/images/q.jpg', '/images/q2.jpg'],
        isFeatured: true,
        isNew: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'аутизм', 'развитие'],
        age: '0-3 года',
        disabilityType: 'Аутизм',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Леночке 3 года, у неё расстройство аутистического спектра. Девочка очень способная, но нужна ранняя коррекционная помощь специалистов. Работа с поведенческим аналитиком, сенсорная интеграция и занятия по развитию коммуникативных навыков помогут Лене лучше адаптироваться. Родители хотят дать дочери все возможности для развития, но стоимость терапии высока. Ваша поддержка изменит жизнь этой семьи.',
          name: 'Ольга Соколова',
          daysLeft: 60,
        },
      },
      {
        title: 'Обучение для Коли с синдромом Дауна',
        description: 'Инклюзивное образование и развивающие программы для ребенка с синдромом Дауна',
        category: ProjectCategory.EDUCATION,
        location: 'Центральный регион',
        goal: 800000,
        raised: 320000,
        donors: 156,
        image: '/images/18.jpg',
        images: ['/images/q2.jpg', '/images/t.png'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['образование', 'дети', 'синдром Дауна', 'инклюзия'],
        age: '13-17 лет',
        disabilityType: 'Синдром Дауна',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Коле 15 лет, у него синдром Дауна. Юноша очень общительный и талантливый, любит рисовать и заниматься спортом. Для его развития нужны специальные образовательные программы и участие в инклюзивных группах. Ваша поддержка поможет Коле получить качественное образование, развить таланты и подготовиться к самостоятельной жизни.',
          name: 'Татьяна Новикова',
          daysLeft: 90,
        },
      },
      {
        title: 'Лечение для Даши с онкологией',
        description: 'Химиотерапия и лучевая терапия для девочки с онкологическим заболеванием',
        category: ProjectCategory.HEALTHCARE,
        location: 'Сибирь',
        goal: 3500000,
        raised: 2100000,
        donors: 892,
        image: '/images/12.jpg',
        images: ['/images/t.png', '/images/q.jpg'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'онкология', 'лечение'],
        age: '7-12 лет',
        disabilityType: 'Онкологические заболевания',
        urgency: 'Экстренные случаи',
        metadata: {
          fullDescription: 'Даше 10 лет, у неё диагностировали онкологическое заболевание. Девочка борется, проходит курс химиотерапии. Врачи дают хорошие прогнозы, но лечение требует больших средств. Помимо основного лечения нужны дорогостоящие препараты и восстановительная терапия. Родители уже продали всё, что могли. Каждое пожертвование - это шанс для Даши на выздоровление и возвращение к нормальной жизни.',
          name: 'Елена Волкова',
          daysLeft: 25,
        },
      },
      {
        title: 'Поддержка для Вовы с нарушением зрения',
        description: 'Специализированное обучение и технические средства для незрячего подростка',
        category: ProjectCategory.EDUCATION,
        location: 'Северо-Западный регион',
        goal: 950000,
        raised: 380000,
        donors: 234,
        image: '/images/19.jpg',
        images: ['/images/q.jpg', '/images/q2.jpg'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['образование', 'дети', 'зрение', 'адаптация'],
        age: '13-17 лет',
        disabilityType: 'Нарушения зрения',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Вове 16 лет, он незрячий с рождения. Юноша очень талантливый и целеустремленный, мечтает получить высшее образование и стать программистом. Для его обучения нужны специальные технические средства, программы чтения с экрана и адаптивное оборудование. Ваша поддержка поможет Вове получить качественное образование и реализовать свои мечты, несмотря на ограничения.',
          name: 'Александр Белов',
          daysLeft: 75,
        },
      },
      {
        title: 'Терапия для Матвея с нарушением слуха',
        description: 'Слухопротезирование и занятия с сурдопедагогом для ребенка с нарушением слуха',
        category: ProjectCategory.HEALTHCARE,
        location: 'Ленинградская область',
        goal: 1500000,
        raised: 680000,
        donors: 312,
        image: '/images/15.jpg',
        images: ['/images/t.png', '/images/q2.jpg'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'слух', 'реабилитация'],
        age: '4-6 лет',
        disabilityType: 'Нарушения слуха',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Матвею 5 лет, у него двусторонняя тугоухость. Мальчик очень активный и любознательный, но из-за нарушения слуха возникают трудности с речью и общением. Врачи рекомендуют слухопротезирование и регулярные занятия с сурдопедагогом. Слуховые аппараты и специальная терапия помогут Матвею научиться говорить и полноценно общаться со сверстниками. Ваша поддержка даст мальчику возможность услышать мир и развиваться как обычный ребенок.',
          name: 'Светлана Кузнецова',
          daysLeft: 55,
        },
      },
      {
        title: 'Реабилитация для Артема с нарушением ОДА',
        description: 'Специальное оборудование и терапия для ребенка с нарушением опорно-двигательного аппарата',
        category: ProjectCategory.HEALTHCARE,
        location: 'Дальний Восток',
        goal: 2200000,
        raised: 950000,
        donors: 445,
        image: '/images/20.jpg',
        images: ['/images/q.jpg', '/images/t.png'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'ОДА', 'реабилитация'],
        age: '7-12 лет',
        disabilityType: 'Нарушения опорно-двигательного аппарата',
        urgency: 'Обычные',
        metadata: {
          fullDescription: 'Артему 10 лет, у него врожденное нарушение опорно-двигательного аппарата. Мальчик мечтает ходить самостоятельно и активно участвовать в жизни сверстников. Для его реабилитации нужны специальные ортопедические приспособления, вертикализаторы и регулярные занятия с физическим терапевтом. Современное оборудование и профессиональная помощь помогут Артему укрепить мышцы, улучшить координацию и стать более самостоятельным. Ваша поддержка даст мальчику надежду на более активную и полноценную жизнь.',
          name: 'Екатерина Морозова',
          daysLeft: 68,
        },
      },
      {
        title: 'Поддержка для Софии с редким заболеванием',
        description: 'Медикаментозное лечение и реабилитация для девочки с редким генетическим заболеванием',
        category: ProjectCategory.HEALTHCARE,
        location: 'Сибирь',
        goal: 2800000,
        raised: 1250000,
        donors: 623,
        image: '/images/13.jpg',
        images: ['/images/q2.jpg', '/images/q.jpg'],
        isFeatured: true,
        status: ProjectStatus.ACTIVE,
        tags: ['медицина', 'дети', 'редкое заболевание', 'лечение'],
        age: '0-3 года',
        disabilityType: 'Другие',
        urgency: 'Экстренные случаи',
        metadata: {
          fullDescription: 'Софии 2 года, у неё диагностировано редкое генетическое заболевание. Девочка требует постоянного медицинского наблюдения, дорогостоящих препаратов и специальной реабилитации. Без регулярного лечения заболевание будет прогрессировать, что может привести к серьезным осложнениям. Врачи дают надежду на улучшение состояния при условии своевременного и правильного лечения. Родители делают всё возможное, но стоимость терапии очень высока. Ваша поддержка поможет маленькой Софии получить необходимую медицинскую помощь и шанс на здоровое будущее.',
          name: 'Анна Смирнова',
          daysLeft: 18,
        },
      },
    ];

    // Получаем список названий новых проектов
    const newProjectTitles = new Set(projectsData.map(p => p.title));

    // Удаляем все проекты, которых нет в новом списке
    const allProjects = await this.projectRepository.find();
    for (const project of allProjects) {
      if (!newProjectTitles.has(project.title)) {
        await this.projectRepository.delete(project.id);
        this.logger.log(`Project "${project.title}" deleted (not in new list)`);
      }
    }

    // Создаем или обновляем проекты из нового списка
    for (const projectData of projectsData) {
      const existingProject = await this.projectRepository.findOne({
        where: { title: projectData.title },
      });

      // Вычисляем deadline на основе daysLeft из metadata (только при создании нового проекта)
      let deadline: Date | null = null;
      if (projectData.metadata?.daysLeft) {
        // Если проект существует и у него уже есть deadline, не меняем его
        // Иначе устанавливаем deadline на основе daysLeft из metadata
        if (!existingProject?.deadline) {
          deadline = new Date();
          deadline.setDate(deadline.getDate() + projectData.metadata.daysLeft);
        } else {
          deadline = existingProject.deadline;
        }
      } else if (existingProject?.deadline) {
        // Сохраняем существующий deadline, если он был установлен
        deadline = existingProject.deadline;
      }

      const projectToSave = {
        ...projectData,
        deadline,
      };

      if (!existingProject) {
        const project = this.projectRepository.create(projectToSave);
        await this.projectRepository.save(project);
        this.logger.log(`Project "${projectData.title}" created`);
      } else {
        // Обновляем существующий проект, но не меняем deadline если он уже установлен
        if (!existingProject.deadline && deadline) {
          existingProject.deadline = deadline;
        }
        Object.assign(existingProject, projectToSave, { 
          deadline: existingProject.deadline || deadline,
          // Не обновляем raised и donors при инициализации, они обновляются через транзакции
          raised: existingProject.raised,
          donors: existingProject.donors,
        });
        await this.projectRepository.save(existingProject);
        this.logger.log(`Project "${projectData.title}" updated`);
      }
    }
    
    // Очищаем кэш проектов после обновления
    await this.cacheService.deletePattern('projects:*');
    this.logger.log('Projects cache cleared');
  }

  // Вычисление оставшихся дней на основе deadline
  private calculateDaysLeft(deadline: Date | null, status: ProjectStatus): number | null {
    if (!deadline || status === ProjectStatus.COMPLETED) {
      return null;
    }

    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  // Обновление metadata проекта с вычисленным daysLeft
  private enrichProjectWithDaysLeft(project: Project): Project {
    const daysLeft = this.calculateDaysLeft(project.deadline, project.status);
    
    return {
      ...project,
      metadata: {
        ...project.metadata,
        daysLeft: daysLeft !== null ? daysLeft : project.metadata?.daysLeft,
      },
    };
  }

  // Получение всех проектов с фильтрацией и сортировкой
  async findAll(
    filters: ProjectFilters = {},
    sortBy: ProjectSortBy = 'newest',
    page: number = 1,
    limit: number = 20,
    locale: 'ru' | 'en' = 'ru',
  ): Promise<{ projects: Project[]; total: number; page: number; limit: number }> {
    // Создаем ключ кэша на основе параметров запроса
    const cacheKey = `projects:list:${JSON.stringify({ filters, sortBy, page, limit, locale })}`;
    
    // Используем кэш с TTL 5 минут для списка проектов
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.findAllFromDb(filters, sortBy, page, limit, locale);
      },
      300, // 5 минут
    );
  }

  // Внутренний метод для получения проектов из БД
  private async findAllFromDb(
    filters: ProjectFilters = {},
    sortBy: ProjectSortBy = 'newest',
    page: number = 1,
    limit: number = 20,
    locale: 'ru' | 'en' = 'ru',
  ): Promise<{ projects: Project[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');

    // Применяем фильтры
    if (filters.category) {
      queryBuilder.andWhere('project.category = :category', { category: filters.category });
    }

    if (filters.status) {
      queryBuilder.andWhere('project.status = :status', { status: filters.status });
    } else {
      // По умолчанию показываем только активные и завершенные (но не более дня назад)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      queryBuilder.andWhere(
        '(project.status = :activeStatus OR (project.status = :completedStatus AND (project.completedAt IS NULL OR project.completedAt >= :oneDayAgo)))',
        {
          activeStatus: ProjectStatus.ACTIVE,
          completedStatus: ProjectStatus.COMPLETED,
          oneDayAgo: oneDayAgo,
        }
      );
    }

    if (filters.colors && filters.colors.length > 0) {
      // Для PostgreSQL массивов используем оператор &&
      queryBuilder.andWhere('project.colors && ARRAY[:...colors]', { colors: filters.colors });
    }

    if (filters.sizes && filters.sizes.length > 0) {
      queryBuilder.andWhere('project.sizes && ARRAY[:...sizes]', { sizes: filters.sizes });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('project.tags && ARRAY[:...tags]', { tags: filters.tags });
    }

    if (filters.location) {
      queryBuilder.andWhere('project.location ILIKE :location', { location: `%${filters.location}%` });
    }

    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('project.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('project.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minRaised !== undefined) {
      queryBuilder.andWhere('project.raised >= :minRaised', { minRaised: filters.minRaised });
    }

    if (filters.maxRaised !== undefined) {
      queryBuilder.andWhere('project.raised <= :maxRaised', { maxRaised: filters.maxRaised });
    }

    if (filters.isBestseller !== undefined) {
      queryBuilder.andWhere('project.isBestseller = :isBestseller', { isBestseller: filters.isBestseller });
    }

    if (filters.isNew !== undefined) {
      queryBuilder.andWhere('project.isNew = :isNew', { isNew: filters.isNew });
    }

    if (filters.isFeatured !== undefined) {
      queryBuilder.andWhere('project.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Применяем сортировку
    switch (sortBy) {
      case 'newest':
        queryBuilder.orderBy('project.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('project.createdAt', 'ASC');
        break;
      case 'price-asc':
        queryBuilder.orderBy('project.price', 'ASC', 'NULLS LAST');
        break;
      case 'price-desc':
        queryBuilder.orderBy('project.price', 'DESC', 'NULLS LAST');
        break;
      case 'raised-asc':
        queryBuilder.orderBy('project.raised', 'ASC');
        break;
      case 'raised-desc':
        queryBuilder.orderBy('project.raised', 'DESC');
        break;
      case 'goal-asc':
        queryBuilder.orderBy('project.goal', 'ASC');
        break;
      case 'goal-desc':
        queryBuilder.orderBy('project.goal', 'DESC');
        break;
      case 'donors-asc':
        queryBuilder.orderBy('project.donors', 'ASC');
        break;
      case 'donors-desc':
        queryBuilder.orderBy('project.donors', 'DESC');
        break;
      case 'name-asc':
        queryBuilder.orderBy('project.title', 'ASC');
        break;
      case 'name-desc':
        queryBuilder.orderBy('project.title', 'DESC');
        break;
      default:
        queryBuilder.orderBy('project.createdAt', 'DESC');
    }

    // Подсчет общего количества
    const total = await queryBuilder.getCount();

    // Пагинация
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const projects = await queryBuilder.getMany();

    // Обогащаем проекты вычисленным daysLeft
    const enrichedProjects = projects.map(p => this.enrichProjectWithDaysLeft(p));

    return {
      projects: enrichedProjects,
      total,
      page,
      limit,
    };
  }

  // Получение одного проекта по ID
  async findOne(id: string, locale: 'ru' | 'en' = 'ru'): Promise<Project | null> {
    // Кэшируем отдельные проекты на 1 минуту
    const cacheKey = `project:${id}:${locale}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.findOneFromDb(id, locale);
      },
      60, // 1 минута
    );
  }

  // Внутренний метод для получения проекта из БД
  private async findOneFromDb(id: string, locale: 'ru' | 'en' = 'ru'): Promise<Project | null> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      return null;
    }
    // TODO: Загрузить переводы из ProjectTranslation если locale !== 'ru'
    // Пока возвращаем проект как есть, переводы будут добавлены позже
    // Обогащаем проект вычисленным daysLeft
    return this.enrichProjectWithDaysLeft(project);
  }

  // Получение уникальных значений для фильтров
  async getFilterOptions(): Promise<{
    categories: ProjectCategory[];
    colors: string[];
    sizes: string[];
    locations: string[];
    tags: string[];
    priceRange: { min: number; max: number };
    raisedRange: { min: number; max: number };
  }> {
    const projects = await this.projectRepository.find({
      where: { status: ProjectStatus.ACTIVE },
    });

    const categories = Array.from(new Set(projects.map(p => p.category)));
    const colors = Array.from(new Set(projects.flatMap(p => p.colors || [])));
    const sizes = Array.from(new Set(projects.flatMap(p => p.sizes || [])));
    const locations = Array.from(new Set(projects.map(p => p.location).filter(Boolean)));
    const tags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

    const prices = projects.map(p => Number(p.price || 0)).filter(p => p > 0);
    const raised = projects.map(p => Number(p.raised || 0)).filter(p => p > 0);

    return {
      categories: categories as ProjectCategory[],
      colors,
      sizes,
      locations,
      tags,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      },
      raisedRange: {
        min: raised.length > 0 ? Math.min(...raised) : 0,
        max: raised.length > 0 ? Math.max(...raised) : 0,
      },
    };
  }
}

