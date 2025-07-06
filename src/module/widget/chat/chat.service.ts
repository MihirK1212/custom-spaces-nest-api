import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../common/entity/widget/chat/message.entity';
import { CreateMessageDto } from '../../../common/dto/widget/chat/create-message.dto';
import { PaginationDto } from '../../../common/dto/widget/chat/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  // Save a new message to the database
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  // Get messages for a widget with pagination
  async getMessages(widgetId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { widgetId },
      order: { createdAt: 'DESC' }, // Newest messages first
      take: limit,
      skip,
    });

    return {
      data: messages.reverse(), // Reverse to show oldest first in the current chunk
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}