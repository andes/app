import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'rup-texto-simple',
    templateUrl: 'textoSimple.html'
})
@RupElement('TextoSimpleComponent')
export class TextoSimpleComponent extends RUPComponent implements OnInit {
    public esRequerido: boolean;

    ngOnInit() {
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro)
                .pipe(
                    takeUntil(this.onDestroy$)
                )
                .subscribe((data) => {
                    if (this.registro.valor !== data.valor) {
                        this.registro.valor = data.valor;
                        this.emitChange(false);
                    }
                });

            this.addFact('value', this.registro.valor);

            this.onRule('alert')
                .pipe(
                    takeUntil(this.onDestroy$)
                )
                .subscribe(evento => {
                    const { params } = evento;
                    this.mensaje = {
                        texto: params.message,
                        type: params.type
                    };
                });
        }
        this.esRequerido = this.params?.required ?? false;
    }

    onKeydown(event: KeyboardEvent) {
        const key = event.key;

        const controlKeys = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'
        ];

        if (controlKeys.includes(key) || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (!this.params) {
            return;
        }

        const accept = this.params.acceptType?.id || this.params.acceptType;
        if (!accept) {
            return;
        }

        let regex: RegExp;
        let soloTexto: string;
        switch (accept) {
            case 'letters':
                regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/;
                soloTexto = 'letras';
                break;
            case 'numbers':
                regex = /^[0-9]$/;
                soloTexto = 'números';
                break;
            case 'alphanumeric':
                regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9]$/;
                soloTexto = 'letras y números';
                break;
        }

        if (regex && !regex.test(key)) {
            event.preventDefault();
            this.mensaje = { texto: `Solo se permiten ${soloTexto}`, type: 'danger' };
            return;
        }

        if (this.params.maxLength && this.registro.valor && String(this.registro.valor).length >= this.params.maxLength) {
            event.preventDefault();
            this.mensaje = { texto: `Máximo ${this.params.maxLength} caracteres`, type: 'danger' };
            return;
        }

        this.mensaje = {};
    }

    onPaste(event: ClipboardEvent) {
        if (!this.params) {
            return;
        }
        event.preventDefault();
        const pasted = event.clipboardData?.getData('text') || '';
        const currentVal = this.registro.valor ? String(this.registro.valor) : '';

        const accept = this.params.acceptType?.id || this.params.acceptType;
        let regex: RegExp;
        switch (accept) {
            case 'letters':
                regex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g;
                break;
            case 'numbers':
                regex = /[^0-9]/g;
                break;
            case 'alphanumeric':
                regex = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9]/g;
                break;
            default:
                regex = null;
        }
        let cleaned = regex ? pasted.replace(regex, '') : pasted;

        if (this.params.maxLength) {
            const remaining = this.params.maxLength - currentVal.length;
            if (remaining <= 0) {
                this.mensaje = { texto: `Máximo ${this.params.maxLength} caracteres`, type: 'danger' };
                return;
            }
            cleaned = cleaned.slice(0, remaining);
        }

        this.registro.valor = currentVal + cleaned;
        this.onChange();
    }

    onChange() {
        const valor = this.registro.valor;
        const strValor = valor ? String(valor) : '';

        if (this.params?.minLength && strValor.length > 0 && strValor.length < this.params.minLength) {
            this.mensaje = { texto: `Mínimo ${this.params.minLength} caracteres`, type: 'danger' };
        } else if (this.params?.maxLength && strValor.length > this.params.maxLength) {
            this.registro.valor = strValor.slice(0, this.params.maxLength);
            this.mensaje = { texto: `Máximo ${this.params.maxLength} caracteres`, type: 'danger' };
        } else {
            this.mensaje = {};
        }

        this.emitChange();
        this.addFact('value', this.registro.valor);
    }
}
