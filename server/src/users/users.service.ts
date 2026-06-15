import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { APP_TIMEZONE } from '../common/app.constants';
import { getDatePartsInTimezone } from '../common/date.util';
import { User, UserDocument } from './user.schema';

/** Handles user lookup and profile mutations. */
@Injectable()
export class UsersService {
  public constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /** Finds a user by phone or creates a shell account for OTP login. */
  public async getOrCreateByPhone(phone: string): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ phone }).exec();
    if (existingUser) {
      return existingUser;
    }
    return this.userModel.create({ phone, groups: [] });
  }

  /** Finds an existing user by database id. */
  public async getById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User was not found.');
    }
    return user;
  }

  /** Completes or updates the public user profile. */
  public async updateProfile(userId: string, name: string, birthday: Date): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, { birthday, name }, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User was not found.');
    }
    return user;
  }

  /** Adds a group reference to the user if it does not exist. */
  public async addGroup(userId: string, groupId: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $addToSet: { groups: groupId } }).exec();
  }

  /** Removes a group reference from the user. */
  public async removeGroup(userId: string, groupId: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $pull: { groups: groupId } }).exec();
  }

  /** Lists users whose birthday matches the provided local date. */
  public async listUsersByBirthdayDate(date: Date): Promise<UserDocument[]> {
    const dateParts = getDatePartsInTimezone(date, APP_TIMEZONE);
    const users = await this.userModel.find({ birthday: { $exists: true } }).exec();
    return users.filter((user) => {
      if (!user.birthday) {
        return false;
      }
      const birthdayParts = getDatePartsInTimezone(user.birthday, APP_TIMEZONE);
      return birthdayParts.day === dateParts.day && birthdayParts.month === dateParts.month;
    });
  }
}
