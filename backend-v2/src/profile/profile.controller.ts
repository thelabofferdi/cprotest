import { Controller, Get, Post, Body, Put, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateProfileDto,
  ) {
    return this.profileService.create(userId, createDto);
  }

  @Get()
  findOne(@CurrentUser('id') userId: string) {
    return this.profileService.findOne(userId);
  }

  @Put()
  update(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.profileService.update(userId, updateDto);
  }

  @Put('upsert')
  upsert(
    @CurrentUser('id') userId: string,
    @Body() data: CreateProfileDto,
  ) {
    return this.profileService.upsert(userId, data);
  }
}
