/**
 * Cachea el resultado de una request de forma automatica.
 * Se puede determinar la KEY de cache.
 */

import { cache } from '../operators';

export function Cache({ key }: { key: string | boolean }) {
    let _cache: any = {};
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const fn = descriptor.value as Function;
        descriptor.value = function (...args) {
            const objectKey = key ? (typeof key === 'string' ? args[0][key] : args[0]) : 'default';
            if (!_cache[objectKey]) {
                _cache[objectKey] = fn.apply(this, args).pipe(
                    cache()
                );
            }
            return _cache[objectKey];
        };
        return descriptor;
    };
}
