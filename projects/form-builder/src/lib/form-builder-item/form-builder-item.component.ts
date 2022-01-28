import { Server } from '@andes/shared';
import { Component, HostBinding, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormBuilderService } from '../form-builder.service';
import { IFormInput, IFormTemplateItem } from '../interfaces';

@Component({
    selector: 'lib-form-builder-item',
    templateUrl: './form-builder-item.component.html'
})
export class FormBuilderItemComponent implements OnInit {

    @Input() elemento: IFormTemplateItem;

    @Input() readonly = false;

    @ViewChild('form', { static: false, read: NgForm }) formulario: NgForm;

    @ViewChildren(FormBuilderItemComponent) items: QueryList<FormBuilderItemComponent>;

    @HostBinding('class.d-none') hide = false;

    public _valor: any;

    public condition$: Observable<boolean>;
    public required$: Observable<boolean>;
    public items$: Observable<any[]>;
    private lastCallSubscription: Subscription = null;

    constructor(
        private formService: FormBuilderService,
        private server: Server
    ) { }

    ngOnInit(): void {
        if (this.elemento.cond) {
            this.condition$ = this.formService.check(this.elemento.cond).pipe(
                tap(cond => this.hide = !cond)
            );
        } else {
            this.condition$ = of(true);
        }

        const _required = (this.elemento as any).required;
        if ( _required !== null && _required !== undefined ) {
            if (typeof _required === 'boolean') {
                this.required$ = of(_required);
            } else {
                this.required$ = this.formService.check(_required);
            }
        } else {
            this.required$ = of(false);
        }

        if (this.elemento.type === 'radio') {
            const items = this.elemento.items;
            if (Array.isArray(items)) {
                this.items$ = of(items);
            } else {
                this.items$ = this.makeRequest(this.elemento.items);
            }
        }

        this.formService.initial$.subscribe(() => {
            if ((this.elemento as any).key) {
                this.formService.get((this.elemento as any).key).subscribe(v => {
                    this._valor = v;
                });
            }
        });



    }

    onInputChange($event) {
        this.formService.change((this.elemento as IFormInput).key, $event.value);
    }

    onSelectRequest(elemento, $event) {
        const inputText: string = $event.query;

        if (inputText && inputText.length > 2) {
            if (this.lastCallSubscription) {
                this.lastCallSubscription.unsubscribe();
            }

            const params = { ...elemento.request.params };
            Object.keys(params).forEach((key) => {
                const value: string = params[key];
                if (value.startsWith('$')) {
                    params[key] = this.formService.getSync(value.slice(1));
                }
            });

            const request = this.server.get(
                elemento.request.url,
                {
                    params: {
                        [elemento.request.searchKey]: inputText,
                        ...params
                    }
                }
            );
            this.lastCallSubscription = request.subscribe(result => {
                $event.callback(result);
            });

        } else {
            $event.callback(this._valor ? [this._valor] : []);
        }
    }

    isValid() {
        // Para marcar un formulario como tocado!
        if (this.formulario) {
            for (const key in this.formulario.controls) {
                const frm = this.formulario.controls[key];
                frm.markAsTouched();
                if (frm.validator) {
                    frm.validator({ value: frm.value } as any);
                }
            }
        }

        const b = this.items.reduce((flag, current) => flag && current.isValid(), true);
        if (this.formulario) {
            return b && this.formulario.valid;
        }
        return b;
    }


    makeRequest(requestData) {
        const params = { ...requestData.params };
        Object.keys(params).forEach((key) => {
            const value: string = params[key];
            if (value.startsWith('$')) {
                params[key] = this.formService.getSync(value.slice(1));
            }
        });

        const request = this.server.get(
            requestData.url,
            {
                params: {
                    ...params
                }
            }
        );
        return request;
    }
}
