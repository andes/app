import { Unsubscribe } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { TurnosPrestacionesService } from './services/turnos-prestaciones.service';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from '../../services/tipoPrestacion.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfesionalService } from '../../services/profesional.service';
import { FacturacionAutomaticaService } from './../../services/facturacionAutomatica.service';

import { Plex } from '@andes/plex';
import { HUDSService } from '../../modules/rup/services/huds.service';
import { Router } from '@angular/router';
@Component({
    selector: 'turnos-prestaciones',
    templateUrl: 'turnos-prestaciones.html',
    styleUrls: ['./turnos-prestaciones.scss']

})

export class TurnosPrestacionesComponent implements OnInit {
    public busqueda$: Observable<any[]>;
    public seleccionada$: Observable<boolean>;
    public lastSelect$ = new BehaviorSubject<string>(null);

    public mostrarMasOpciones;
    private parametros;
    private hoy;
    public fechaDesde: any;
    public fechaHasta: any;
    private sumar;
    public showPrestacion;
    public loading;
    public arrayEstados;
    public sumarB = false;
    public arrayEstadosFacturacion;
    public documento;
    prestacion: any;
    public prestaciones: any;
    public puedeEmitirComprobante: Boolean;

    public selectProfesional: Boolean = false;
    public profesional: any;
    public botonBuscarDisabled: Boolean = false;
    public columnas = {
        fecha: true,
        documento: false,
        paciente: true,
        tipoPrestacion: true,
        equipoSalud: false,
        estado: true,
        financiador: false,
        ambito: false
    };

    public sortBy: String;
    public sortOrder = 'desc';

    constructor(
        private auth: Auth, private plex: Plex,
        private turnosPrestacionesService: TurnosPrestacionesService, public servicioPrestacion: TipoPrestacionService, public serviceProfesional: ProfesionalService,
        private facturacionAutomaticaService: FacturacionAutomaticaService, private hudsService: HUDSService, private router: Router

    ) { }
    ngOnInit() {
        this.arrayEstados = [{ id: 'Sin registro de asistencia', nombre: 'Sin registro de asistencia' }, { id: 'Ausente', nombre: 'Ausente' }, { id: 'Presente con registro del profesional', nombre: 'Presente con registro del profesional' }, { id: 'Presente sin registro del profesional', nombre: 'Presente sin registro del profesional' }];
        this.arrayEstadosFacturacion = [{ id: 'Sin comprobante', nombre: 'Sin comprobante' }, { id: 'Comprobante sin prestacion', nombre: 'Comprobante sin prestacion' }, { id: 'Comprobante con prestacion', nombre: 'Comprobante con prestacion' }];
        this.mostrarMasOpciones = false;
        this.sumarB = false;
        this.sumar = false;
        this.loading = true;
        this.parametros = {
            fechaDesde: '',
            fechaHasta: '',
            organizacion: '',
            idPrestacion: '',
            idProfesional: '',
            financiadores: '',
            estado: '',
            estadoFacturacion: ''
        };
        // Por defecto mostramos agendas y prestaciones de hoy
        this.hoy = true;
        this.showPrestacion = false;
        this.initialize();

        this.fechaDesde = new Date();
        this.fechaHasta = new Date();
        this.fechaDesde = moment(this.fechaDesde).startOf('day');
        this.fechaHasta = moment(this.fechaHasta).endOf('day');

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
    }

    initialize() {
        let fecha = moment().format();

        if (this.hoy) {
            this.fechaDesde = fecha;
            this.fechaHasta = fecha;
        }
        this.fechaDesde = moment(this.fechaDesde).startOf('day').toDate();
        this.fechaHasta = moment(this.fechaHasta).endOf('day').toDate();

        const params = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion.id,
            idPrestacion: '',
            idProfesional: '',
            financiadores: '',
            estado: '',
            estadoFacturacion: '',
        };
        let permisos = this.auth.getPermissions('turnosPrestaciones:*').length;
        if (this.auth.profesional) {
            if (permisos === 0) {
                this.serviceProfesional.get({ id: this.auth.profesional }).subscribe(rta => {
                    this.profesional = rta[0];
                    params.idProfesional = this.profesional.id;
                    this.parametros['idProfesional'] = this.profesional.id;
                    this.selectProfesional = true;
                    this.busquedaPrestaciones(params);
                });
            } else {
                this.busquedaPrestaciones(params);
            }
        } else {
            if (permisos === 0) {
                this.router.navigate(['inicio']);
            } else {
                this.busquedaPrestaciones(params);
            }
        }
    }

    private busquedaPrestaciones(params) {
        this.turnosPrestacionesService.get(params).subscribe((data) => {
            this.turnosPrestacionesService.prestacionesFiltrada$.next(data);
            this.busqueda$ = this.turnosPrestacionesService.prestacionesOrdenada$;
            this.loading = false;
        });
    }

    @Unsubscribe()
    buscar(parametros) {

        this.sumarB = (parametros.financiador === 'SUMAR' && this.sumar) ? true : false;

        this.showPrestacion = false;
        this.loading = true;
        return this.turnosPrestacionesService.get(parametros).subscribe((data) => {
            this.turnosPrestacionesService.prestacionesFiltrada$.next(data);
            this.busqueda$ = this.turnosPrestacionesService.prestacionesOrdenada$;
            this.loading = false;
        });
    }

    refreshSelection(value, tipo) {
        let fechaDesde = this.fechaDesde ? moment(this.fechaDesde).startOf('day') : null;
        let fechaHasta = this.fechaHasta ? moment(this.fechaHasta).endOf('day') : null;

        if (this.fechaDesde && this.fechaHasta) {
            let diff = moment(this.fechaHasta).diff(moment(this.fechaDesde), 'days');
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
                this.parametros['financiador'] = data ? data.nombre : '';
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
            if (tipo === 'filter') {
                this.buscar(this.parametros);
            }

            // this.buscar(this.parametros);
        }

    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({
            turneable: 1
        }).subscribe(event.callback);
    }

    @Unsubscribe()
    loadEquipoSalud(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            return this.serviceProfesional.get({ nombreCompleto: event.query }).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    mostrarPrestacion(datos) {
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
            this.prestacion = datos;

        });
    }

    recupero() {
        /* Se modifica el objeto prestación para que haga match con el objeto que procesa
        el microservicio de Facturación Automática */
        this.prestacion.organizacion = this.auth.organizacion;
        this.prestacion.tipoPrestacion = this.prestacion.prestacion;
        this.prestacion.origen = 'buscador';
        this.facturacionAutomaticaService.post(this.prestacion).subscribe(respuesta => {
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

    onClose() {
        this.showPrestacion = false;
        this.prestacion = null;
    }
}
