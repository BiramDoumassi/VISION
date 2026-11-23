import "reflect-metadata";
import { Module } from "@nestjs/common";
import { APP_GUARD, NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ApiController } from "./api.controller";
import { AuthGuard } from "./auth";
import { migrate } from "./db";

@Module({
  controllers: [ApiController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
class AppModule {}

async function bootstrap() {
  await migrate();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn", "log"] });
  app.useBodyParser("json", { limit: "25mb" });
  // L'interface est servie depuis une autre origine (export statique) : origines autorisées explicitement.
  const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:4310").split(",").map((s) => s.trim());
  app.enableCors({ origin: origins, allowedHeaders: ["authorization", "content-type", "x-dev-user", "x-dev-org", "x-dev-roles"], methods: ["GET", "POST", "PUT", "PATCH"] });
  app.setGlobalPrefix("api", { exclude: ["health"] });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`VISION API sur :${port} (auth ${process.env.AUTH_MODE ?? "keycloak"})`);
}
bootstrap().catch((e) => { console.error(e); process.exit(1); });
