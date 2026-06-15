import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import { BIRTHDAY_PAGE_TTL_DAYS, TOKEN_BYTE_LENGTH } from '../common/app.constants';
import { addDays } from '../common/date.util';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { WishDocument } from '../wishes/wish.schema';
import { WishesService } from '../wishes/wishes.service';
import { BirthdayPage, BirthdayPageDocument } from './birthday-page.schema';
import { BirthdayPageResponse } from './birthday-page-response.type';
import { PublicWish } from './public-wish.type';

/** Generates and serves public birthday pages. */
@Injectable()
export class BirthdayPagesService {
  public constructor(
    @InjectModel(BirthdayPage.name) private readonly birthdayPageModel: Model<BirthdayPageDocument>,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  /** Generates a page for a recipient and group, preserving the page token if it exists. */
  public async generateBirthdayPage(
    groupId: string,
    toUserId: string,
    birthdayYear: number,
    requesterId?: string,
  ): Promise<BirthdayPageResponse> {
    if (requesterId) {
      await this.groupsService.assertUserCanAccessGroup(groupId, requesterId);
    }
    const groupObjectId = new Types.ObjectId(groupId);
    const toUserObjectId = new Types.ObjectId(toUserId);
    const wishes = await this.wishesService.listRawWishesForBirthday(groupId, toUserId, birthdayYear);
    const existingPage = await this.birthdayPageModel.findOne({ birthdayYear, groupId: groupObjectId, toUserId: toUserObjectId }).exec();
    const expiresAt = addDays(new Date(), BIRTHDAY_PAGE_TTL_DAYS);
    if (existingPage) {
      existingPage.expiresAt = expiresAt;
      existingPage.wishes = wishes.map((wish) => wish._id);
      await existingPage.save();
      return this.mapPageResponse(existingPage, wishes);
    }
    const page = await this.birthdayPageModel.create({
      birthdayYear,
      expiresAt,
      groupId: groupObjectId,
      toUserId: toUserObjectId,
      token: this.createToken(),
      wishes: wishes.map((wish) => wish._id),
    });
    return this.mapPageResponse(page, wishes);
  }

  /** Returns a public page by token and increments view count. */
  public async getPublicPage(token: string): Promise<BirthdayPageResponse> {
    const page = await this.birthdayPageModel.findOne({ token }).exec();
    if (!page) {
      throw new NotFoundException('Birthday page was not found.');
    }
    if (page.expiresAt.getTime() < Date.now()) {
      throw new GoneException('Birthday page has expired.');
    }
    page.viewCount += 1;
    await page.save();
    const wishes = await this.wishesService.listRawWishesForBirthday(
      page.groupId.toString(),
      page.toUserId.toString(),
      page.birthdayYear,
    );
    return this.mapPageResponse(page, wishes);
  }

  private createToken(): string {
    return randomBytes(TOKEN_BYTE_LENGTH).toString('hex');
  }

  private async mapPageResponse(page: BirthdayPageDocument, wishes: WishDocument[]): Promise<BirthdayPageResponse> {
    const group = await this.groupsService.getRawGroupById(page.groupId.toString());
    const recipient = await this.usersService.getById(page.toUserId.toString());
    const publicWishes = await Promise.all(wishes.map((wish) => this.mapPublicWish(wish)));
    return {
      _id: page._id.toString(),
      birthdayYear: page.birthdayYear,
      expiresAt: page.expiresAt,
      groupName: group.name,
      recipientName: recipient.name ?? recipient.phone,
      token: page.token,
      viewCount: page.viewCount,
      wishes: publicWishes,
    };
  }

  private async mapPublicWish(wish: WishDocument): Promise<PublicWish> {
    const sender = await this.usersService.getById(wish.fromUserId.toString());
    return {
      _id: wish._id.toString(),
      fromName: wish.isAnonymous ? 'Ẩn danh' : sender.name ?? sender.phone,
      isAnonymous: wish.isAnonymous,
      message: wish.message,
      photoUrl: wish.photoUrl,
    };
  }
}
