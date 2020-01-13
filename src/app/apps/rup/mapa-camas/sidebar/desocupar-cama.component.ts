import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { CamasService } from '../../internacion/services/camas.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { InternacionService } from '../../internacion/services/internacion.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { debounceTime, catchError } from 'rxjs/operators';


@Component({
    selector: 'app-desocupar-cama',
    templateUrl: 'desocupar-cama.component.html'
})
export class CamaDesocuparComponent implements OnInit {
    // Eventos
    @Input() fecha: Date;
    @Input() selectedCama: any;

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
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        public organizacionService: OrganizacionService,
        private internacionService: InternacionService,
        public prestacionesService: PrestacionesService,
        public CamaService: CamasService) {

        this.actualizaTipo
            .pipe(debounceTime(1000))
            .subscribe(val => {
                // this.operacionDesocuparCama();
            });

    }

    ngOnInit() {
        if (this.selectedCama) {
            this.opcionDesocupar = null;
            this.elegirDesocupar = true;
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                this.organizacion = organizacion;
                this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== this.selectedCama.unidadOrganizativa.conceptId) : [];
                if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 0) {
                    this.opcionesDesocupar.push({ id: 'pase', label: 'Cambiar de unidad organizativa' });
                }
                this.prestacionesService.getPasesInternacion(this.selectedCama.idInternacion).subscribe(lista => {
                    this.listaPasesCama = lista;
                });
            });
        } else {
            this.plex.info('danger', 'Parámetros incorrectos', 'Error');
        }
    }

    egresarPaciente() {
        this.accionDesocupar.emit({ cama: this.selectedCama, accion: 'egresarPaciente' });
    }
}
