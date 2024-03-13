import { Component, Output, Input, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { RUPComponent } from 'src/app/modules/rup/components/core/rup.component';

@Component({
    selector: 'motivo-suspension',
    templateUrl: 'motivo-suspension.component.html'
})

export class MotivoSuspensionComponent extends RUPComponent implements OnInit, OnChanges {

    @Input() tipo: 'rechazo' | 'suspension';
    @Input() key: any;
    @Input() motivo: any;
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<any>();
    rechazo$: Observable<any>;
    public nuevoMotivo = '';
    public editando = false;
    public rechazo = { key: null, nombre: null };

    ngOnInit() {
        this.rechazo$ = this.constantesService.search({ source: 'plan-indicaciones:rechazo' });
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('key:', this.key);
        if (!this.key) {
            this.key = '';
            this.rechazo = { key: null, nombre: null };
        } else {
            this.rechazo = { key: this.key, nombre: this.motivo };
        }
        this.nuevoMotivo = this.motivo;
    }

    guardarSuspension() {
        if (this.tipo === 'rechazo') {
            if (this.rechazo.key === 'otro') {
                this.rechazo.nombre = this.nuevoMotivo;
            }
            this.guardar.emit(this.rechazo);
        } else {
            this.guardar.emit(this.motivo);
        }
        this.editando = false;
    }

    cancelarSuspension() {
        if (!this.editando || !this.rechazo.key) {
            this.cancelar.emit(false);
        }
        this.editando = false;
        this.nuevoMotivo = null;
    }

    editar() {
        if (this.motivo?.length && this.tipo !== 'rechazo') {
            this.nuevoMotivo = this.motivo;
        }
        this.editando = true;
    }

    motivoRequerido() {
        return (this.tipo !== 'rechazo' && (!this.motivo || this.editando)) || (this.tipo === 'rechazo' && this.rechazo?.key === 'otro');
    }

    puedeGuardar() {
        return (this.tipo !== 'rechazo' && this.nuevoMotivo?.length >= 3) ||
            (this.tipo === 'rechazo' && (this.rechazo?.key && this.rechazo?.key !== 'otro' || this.rechazo?.key === 'otro' && this.nuevoMotivo?.length >= 3));
    }

    onInputChange($event) {
        if ($event.value.key !== 'otro') {
            this.nuevoMotivo = null;
        }
    }

}
