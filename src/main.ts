import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cors from 'cors'
import { AppModule } from './app.module'
import { Request, Response } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }))

  app.use('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }))

  const config = new DocumentBuilder()
    .setTitle('spf.io Pricing Calculator API')
    .setDescription('Backend API for the spf.io Pricing Calculator')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )

  await app.listen(process.env.PORT || 3001)
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`)
}

bootstrap()
