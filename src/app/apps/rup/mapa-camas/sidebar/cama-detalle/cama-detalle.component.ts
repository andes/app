import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ElementosRUPService } from '../../../../../modules/rup/services/elementosRUP.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { map, switchMap, pluck, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IMAQEstado, IMAQRelacion } from '../../interfaces/IMaquinaEstados';
import { Auth } from '@andes/auth';
import { notNull } from '@andes/shared';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estadoCama$: Observable<IMAQEstado>;
    public relaciones$: Observable<IMAQRelacion[]>;
    public puedeDesocupar$: Observable<any>;

    public accionesEstado$: Observable<any>;
    public paciente$: Observable<any>;

    // Eventos
    @Input() fecha: Date;
    @Input() camas: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public cama: ISnapshot;
    public prestacion: IPrestacion;
    public estadoCama;
    public genero;
    public censable;
    public paciente;
    public edadPaciente;
    public relacionesPosibles;
    public especialidades;
    public validadoColor;
    public titleColor;
    public tabIndex = 0;
    public editar = false;
    public permisoIngreso = false;
    canEdit = this.auth.check('internacion:cama:edit');
    canMovimientos = this.auth.check('internacion:movimientos');
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    public nota: String;
    public editNota = false;

    constructor(
        private auth: Auth,
        public plex: Plex,
        private router: Router,
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.permisoIngreso = this.auth.check('internacion:ingreso');
        this.cama$ = this.mapaCamasService.selectedCama;
        this.paciente$ = this.cama$.pipe(
            filter(cama => !!cama.paciente),
            switchMap(cama => {
                return this.mapaCamasService.getPaciente(cama.paciente);
            })
        );

        this.estadoCama$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getEstadoCama(cama)));
        this.relaciones$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getRelacionesPosibles(cama)));

        this.accionesEstado$ = this.estadoCama$.pipe(
            notNull(),
            pluck('acciones'),
            map(acciones => acciones.filter(acc => acc.tipo === 'nuevo-registro'))
        );
    }

    sector(cama: ISnapshot) {
        return cama.sectores[cama.sectores.length - 1].nombre;
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarTab(index) {
        if (!this.editNota) {
            this.mapaCamasService.resetView();
            this.tabIndex = index;
        }
    }

    goTo(cama) {
        this.router.navigate([`/internacion/cama/${cama.idCama}`]);
    }

    accion(relacion) {
        this.accionCama.emit(relacion);
    }

    onEdit(editar: boolean) {
        this.editar = editar;
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }

    // [TODO] Revisar el tema bubble up
    onAccion($event) {
        if ($event) {
            if ($event.accion === 'nuevo-registro') {
                this.onNuevoRegistrio();
            }
        }
    }


    onNuevoRegistrio() {
        this.accionCama.emit({ accion: 'nuevo-registro' });
    }

    toggleEditNota(value: boolean, nota) {
        this.nota = nota;
        this.editNota = value;
    }

    guardarNota(cama) {
        cama.nota = this.nota;
        this.mapaCamasService.save(cama, moment().toDate(), false).subscribe(camaNota => {
            this.plex.info('success', 'Nota guardada');
            this.editNota = false;
        });
    }
}
