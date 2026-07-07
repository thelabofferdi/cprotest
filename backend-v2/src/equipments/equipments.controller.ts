import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('equipments')
@UseGuards(JwtAuthGuard)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateEquipmentDto,
  ) {
    return this.equipmentsService.create(userId, createDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.equipmentsService.findAll(userId, isActive);
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.equipmentsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(userId, id, updateDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.equipmentsService.remove(userId, id);
  }
}
