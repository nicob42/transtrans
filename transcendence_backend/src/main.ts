import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { SocketIoAdapter } from './socket-io.adapter';
import { existsSync, readFileSync } from 'fs';
const path = require('path')


async function bootstrap() {
  dotenv.config(); // Ajoutez cette ligne ici

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());


  app.enableCors({
    origin: 'http://localhost:3000', // ou toute autre origine que votre front-end utilise
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // cette ligne permet aux cookies d'être inclus
  });

  app.use('/image/:imageName', (req,res)=> {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '..', 'images', imageName);

    if(existsSync(imagePath)){
      const image = readFileSync(imagePath);
      res.end(image)
    }else{
      res.status(404).json({message: 'image not found'});
    }
  })

  app.useWebSocketAdapter(new SocketIoAdapter(app, true));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  await app.listen(4000);
}

bootstrap();
