import { Component, OnDestroy, OnInit } from '@angular/core';
import { TurnosPrestacionesService } from './services/turnos-prestaciones.service';
import { Auth } from '@andes/auth';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProfesionalService } from '../../services/profesional.service';
import { FacturacionAutomaticaService } from './../../services/facturacionAutomatica.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { Plex } from '@andes/plex';
import { HUDSService } from '../../modules/rup/services/huds.service';
import { Router } from '@angular/router';
import { ExportHudsService } from '../../modules/visualizacion-informacion/services/export-huds.service';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cache } from '@andes/shared';
import { IFinanciador } from 'src/app/interfaces/IFinanciador';
import { ObraSocialService } from '../../services/obraSocial.service';

@Component({
    selector: 'turnos-prestaciones',
    templateUrl: 'turnos-prestaciones.html',
    styleUrls: ['./turnos-prestaciones.scss']

})

export class TurnosPrestacionesComponent implements OnInit, OnDestroy {
    public busqueda$: Observable<any[]>;
    public paciente$: Observable<any>;
    public obraSocialPaciente: any[] = [];
    public prepagas: any[] = [];
    public lastSelect$ = new BehaviorSubject<string>(null);
    public descargasPendientes = false;
    public prestacionesExport = [];
    private parametros;
    public fechaDesde: any;
    public fechaHasta: any;
    public sumar;
    public showPrestacion;
    public loading;
    public arrayEstados;
    public sumarB = false;
    public arrayEstadosFacturacion;
    public documento;
    public financiadores: IFinanciador[];
    prestacion: any;
    paciente: any;
    public obraSocial: any;
    public prestaciones: any;
    public puedeEmitirComprobante: Boolean;
    public estado;
    public turnosYprestaciones = [];
    public sinOS = false;
    public selectProfesional = false;
    public profesional: any;
    public botonBuscarDisabled = false;
    public profesionales;
    public arrayAmbito = [{ id: 'ambulatorio', nombre: 'ambulatorio' }, { id: 'internacion', nombre: 'internación' }];
    public ambito;
    public prestacionesMax = 500;
    public showHint = false;
    public prestacionIniciada;
    public showListaPrepagas: Boolean = false;
    public modelo: any = {
        obraSocial: '',
        prepaga: ''
    };

    public columnas = {
        fecha: true,
        documento: true,
        paciente: true,
        tipoPrestacion: true,
        equipoSalud: true,
        estado: true,
        financiador: true,
        ambito: false
    };

    public sortBy: String;
    public sortOrder = 'desc';

    public state$: Observable<any>;
    public selectPrestaciones$ = new BehaviorSubject({});

    public accion$ = new Subject<any>();

    public onDestroy$ = new Subject<any>();


