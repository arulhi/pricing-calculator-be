import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import express from 'express'
import { Request, Response } from 'express'
import serverlessExpress from '@vendia/serverless-express'

function setupApp(app) {
  app.enableCors({ origin: '*', methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS', allowedHeaders: 'Content-Type,Authorization' })
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
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  setupApp(app)
  await app.listen(process.env.PORT || 3001)
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`)
}

bootstrap()

let cachedServer
export const handler = async (event, context, callback) => {
  if (!cachedServer) {
    const expressApp = express()
    expressApp.use('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }))
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
    setupApp(app)
    await app.init()
    cachedServer = serverlessExpress({ app: expressApp })
  }
  return cachedServer(event, context, callback)
}
