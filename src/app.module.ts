import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './module/user/user.module';
import { CustomSpaceModule } from './module/custom-space/custom-space.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env/.env.development.local'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Change to 'mysql' if using MySQL
      host: process.env.SQL_DB_HOST,
      port: parseInt(process.env.SQL_DB_PORT), // Change to 3306 for MySQL
      username: process.env.SQL_DB_USERNAME,
      password: process.env.SQL_DB_PASSWORD,
      database: 'custom_spaces',
      autoLoadEntities: true,
      synchronize: true, // Disable in production
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    UserModule,
    AuthModule,
    CustomSpaceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
