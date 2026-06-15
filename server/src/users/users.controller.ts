import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/authenticated-user.type';
import { UserDocument } from './user.schema';
import { UsersService } from './users.service';

/** Exposes endpoints for the authenticated user's profile. */
@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  /** Returns the currently signed-in user. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMe(@CurrentUser() currentUser: AuthenticatedUser): Promise<UserDocument> {
    return this.usersService.getById(currentUser.id);
  }
}