    constructor(
        private auth: Auth,
        private plex: Plex,
        private turnosPrestacionesService: TurnosPrestacionesService,
        public serviceProfesional: ProfesionalService,
        private facturacionAutomaticaService: FacturacionAutomaticaService,
        private hudsService: HUDSService,
        private router: Router,
        private exportHudsService: ExportHudsService,
        public obraSocialService: ObraSocialService,
        private pacienteService: PacienteService,

    ) { }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngOnInit() {
        this.arrayEstados = [
            { id: 'Sin registro de asistencia', nombre: 'Sin registro de asistencia' },
            { id: 'Ausente', nombre: 'Ausente' },
            { id: 'Presente con registro del profesional', nombre: 'Presente con registro del profesional' },
            { id: 'Presente sin registro del profesional', nombre: 'Presente sin registro del profesional' }
        ];

        this.arrayEstadosFacturacion = [
            { id: 'Sin comprobante', nombre: 'Sin comprobante' },
            { id: 'Comprobante sin prestacion', nombre: 'Comprobante sin prestacion' },
            { id: 'Comprobante con prestacion', nombre: 'Comprobante con prestacion' }
        ];

        this.sumarB = false;
        this.sumar = false;
        this.loading = true;
        this.parametros = {
            fechaDesde: '',
            fechaHasta: '',
            organizacion: '',
            idPrestacion: '',
            idProfesional: '',
            financiadores: [],
            estado: '',
            estadoFacturacion: ''
        };
        // Por defecto mostramos agendas y prestaciones de hoy
        this.showPrestacion = false;

        this.fechaDesde = moment().startOf('day').toDate();
        this.fechaHasta = moment().endOf('day').toDate();

        this.puedeEmitirComprobante = this.auth.check('turnosPrestaciones:emitirComprobante');

        // Iniciamos la búsqueda
        this.parametros = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion.id
        };

        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/buscador',
            name: 'BUSCADOR DE TURNOS Y PRESTACIONES'
        }]);


        this.busqueda$ = this.turnosPrestacionesService.prestacionesOrdenada$.pipe(
            cache()
        );

        combineLatest([
            this.accion$,
            this.busqueda$
        ]).pipe(
            takeUntil(this.onDestroy$),
            map(([accion, items]) => {
                const selected = this.selectPrestaciones$.getValue();
                switch (accion.type) {
                    case 'select-all':
                        const valor = accion.value;
                        if (valor) {
                            const seleccionados = items.reduce((acc, current) => ({ ...acc, [current.key]: true }), {});
                            this.selectPrestaciones$.next(seleccionados);
                        } else {
                            this.selectPrestaciones$.next({});
                        }
                        break;

                    case 'select':
                        const { key, value } = accion;
                        this.selectPrestaciones$.next({
                            ...selected,
                            [key]: value
                        });
                        break;
                }
            }),
        ).subscribe();

        this.state$ = combineLatest(
            this.selectPrestaciones$,
            this.busqueda$
        ).pipe(
            map(([selected, items]) => {
                return {
                    selectAll: items.length ? Object.values(selected).filter(v => v).length === items.length : false,
                    enableExport: Object.values(selected).filter(v => v).length > 0
                };
            })
        );

        this.initialize();
        this.obraSocialService.getPrepagas().subscribe(prepagas => {
            this.prepagas = prepagas;
        });
    }

    initialize() {
        const params = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion.id,
            idPrestacion: '',
            idProfesional: '',
            financiadores: [],
            estado: '',
            estadoFacturacion: '',
        };
        const permisos = this.auth.getPermissions('turnosPrestaciones:*').length;
        if (this.auth.profesional) {
            if (permisos === 0) {
                this.serviceProfesional.get({ id: this.auth.profesional }).subscribe(rta => {
                    this.profesional = rta[0];
                    params.idProfesional = this.profesional.id;
                    this.parametros['idProfesional'] = this.profesional.id;
                    this.selectProfesional = true;
                    this.buscar(params);
                });
            } else {
                this.buscar(params);
            }
        } else {
            if (permisos === 0) {
                this.router.navigate(['inicio']);
            } else {
                this.buscar(params);
            }
        }
    }

    buscar(parametros) {
        this.sumarB = (parametros.financiador === 'SUMAR' && this.sumar) ? true : false;
        this.turnosPrestacionesService.buscar(parametros);
        this.showPrestacion = false;
    }

    refreshSelection(value, tipo) {
        const fechaDesde = this.fechaDesde ? moment(this.fechaDesde).startOf('day') : null;
        const fechaHasta = this.fechaHasta ? moment(this.fechaHasta).endOf('day') : null;

        if (this.fechaDesde && this.fechaHasta) {
            const diff = moment(this.fechaHasta).diff(moment(this.fechaDesde), 'days');
            this.botonBuscarDisabled = diff > 31;
        }

        if (fechaDesde && fechaDesde.isValid() && fechaHasta && fechaHasta.isValid()) {
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
            const data = value.value;
            if (tipo === 'prestaciones') {
                this.parametros['prestacion'] = data ? data.conceptId : '';
            }
            if (tipo === 'profesionales') {
                this.parametros['idProfesional'] = data ? data.id : '';
            }
            if (tipo === 'estado') {
                this.parametros['estado'] = data ? data.id : '';
            }
            if (tipo === 'financiador') {
                this.parametros['financiador'] = this.financiadores?.map(f => f.nombre) || [];
            }
            if (tipo === 'sumar') {
                this.parametros['financiador'] = data ? 'SUMAR' : '';
            }
            if (tipo === 'sinOS') {
                this.parametros['financiador'] = data ? 'No posee' : '';
            }
            if (tipo === 'estadoFacturacion') {
                this.parametros['estadoFacturacion'] = data ? data.id : '';
            }
            if (tipo === 'documento') {
                this.parametros['documento'] = data ? data : '';
            }
            if (tipo === 'ambito') {
                this.parametros['ambito'] = data ? data.id : '';
            }
            if (tipo === 'filter') {
                this.buscar(this.parametros);
            }
            if (tipo === 'descargar') {
                this.turnosPrestacionesService.descargar(this.parametros, 'turnos-y-prestaciones').subscribe();
            }
        }
    }

    mostrarPrestacion(datos) {
        this.modelo.prepaga = null;
        this.descargasPendientes = false;
        this.prestacionIniciada = datos.idPrestacion;
        this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, datos.paciente, 'auditoria', this.auth.profesional ? this.auth.profesional : null, datos.turno ? datos.turno.id : null, datos.idPrestacion ? datos.idPrestacion : null).subscribe(hudsToken => {
            // se obtiene token y loguea el acceso a la huds del paciente
            window.sessionStorage.setItem('huds-token', hudsToken.token);
            const aux: any = this.lastSelect$;
            if (aux._value) {
                aux._value.seleccionada = false;
            }
            this.lastSelect$.next(datos);
            datos.seleccionada = true;
            this.showPrestacion = true;
            this.showListaPrepagas = false;
            this.prestacion = datos;
            this.cargarObraSocial(datos);
        });
        if (datos.financiador) {
            this.modelo.prepaga = '';
        };
        this.pacienteService.getById(datos.paciente.id).subscribe(paciente => {
            this.paciente = paciente;;
        });
    }

    recupero() {
        /* Se modifica el objeto prestación para que haga match con el objeto que procesa
        el microservicio de Facturación Automática */
        this.prestacion.organizacion = this.auth.organizacion;
        this.prestacion.tipoPrestacion = this.prestacion.prestacion;
        this.prestacion.origen = 'buscador';
        let turno;

        // Para facturar desde recupero es necesario enviar el turno
        if (this.prestacion.turno) {
            turno = this.prestacion.turno;
            turno.organizacion = this.prestacion.organizacion;
            if (!turno.profesionales || turno.profesionales.length) {
                turno.profesionales = this.prestacion.profesionales;
            }
        } else {
            turno = this.prestacion;
        }
        if (this.modelo.prepaga !== '') {
            turno.obraSocial = 'prepaga';
            turno.prepaga = this.modelo.prepaga;
        }
        this.facturacionAutomaticaService.post(turno).subscribe(respuesta => {
            if (respuesta.message) {
                this.plex.info('info', respuesta.message);
            }
        });
    }

    sortTable(event: string) {
        this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc';
        if (this.sortBy === event) {
            this.turnosPrestacionesService.sortOrder$.next(this.sortOrder);
        } else {
            this.sortBy = event;
            this.turnosPrestacionesService.sortBy$.next(event);
            this.turnosPrestacionesService.sortOrder$.next(this.sortOrder);
        }
    }

    exportPrestaciones() {
        const arraySelect = this.selectPrestaciones$.getValue();
        const exp = Object.keys(arraySelect).filter((key) => arraySelect[key] === true);
        let prestacionesTurnos = [];
        const prestaciones = [];
        exp.forEach(element => {
            prestacionesTurnos = element.split('-');
            if (prestacionesTurnos[1] !== 'undefined') { // Me quedo solo con las prestaciones, obviando los turnos
                prestaciones.push(prestacionesTurnos[1]);
            }
        });
        if (prestaciones.length) {
            this.exportHudsService.peticionHuds({ prestaciones }).subscribe(res => {
                if (res) {
                    this.plex.toast('success', 'Su pedido esta siendo procesado', 'Información', 2000);
                    this.getPendientes();
                    this.descargasPendientes = true;
                }
            });
        } else {
            this.plex.info('warning', 'No tiene prestaciones seleccionadas, recuerde que los turnos no pueden ser exportados');
        }
    }

    selectPrestacion(item, $event) {
        this.accion$.next({ type: 'select', value: $event.value, key: item.key });
        const prestacionesSelected = Object.values(this.selectPrestaciones$.getValue()).filter(element => element);
        this.showHint = prestacionesSelected.length > this.prestacionesMax;
    }

    selectAll($event) {
        this.accion$.next({ type: 'select-all', value: $event.value });
        this.showHint = Object.values(this.selectPrestaciones$.getValue()).length > this.prestacionesMax;
    }

    mostrarPendientes() {
        this.descargasPendientes = this.descargasPendientes ? false : true;
        this.onClose();
    }

    getPendientes() {
        this.exportHudsService.pendientes({ id: this.auth.usuario.id }).subscribe((data) => {
            this.exportHudsService.hud$.next(data);
        });
    }

    onClose() {
        this.showPrestacion = false;
        const aux: any = this.lastSelect$;
        if (aux._value) {
            aux._value.seleccionada = false;
        }
    }

    cargarObraSocial(datos) {
        if ((datos.idPrestacion)) {
            this.obraSocialPaciente = [];
            this.obraSocialService.getObrasSociales(datos.paciente.documento).subscribe(resultado => {
                if (resultado.length) {
                    this.obraSocialPaciente = resultado.map((os: any) => {
                        const osPaciente = {
                            'id': os.financiador,
                            'label': os.financiador
                        };
                        return osPaciente;
                    });
                    this.modelo.obraSocial = this.obraSocialPaciente[0].label;
                } else {
                    if (datos.paciente.obraSocial) {
                        this.obraSocialPaciente.push({ 'id': datos.paciente.obraSocial.nombre, 'label': datos.paciente.obraSocial.nombre });
                        this.modelo.obraSocial = this.obraSocialPaciente[0].label;
                    }


                }
                this.obraSocialPaciente.push({ 'id': 'prepaga', 'label': 'Prepaga' });
            });
        }
    }

    seleccionarObraSocial(event) {
        if (event.value === 'prepaga') {
            this.modelo.prepaga = null;
            this.obraSocialService.getPrepagas().subscribe(prepagas => {
                this.prepagas = prepagas;
            });
            this.showListaPrepagas = true;
        } else {
            this.showListaPrepagas = false;
            this.modelo.prepaga = '';
        }
        this.modelo.obraSocial = event.value;
    }

    generarComprobante() {
        return this.prestacionIniciada && this.puedeEmitirComprobante && this.modelo.prepaga !== null && ((!this.prestacion.estadoFacturacion) || this.prestacion.estadoFacturacion?.estado !== 'Comprobante con prestacion');
    }
}
