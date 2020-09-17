import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export function Observe(params: any = {}) {
    const { initial, exposeAs, debounce, distinc } = params;
    return function prop(target, name: string) {
        const BehaviorName = `${name}BS`;
        const observeName = exposeAs || `${name}$`;

        function create() {
            target[BehaviorName] = new BehaviorSubject(initial);
            target[observeName] = target[BehaviorName].asObservable();

            const pipes = [];
            if (debounce) {
                pipes.push(debounceTime(debounce));
            }

            if (distinc) {
                const callback = typeof distinc === 'function' ? distinc : null;
                pipes.push(distinctUntilChanged(callback));
            }

            if (pipes.length > 0) {
                target[observeName] = target[observeName].pipe(...pipes);
            }
        }

        const ngOnInit = target.constructor.prototype.ngOnInit;

        target.constructor.prototype.ngOnInit = function () {
            create();
            if (ngOnInit) {
                ngOnInit.apply(this);
            }
        };

        Object.defineProperty(target, name, {
            get: function () {
                return this[BehaviorName].getValue();
            },
            set: function (value) {
                this[BehaviorName].next(value);
            },
            enumerable: true,
            configurable: true
        });
    };

}
