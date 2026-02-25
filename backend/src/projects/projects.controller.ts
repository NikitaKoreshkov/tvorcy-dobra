import { Controller, Get, Query, Param, UseGuards, Post, Headers, UseInterceptors } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ProjectsService, ProjectFilters, ProjectSortBy } from './projects.service';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('projects')
@UseInterceptors(CacheInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Получение всех проектов с фильтрацией и сортировкой
  @Get()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('colors') colors?: string,
    @Query('sizes') sizes?: string,
    @Query('tags') tags?: string,
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minRaised') minRaised?: string,
    @Query('maxRaised') maxRaised?: string,
    @Query('isBestseller') isBestseller?: string,
    @Query('isNew') isNew?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: ProjectSortBy,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: 'ru' | 'en',
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const filters: ProjectFilters = {};

    if (category) filters.category = category as any;
    if (status) filters.status = status as any;
    if (colors) filters.colors = colors.split(',');
    if (sizes) filters.sizes = sizes.split(',');
    if (tags) filters.tags = tags.split(',');
    if (location) filters.location = location;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (minRaised) filters.minRaised = parseFloat(minRaised);
    if (maxRaised) filters.maxRaised = parseFloat(maxRaised);
    if (isBestseller) filters.isBestseller = isBestseller === 'true';
    if (isNew) filters.isNew = isNew === 'true';
    if (isFeatured) filters.isFeatured = isFeatured === 'true';
    if (search) filters.search = search;

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    // Определяем locale из query параметра или заголовка
    const projectLocale = locale || (acceptLanguage?.startsWith('en') ? 'en' : 'ru') || 'ru';

    const result = await this.projectsService.findAll(
      filters,
      sortBy || 'newest',
      pageNum,
      limitNum,
      projectLocale,
    );

    return {
      success: true,
      ...result,
    };
  }

  // Получение одного проекта
  @Get(':id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: 'ru' | 'en',
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const projectLocale = locale || (acceptLanguage?.startsWith('en') ? 'en' : 'ru') || 'ru';
    const project = await this.projectsService.findOne(id, projectLocale);
    if (!project) {
      return {
        success: false,
        message: 'Project not found',
      };
    }
    return {
      success: true,
      project,
    };
  }

  // Получение опций для фильтров
  @Get('filters/options')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getFilterOptions() {
    const options = await this.projectsService.getFilterOptions();
    return {
      success: true,
      ...options,
    };
  }

  // Ручное обновление всех проектов (для админа)
  @Post('initialize')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async initializeProjects() {
    await this.projectsService.initializeProjects();
    return {
      success: true,
      message: 'Projects successfully updated',
    };
  }
}

