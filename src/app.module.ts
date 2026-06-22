import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { ServiceTypesModule } from './service-types/service-types.module'
import { AddonsModule } from './addons/addons.module'
import { SubmissionsModule } from './submissions/submissions.module'
import { ContactModule } from './contact/contact.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ServiceTypesModule,
    AddonsModule,
    SubmissionsModule,
    ContactModule,
  ],
})
export class AppModule {}
