import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class SerializeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // run something before a request is handled
    console.log('I am running before the handler', context);
    return next.handle().pipe(
      map((data: any) => {
        console.log('I am running before the response is sent out', data);
      }),
    );
  }
}
