import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from './pipes/validation.pipe';
import * as cookieParser from 'cookie-parser';
import {Transport} from '@nestjs/microservices'

async function start() 
{
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({ origin: process.env.API_URL, credentials: true });
    app.use(cookieParser());

    await app.listen(PORT, () =>
        console.log(`Server started on port = ${PORT}`)
    );
}

start();
