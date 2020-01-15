import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { CamasService } from '../../internacion/services/camas.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';


@Component({
    selector: 'app-desocupar-cama',
    templateUrl: 'desocupar-cama.component.html'
})
export class CamaDesocuparComponent implements OnInit {
    // Eventos
    @Input() fecha: Date;
    @Input() selectedCama: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionDesocupar: EventEmitter<any> = new EventEmitter<any>();

    // Propiedades públicas
    public organizacion: any;
    public opcionDesocupar = null;
    public elegirDesocupar = true;
    public opcionesDesocupar = [
        { id: 'movimiento', label: 'Cambiar de cama' },
        { id: 'egreso', label: 'Egresar al paciente' }];

    public listaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public PaseAunidadOrganizativa: any;
    public camaSeleccionPase;
    public actualizaTipo = new Subject();
    public listaPasesCama = [];


    // Constructor
    constructor(
        public organizacionService: OrganizacionService,
        public prestacionesService: PrestacionesService,
        public CamaService: CamasService
    ) { }

    ngOnInit() {

    }

    cancelar() {
        this.cancel.emit();
    }

    egresarPaciente() {
        this.accionDesocupar.emit({ cama: this.selectedCama, accion: 'egresarPaciente' });
    }
}
