import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { APP_TIMEZONE } from '../common/app.constants';
import { getDatePartsInTimezone } from '../common/date.util';
import { GroupsService } from '../groups/groups.service';
import { CreateWishDto } from './create-wish.dto';
import { Wish, WishDocument } from './wish.schema';
import { WishResponse } from './wish-response.type';

/** Handles birthday wish submission and retrieval. */
@Injectable()
export class WishesService {
  public constructor(
    @InjectModel(Wish.name) private readonly wishModel: Model<WishDocument>,
    private readonly groupsService: GroupsService,
  ) {}

  /** Creates or updates the current user's wish for a recipient. */
  public async createWish(fromUserId: string, dto: CreateWishDto): Promise<WishResponse> {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('You cannot send a wish to yourself.');
    }
    const group = await this.groupsService.assertUserCanAccessGroup(dto.groupId, fromUserId);
    const hasRecipient = group.members.some((memberId) => memberId.toString() === dto.toUserId);
    if (!hasRecipient) {
      throw new BadRequestException('Recipient is not a member of this group.');
    }
    const birthdayYear = getDatePartsInTimezone(new Date(), APP_TIMEZONE).year;
    const fromUserObjectId = new Types.ObjectId(fromUserId);
    const groupObjectId = new Types.ObjectId(dto.groupId);
    const toUserObjectId = new Types.ObjectId(dto.toUserId);
    const existingWish = await this.wishModel
      .findOne({ birthdayYear, fromUserId: fromUserObjectId, groupId: groupObjectId, toUserId: toUserObjectId })
      .exec();
    if (existingWish) {
      existingWish.isAnonymous = dto.isAnonymous;
      existingWish.message = dto.message;
      existingWish.photoUrl = dto.photoUrl;
      const updatedWish = await existingWish.save();
      return this.mapWishResponse(updatedWish);
    }
    const wish = await this.wishModel.create({
      birthdayYear,
      fromUserId: fromUserObjectId,
      groupId: groupObjectId,
      isAnonymous: dto.isAnonymous,
      message: dto.message,
      photoUrl: dto.photoUrl,
      toUserId: toUserObjectId,
    });
    return this.mapWishResponse(wish);
  }

  /** Lists wishes for one recipient inside a group. */
  public async listWishesForRecipient(groupId: string, toUserId: string, requesterId: string): Promise<WishResponse[]> {
    await this.groupsService.assertUserCanAccessGroup(groupId, requesterId);
    const birthdayYear = getDatePartsInTimezone(new Date(), APP_TIMEZONE).year;
    const wishes = await this.wishModel
      .find({ birthdayYear, groupId: new Types.ObjectId(groupId), toUserId: new Types.ObjectId(toUserId) })
      .sort({ createdAt: 1 })
      .exec();
    return wishes.map((wish) => this.mapWishResponse(wish));
  }

  /** Lists raw wishes for page generation. */
  public async listRawWishesForBirthday(groupId: string, toUserId: string, birthdayYear: number): Promise<WishDocument[]> {
    return this.wishModel
      .find({ birthdayYear, groupId: new Types.ObjectId(groupId), toUserId: new Types.ObjectId(toUserId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  private mapWishResponse(wish: WishDocument): WishResponse {
    return {
      _id: wish._id.toString(),
      birthdayYear: wish.birthdayYear,
      fromUserId: wish.fromUserId.toString(),
      groupId: wish.groupId.toString(),
      isAnonymous: wish.isAnonymous,
      message: wish.message,
      photoUrl: wish.photoUrl,
      toUserId: wish.toUserId.toString(),
    };
  }
}
