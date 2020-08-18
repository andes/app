import { Directive, AfterViewInit, Input, OnDestroy, Injectable, Optional, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { OuterSubscriber } from 'rxjs/internal-compatibility';


@Injectable()
export class AuthContext {
    usuario: { id: string };
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: 'form[autosave]'
})
export class FormAutoSaveDirective implements AfterViewInit, OnDestroy {
    @Input() autosave: string;
    @Input() autosaveType: 'session' | 'user' = 'user';
    @Output() restore = new EventEmitter<any>();

    private subscription: Subscription;

    constructor(
        private form: NgForm,
        @Optional() private authContext: AuthContext
    ) {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngAfterViewInit() {
        // El setTimeout es necesario
        // There are no form controls registered with this group yet.  If you're using ngModel,
        // you may want to check next tick (e.g. use setTimeout).
        setTimeout(() => {
            this.loadValues();
            this.updateStorge();
        }, 0);
    }

    private getKey() {
        if (this.authContext && this.autosaveType === 'user') {
            const id = this.authContext.usuario.id;
            return `${id}-${this.autosave}`;
        } else {
            return this.autosave;
        }
    }

    private getStorage(): Storage {
        if (this.autosaveType === 'user') {
            return window.localStorage;
        } else {
            return window.sessionStorage;
        }
    }


    private updateStorge() {
        const KEY = this.getKey();
        this.subscription = this.form.valueChanges.pipe(
            debounceTime(1000)
        ).subscribe((e) => {
            const storage = this.getStorage();
            storage.setItem(KEY, JSON.stringify(e));
        });
    }

    private loadValues() {
        const KEY = this.getKey();
        const storage = this.getStorage();
        const previousValues = JSON.parse(storage.getItem(KEY));

        try {
            const values = {};
            for (const key in this.form.controls) {
                if (previousValues[key]) {
                    values[key] = previousValues[key];
                } else {
                    values[key] = null;
                }
            }
            this.form.setValue(values);
            this.restore.emit();
        } catch (error) {
            // Esto significa que cambio la estructura del formulario
            // la anterior no matchea con la actual, así que limpiamos los datos guardados
            storage.removeItem(KEY);
        }

    }
}
