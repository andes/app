import { filter } from 'rxjs/operators';

export function notNull<T>() {
    return filter<T>(user => !!user);
}
