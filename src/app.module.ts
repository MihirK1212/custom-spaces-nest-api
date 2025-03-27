import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Change to 'mysql' if using MySQL
      host: 'localhost',
      port: 5432, // Change to 3306 for MySQL
      username: 'postgres',
      password: 'Abmikaka2311*POSTGRES*',
      database: 'custom_spaces',
      autoLoadEntities: true,
      synchronize: true, // Disable in production
    }),
    MongooseModule.forRoot('mongodb://localhost/custom-spaces'),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
