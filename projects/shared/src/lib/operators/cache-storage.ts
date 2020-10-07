import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { notNull } from './not-null';


export interface CacheStorageOptions {
    key: string;
    until?: Observable<any>;
    ttl?: number;
}
const _cacheSource: { [key: string]: BehaviorSubject<any> } = {};

export function cacheStorage(params: CacheStorageOptions | string) {
    const key = typeof params === 'string' ? params : params.key;
    const until$ = typeof params === 'object' ? params.until : undefined;
    const ttl = typeof params === 'object' ? params.ttl : undefined;

    return function <T>(source: Observable<T>): Observable<T> {
        if (until$) {
            until$.subscribe(() => {
                window.sessionStorage.removeItem(key);
                delete _cacheSource[key];
            });
        }
        return new Observable(subscriber => {
            let subscription: Subscription;
            let subscriptionSbuject: Subscription;

            const cacheValue = getItem(key, ttl);
            if (cacheValue) {
                subscriber.next(cacheValue);
                subscriber.complete();
            } else {
                if (!_cacheSource[key]) {
                    _cacheSource[key] = new BehaviorSubject(null);

                    subscription = source.subscribe({
                        next(value) {
                            setItem(key, value, ttl);
                            _cacheSource[key].next(value);
                        },
                        error(error) {
                            _cacheSource[key].error(error);
                        },
                        complete() {
                            _cacheSource[key].complete();
                        }
                    });
                }

                subscriptionSbuject = _cacheSource[key].pipe(
                    notNull()
                ).subscribe(subscriber);

            }
            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
                if (subscriptionSbuject) {
                    subscriptionSbuject.unsubscribe();
                }
            };
        });
    };
}

function getItem(key: string, ttl?: number) {
    if (ttl) {
        const _data = window.localStorage.getItem(key);
        if (_data) {
            const data = JSON.parse(_data);
            if (data.ttl >= Date.now()) {
                return data.value;
            }
        }
    } else {
        const value = window.sessionStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
    }
    return null;
}

function setItem(key: string, value: any, ttl: number) {
    if (ttl) {
        const data = {
            ttl: Date.now() + ttl * 60 * 1000,
            value: value
        };
        window.localStorage.setItem(key, JSON.stringify(data));
    } else {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    }
}
