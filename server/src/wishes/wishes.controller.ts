import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/authenticated-user.type';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWishDto } from './create-wish.dto';
import { WishResponse } from './wish-response.type';
import { WishesService } from './wishes.service';

/** Wish submission endpoints. */
@Controller('wishes')
@UseGuards(JwtAuthGuard)
export class WishesController {
  public constructor(private readonly wishesService: WishesService) {}

  /** Creates or updates a wish from the current user. */
  @Post()
  public async createWish(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateWishDto,
  ): Promise<WishResponse> {
    return this.wishesService.createWish(currentUser.id, dto);
  }

  /** Lists wishes for a birthday recipient in one group. */
  @Get('group/:groupId/recipient/:toUserId')
  public async listWishesForRecipient(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('groupId') groupId: string,
    @Param('toUserId') toUserId: string,
  ): Promise<WishResponse[]> {
    return this.wishesService.listWishesForRecipient(groupId, toUserId, currentUser.id);
  }
}
