import { distinctUntilChanged, map, scan, filter, publishReplay, refCount, tap } from 'rxjs/operators';
import { pipe, OperatorFunction, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { saveAs as saveAsFileSaver } from 'file-saver';
import { Slug } from 'ng2-slugify';
import * as moment_ from 'moment';
const moment = moment_;

export function notNull<T>() {
    return filter<T>(user => !!user);
}

export function onlyNull<T>() {
    return filter<T>(user => !user);
}

export function mergeObject() {
    return scan((acc, curr) => Object.assign({}, acc, curr), {});
}

export function asObject<T, R = any>(key, fn = null) {
    return map<T, R>(value => {
        fn = fn || ((t) => t);
        const obj = {};
        obj[key] = value ? fn(value) : null;
        return obj as R;
    });
}

const replacer = (key, value) => value === null ? undefined : value;
export function distincObject<T>() {
    return distinctUntilChanged<T>((a, b) => {
        return JSON.stringify(a, replacer) === JSON.stringify(b, replacer);
    });
}

export function cache<T>(): OperatorFunction<T, T> {
    return pipe(
        publishReplay(1),
        refCount()
    );
}

export type Extensiones = 'pdf' | 'csv';

function getHeaders(type: Extensiones) {
    if (type === 'pdf') {
        return { type: 'application/pdf' };
    } else if (type === 'csv') {
        return { type: 'text/csv' };
    }
}

export function saveAs(fileName: string, type: Extensiones, timestamp = true) {
    return tap((blobData: any) => {
        const slug = new Slug('default');
        const headers = getHeaders(type);
        if (blobData) {
            const blob = new Blob([blobData], headers);
            const timestampText = timestamp ? ` - ${moment().format('DD-MM-YYYY-hmmss')}` : '';
            const file = slug.slugify(`${fileName}${timestampText}`) + `.${type}`;
            saveAsFileSaver(blob, file);
        } else {
            window.print();
        }
    });
}

const _cacheSource: { [key: string]: BehaviorSubject<any> } = {};
export function cacheStorage(key: string, until$: Observable<any> = null) {
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
            const cacheValue = window.sessionStorage.getItem(key);
            if (cacheValue) {
                const _value: any = JSON.parse(cacheValue);
                subscriber.next(_value);
                subscriber.complete();
            } else {
                if (!_cacheSource[key]) {
                    _cacheSource[key] = new BehaviorSubject(null);

                    subscription = source.subscribe({
                        next(value) {
                            window.sessionStorage.setItem(key, JSON.stringify(value));
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

                subscriptionSbuject = _cacheSource[key].pipe(notNull()).subscribe(subscriber);

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
