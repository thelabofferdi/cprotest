import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateClientDto,
  ) {
    return this.clientsService.create(userId, createDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.clientsService.findAll(userId);
  }

  @Get('credit')
  getCredit(@CurrentUser('id') userId: string) {
    return this.clientsService.getCredit(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateClientDto,
  ) {
    return this.clientsService.update(userId, id, updateDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.clientsService.remove(userId, id);
  }
}
