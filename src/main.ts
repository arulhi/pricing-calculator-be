import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import serverlessExpress from '@vendia/serverless-express'
import { AppModule } from './app.module'
import express from 'express'
import { Request, Response, NextFunction } from 'express'

function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
}

let cachedServer

async function createApp() {
  const expressApp = express()
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  )

  app.use(corsMiddleware)

  const config = new DocumentBuilder()
    .setTitle('spf.io Pricing Calculator API')
    .setDescription('Backend API for the spf.io Pricing Calculator')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.init()
  return expressApp
}

export const handler = async (event, context, callback) => {
  if (!cachedServer) {
    const app = await createApp()
    cachedServer = serverlessExpress({ app })
  }
  return cachedServer(event, context, callback)
}

if (process.env.NODE_ENV !== 'production') {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.use(corsMiddleware)

    const config = new DocumentBuilder()
      .setTitle('spf.io Pricing Calculator API')
      .setDescription('Backend API for the spf.io Pricing Calculator')
      .setVersion('1.0')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.listen(process.env.PORT || 3001)
    console.log(`Server running on http://localhost:${process.env.PORT || 3001}`)
  }

  bootstrap()
}
