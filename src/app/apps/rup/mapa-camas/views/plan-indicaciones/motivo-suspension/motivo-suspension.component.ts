import { Component, Output, Input, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { RUPComponent } from 'src/app/modules/rup/components/core/rup.component';

@Component({
    selector: 'motivo-suspension',
    templateUrl: 'motivo-suspension.component.html'
})

export class MotivoSuspensionComponent extends RUPComponent implements OnInit, OnChanges {

    @Input() capa;
    @Input() tipo: 'rechazo' | 'suspension';
    @Input() key: any;
    @Input() motivo: any;
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<any>();

    rechazo$: Observable<any>;
    public nuevoMotivo = '';
    public editando = false;
    public rechazo = { key: null, nombre: null };
    public rechazoAnt;

    ngOnInit() {
        this.rechazo$ = this.constantesService.search({ source: 'plan-indicaciones:rechazo' });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.key) {
            this.key = '';
            this.rechazo = { key: null, nombre: null };
        } else {
            this.rechazo = { key: this.key, nombre: this.motivo };
        }
        this.nuevoMotivo = this.motivo;
        this.rechazoAnt = this.rechazo;
    }

    guardarSuspension() {
        if (this.tipo === 'rechazo') {
            if (this.rechazo.key === 'otro') {
                this.rechazo.nombre = this.nuevoMotivo;
            }
            this.guardar.emit(this.rechazo);
        } else {
            this.guardar.emit(this.nuevoMotivo);
        }
        this.editando = false;
        this.cancelarSuspension();
    }

    cancelarSuspension() {
        if (!this.editando || !this.rechazo?.key) {
            this.cancelar.emit(false);
        }
        if (this.rechazoAnt?.key === 'otro') {
            this.nuevoMotivo = this.rechazoAnt.nombre;
            this.motivo = this.rechazoAnt.key;

        } else {
            this.nuevoMotivo = null;
        }
        this.editando = false;
        this.rechazo = this.rechazoAnt;
    }

    editar() {
        if (this.motivo?.length && this.tipo !== 'rechazo') {
            this.nuevoMotivo = this.motivo;
        }
        this.editando = true;
    }

    puedeEditar() {
        return this.key !== '' && this.motivo && !this.editando && this.capa === 'farmaceutica';
    }

    motivoRequerido() {
        return (this.tipo !== 'rechazo' && (!this.motivo || this.editando)) || (this.tipo === 'rechazo' && this.rechazo?.key === 'otro');
    }

    puedeGuardar() {
        const suspension = this.tipo === 'suspension' && this.nuevoMotivo?.length >= 3;
        const rechazo = (this.tipo === 'rechazo' && this.rechazo?.key &&
            (this.rechazo?.key !== 'otro' || (this.rechazo?.key === 'otro' && this.nuevoMotivo?.length >= 3)));
        return suspension || rechazo;
    }

    onInputChange($event) {
        this.nuevoMotivo = null;
    }

}
