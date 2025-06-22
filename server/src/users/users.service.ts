import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOne(fields: any): Promise<UserDocument | null> {
    return this.userModel.findOne(fields).exec();
  }

  async updateUserById(
    userId: ObjectId,
    user: CreateUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, user, { new: true });
  }
}
