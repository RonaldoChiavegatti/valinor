declare module 'rxjs/src/internal/operators/withLatestFrom' {
  import { Observable } from 'rxjs';
  export function withLatestFrom<T, R>(...args: any[]): (source: Observable<T>) => Observable<R>;
}

declare module 'rxjs/src/internal/operators/zip' {
  import { Observable } from 'rxjs';
  export function zip<T, R>(...args: any[]): (source: Observable<T>) => Observable<R>;
}

declare module 'rxjs/src/internal/operators/zipAll' {
  import { Observable } from 'rxjs';
  export function zipAll<T>(): (source: Observable<Observable<T>>) => Observable<T[]>;
}

declare module 'rxjs/src/internal/operators/zipWith' {
  import { Observable } from 'rxjs';
  export function zipWith<T, R>(...args: any[]): (source: Observable<T>) => Observable<R>;
}

declare module 'rxjs/src/internal/testing/TestScheduler' {
  import { Observable } from 'rxjs';
  export class TestScheduler {
    constructor(assertDeepEqual: (actual: any, expected: any) => boolean | void);
    run<T>(callback: (helpers: RunHelpers) => T): T;
  }
  export interface RunHelpers {
    cold: typeof cold;
    hot: typeof hot;
    expectObservable: typeof expectObservable;
    expectSubscriptions: typeof expectSubscriptions;
  }
} 