import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Swagger Configuration ---
  const config = new DocumentBuilder()
    .setTitle('Custom Query API')
    .setDescription('An API demonstrating custom, OData-alike query decorators')
    .setVersion('1.0')
    .addTag('Users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI will be at /api

  await app.listen(3000);
}
bootstrap();
