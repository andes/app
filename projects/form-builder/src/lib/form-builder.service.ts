import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FormBuilderService {
    private initial = new BehaviorSubject<any>({});
    public initial$ = this.initial.asObservable();

    private model = new BehaviorSubject<any>({});

    public model$ = this.model.asObservable();

    constructor() { }

    set(model: any) {
        this.initial.next(model);
        this.model.next(model);
    }

    change(key: string, value: any) {
        const model = this.model.getValue();

        setter(model, key, value);

        this.model.next(model);
    }

    get(key: string) {
        return this.model$.pipe(
            map((model) => getter(model, key))
        );
    }

    getSync(key: string) {
        const mm = this.model.getValue();
        return getter(mm, key);
    }

    check(cond: { [key: string]: any }) {
        return this.model$.pipe(
            map((model) => {
                return Object.keys(cond).map(
                    key => getter(model, key) === cond[key]
                ).every(b => !!b);
            })
        );
    }
}

function getter(model, key: string) {
    function inside(_model, keys: string[]) {
        if (keys.length === 1) {
            return _model[keys[0]];
        } else {
            const _key = keys[0];
            const nextKeys = keys.slice(1);
            if (!_model[_key]) {
                return null;
            }

            return inside(_model[_key], nextKeys);
        }
    }
    const keys = key.split('.');
    return inside(model, keys);
}

function setter(model: any, key: string, value: any) {
    function inside(_model, keys: string[], value) {
        if (keys.length === 1) {
            _model[keys[0]] = value;
        } else {
            const _key = keys[0];
            const nextKeys = keys.slice(1);
            if (!_model[_key]) {
                _model[_key] = {};
            }

            inside(_model[_key], nextKeys, value);
        }
    }
    const keys = key.split('.');
    inside(model, keys, value);
}
