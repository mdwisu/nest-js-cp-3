import { ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import cookieSession = require('cookie-session');

export const setupApp = async (app: any) => {
  app.use(cookieSession({ keys: ['r4nd0m5tr1n6'] }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
};
