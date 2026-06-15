import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { APP_TIMEZONE } from '../common/app.constants';
import { getDatePartsInTimezone } from '../common/date.util';
import { AuthenticatedUser } from '../auth/authenticated-user.type';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BirthdayPageResponse } from './birthday-page-response.type';
import { BirthdayPagesService } from './birthday-pages.service';
import { GenerateBirthdayPageDto } from './generate-birthday-page.dto';

/** Birthday page endpoints. */
@Controller('birthday-pages')
export class BirthdayPagesController {
  public constructor(private readonly birthdayPagesService: BirthdayPagesService) {}

  /** Manually generates a birthday page for local MVP workflows. */
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  public async generateBirthdayPage(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: GenerateBirthdayPageDto,
  ): Promise<BirthdayPageResponse> {
    const currentYear = getDatePartsInTimezone(new Date(), APP_TIMEZONE).year;
    const birthdayYear = dto.birthdayYear ? Number(dto.birthdayYear) : currentYear;
    return this.birthdayPagesService.generateBirthdayPage(dto.groupId, dto.toUserId, birthdayYear, currentUser.id);
  }

  /** Returns a public birthday page by token. */
  @Get(':token')
  public async getPublicPage(@Param('token') token: string): Promise<BirthdayPageResponse> {
    return this.birthdayPagesService.getPublicPage(token);
  }
}
