import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import serverlessExpress from '@vendia/serverless-express'
import { AppModule } from './app.module'
import express from 'express'
import cors from 'cors'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://spf.io',
  /\.vercel\.app$/,
]

let cachedServer

async function createApp() {
  const expressApp = express()

  expressApp.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      const allowed = ALLOWED_ORIGINS.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin),
      )
      cb(null, allowed)
    },
    credentials: true,
  }))

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  )

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

    app.enableCors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        const allowed = ALLOWED_ORIGINS.some((o) =>
          typeof o === 'string' ? o === origin : o.test(origin),
        )
        cb(null, allowed)
      },
      credentials: true,
    })

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
