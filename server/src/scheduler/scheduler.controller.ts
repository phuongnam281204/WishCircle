import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchedulerService } from './scheduler.service';

/** Manual scheduler triggers for development. */
@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  public constructor(private readonly schedulerService: SchedulerService) {}

  /** Runs the T-1 reminder job immediately. */
  @Post('reminders')
  public async sendTomorrowBirthdayReminders(): Promise<{ readonly sentCount: number }> {
    return this.schedulerService.sendTomorrowBirthdayReminders();
  }

  /** Runs the birthday page delivery job immediately. */
  @Post('deliveries')
  public async deliverTodayBirthdayPages(): Promise<{ readonly sentCount: number }> {
    return this.schedulerService.deliverTodayBirthdayPages();
  }
}
