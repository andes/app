import { Auth } from '@andes/auth';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map, startWith, takeUntil } from 'rxjs';
import { AdjuntosService } from 'src/app/modules/rup/services/adjuntos.service';
import { ObraSocialService } from 'src/app/services/obraSocial.service';
import { environment } from 'src/environments/environment';
import { TurnosPrestacionesService } from '../services/turnos-prestaciones.service';
import { cache } from '@andes/shared';

@Component({
    selector: 'no-nominalizadas',
    templateUrl: 'no-nominalizadas.html',
    styleUrls: ['./no-nominalizadas.scss']
})

export class NoNominalizadasComponent implements OnInit, OnDestroy {
    private fileToken;

    public showPrestacion;
    public fechaDesde;
    public fechaHasta;
    public prestaciones;
    public botonBuscarDisabled;
    public parametros;
    public loader;
    public prestacionIniciada;
    public pacientes;
    public prestacion;
    public seleccionada;
    public tipoActividad;
    public busqueda$: Observable<any[]>;
    public accion$ = new Subject<any>();
    public onDestroy$ = new Subject<any>();
    public lastSelect$ = new BehaviorSubject<string>(null);

    public columnas = {
        fecha: true,
        efector: true,
        tipoPrestacion: true,
        actividad: true,
        equipoSalud: true,
        fechaRegistro: true,
    };

    constructor(
        private auth: Auth,
        private turnosPrestacionesService: TurnosPrestacionesService,
        private adjuntosService: AdjuntosService,
        private obraSocialService: ObraSocialService
    ) { }

    ngOnDestroy() {
        this.onDestroy$.next(null);
        this.onDestroy$.complete();
    }

    ngOnInit() {
        this.fechaDesde = moment().startOf('day').toDate();
        this.fechaHasta = moment().endOf('day').toDate();

        this.parametros = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion.id,
            idPrestacion: '',
            idProfesional: '',
            financiadores: [],
            estado: '',
            estadoFacturacion: '',
            noNominalizada: true
        };
        this.showPrestacion = false;

        this.busqueda$ = this.turnosPrestacionesService.prestacionesOrdenada$.pipe(
            startWith([]),
            map(prestaciones => {
                setTimeout(() => this.loader = false, 0);
                return prestaciones;
            }),
            takeUntil(this.onDestroy$),
            cache()
        );

        this.turnosPrestacionesService.loading$.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe((loading) => {
            this.loader = loading; // Actualizar el estado del loader
        });

        this.adjuntosService.token$.subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    refreshSelection(tipo) {
        const fechaDesde = this.fechaDesde ? moment(this.fechaDesde).startOf('day') : null;
        const fechaHasta = this.fechaHasta ? moment(this.fechaHasta).endOf('day') : null;

        if (this.fechaDesde && this.fechaHasta) {
            const diff = moment(this.fechaHasta).diff(moment(this.fechaDesde), 'days');
            this.botonBuscarDisabled = diff > 31;
        }

        if (fechaDesde?.isValid() && fechaHasta?.isValid()) {
            if (tipo === 'fechaDesde') {
                if (fechaDesde.isValid()) {
                    this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                    this.parametros['organizacion'] = this.auth.organizacion.id;
                }
            }
            if (tipo === 'fechaHasta') {
                if (fechaHasta.isValid()) {
                    this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                    this.parametros['organizacion'] = this.auth.organizacion.id;
                }
            }
            if (tipo === 'prestaciones') {
                this.parametros['prestacion'] = this.prestaciones ? this.prestaciones.conceptId : '';
            }
            if (tipo === 'descargar') {
                this.turnosPrestacionesService.descargar(this.parametros, 'turnos-y-prestaciones').subscribe();
            }
            if (tipo === 'filter') {
                this.buscar(this.parametros);
            }
        }
    }

    buscar(parametros) {
        this.turnosPrestacionesService.buscar(parametros);
        this.showPrestacion = false;
    }

    mostrarPrestacion(datos) {
        this.prestacionIniciada = datos.idPrestacion;
        this.showPrestacion = true;

        const aux: any = this.lastSelect$;
        if (aux._value) {
            aux._value.seleccionada = false;
        }
        this.lastSelect$.next(datos);
        datos.seleccionada = true;

        this.prestacion = datos;
        this.pacientes = datos.pacientes;
        this.tipoActividad = datos.tipoActividad + '/' + datos.tematica;
    }

    onClose() {
        this.showPrestacion = false;
        const aux: any = this.lastSelect$;
        if (aux._value) {
            aux._value.seleccionada = false;
        }
    }

    getObraSocial(paciente) {
        if (paciente.documento) {
            this.obraSocialService.getObrasSociales(paciente.documento).subscribe(resultado => {
                if (resultado.length) {
                    const obraSocialPaciente = resultado.map((os: any) => ({
                        'id': os.financiador,
                        'label': os.financiador
                    }));

                    return obraSocialPaciente[0].label;
                }
            });
        }
    }

    public getAdjunto(documento) {
        if (documento.id) {
            const apiUri = environment.API + '/modules/rup/store/' + documento.id + '?token=' + this.fileToken;
            window.open(apiUri);
        }
    }
}
