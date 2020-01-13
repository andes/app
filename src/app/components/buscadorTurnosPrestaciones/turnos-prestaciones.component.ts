import { Unsubscribe } from '@andes/shared';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TurnosPrestacionesService } from './services/turnos-prestaciones.service';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from '../../services/tipoPrestacion.service';
import { Subscription } from 'rxjs';
import { ProfesionalService } from '../../services/profesional.service';
import { ObraSocialService } from '../../services/obraSocial.service';
import { FacturacionAutomaticaService } from './../../services/facturacionAutomatica.service';

import { Plex } from '@andes/plex';
@Component({
    selector: 'turnos-prestaciones',
    templateUrl: 'turnos-prestaciones.html',

})

export class TurnosPrestacionesComponent implements OnInit, OnDestroy {
    public busquedas;
    public mostrarMasOpciones;
    private parametros;
    private hoy;
    public fechaDesde: any;
    public fechaHasta: any;
    private sumar;
    private sinOS;
    public showPrestacion;
    public loading;
    public arrayEstados;
    public sumarB = false;
    public arrayEstadosFacturacion;
    public documento;
    prestacion: any;
    router: any;
    public prestaciones: any;

    public botonGuardarDisabled: Boolean = true;

    constructor(
        private auth: Auth, private plex: Plex,
        private turnosPrestacionesService: TurnosPrestacionesService, public servicioPrestacion: TipoPrestacionService, public serviceProfesional: ProfesionalService,
        private servicioOS: ObraSocialService, private facturacionAutomaticaService: FacturacionAutomaticaService
    ) { }
    ngOnInit() {
        this.arrayEstados = [{ id: 'Sin registro de asistencia', nombre: 'Sin registro de asistencia' }, { id: 'Ausente', nombre: 'Ausente' }, { id: 'Presente con registro del profesional', nombre: 'Presente con registro del profesional' }, { id: 'Presente sin registro del profesional', nombre: 'Presente sin registro del profesional' }];
        this.arrayEstadosFacturacion = [{ id: 'Sin comprobante', nombre: 'Sin comprobante' }, { id: 'Comprobante sin prestacion', nombre: 'Comprobante sin prestacion' }, { id: 'Comprobante con prestacion', nombre: 'Comprobante con prestacion' }];
        this.mostrarMasOpciones = false;
        this.sumarB = false;
        this.sumar = false;
        this.sinOS = false;
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

        // Iniciamos la búsqueda
        this.parametros = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            organizacion: this.auth.organizacion._id
        };
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/buscador',
            name: 'BUSCADOR DE TURNOS Y PRESTACIONES'
        }]);
    }

    ngOnDestroy() {}

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
            organizacion: this.auth.organizacion._id,
            idPrestacion: '',
            idProfesional: '',
            financiadores: '',
            estado: '',
            estadoFacturacion: '',
        };
        this.turnosPrestacionesService.get(params).subscribe((data) => {
            this.busquedas = this.ordenarPorFecha(data);
            this.loading = false;
        });

    }

    @Unsubscribe()
    buscar(parametros) {

        this.sumarB = (parametros.financiador === 'SUMAR' && this.sumar) ? true : false;

        this.showPrestacion = false;
        this.loading = true;
        return this.turnosPrestacionesService.get(parametros).subscribe((data) => {
            this.busquedas = this.ordenarPorFecha(data);
            this.loading = false;
        });
    }

    refreshSelection(value, tipo) {

        let fechaDesde = this.fechaDesde ? moment(this.fechaDesde).startOf('day') : null;
        let fechaHasta = this.fechaHasta ? moment(this.fechaHasta).endOf('day') : null;

        this.botonGuardarDisabled =  (!this.documento || this.documento === '') && (!this.prestaciones || this.prestaciones.length === 0);

        if (fechaDesde && fechaDesde.isValid() && fechaHasta && fechaHasta.isValid()) {
            if (tipo === 'fechaDesde') {
                if (fechaDesde.isValid()) {

                    if (fechaDesde.month() < fechaHasta.month()) {
                        this.fechaHasta = fechaHasta.subtract('months', 1).endOf('month').toDate();
                    }

                    this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                    this.parametros['organizacion'] = this.auth.organizacion._id;
                }
            }
            if (tipo === 'fechaHasta') {
                if (fechaHasta.isValid()) {

                    if (fechaDesde.month() < fechaHasta.month()) {
                        this.fechaDesde = fechaDesde.add('months', 1).startOf('month').toDate();
                    }

                    this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
                    this.parametros['organizacion'] = this.auth.organizacion._id;
                }
            }
            if (tipo === 'prestaciones') {
                if (value.value !== null) {
                    this.parametros['prestacion'] = value.value._id;
                    delete this.parametros['prestaciones'];
                } else {
                    this.parametros['prestacion'] = '';
                }
            }
            if (tipo === 'profesionales') {
                if (value.value) {
                    this.parametros['idProfesional'] = value.value.id;
                } else {
                    this.parametros['idProfesional'] = '';
                }
            }
            if (tipo === 'estado') {
                if (value.value) {
                    this.parametros['estado'] = value.value.id;
                } else {
                    this.parametros['estado'] = '';
                }
            }
            if (tipo === 'financiador') {
                if (value.value) {
                    this.parametros['financiador'] = value.value.nombre;
                } else {
                    this.parametros['financiador'] = '';
                }
            }
            if (tipo === 'sumar') {
                if (value.value) {
                    this.parametros['financiador'] = 'SUMAR';
                } else {
                    this.parametros['financiador'] = '';
                }
            }
            if (tipo === 'sinOS') {
                if (value.value) {
                    this.parametros['financiador'] = 'No posee';
                } else {
                    this.parametros['financiador'] = '';
                }
            }
            if (tipo === 'estadoFacturacion') {
                if (value.value) {
                    this.parametros['estadoFacturacion'] = value.value.id;
                } else {
                    this.parametros['estadoFacturacion'] = '';
                }
            }
            if (tipo === 'documento') {
                if (value.value) {
                    this.parametros['documento'] = value.value;
                } else {
                    this.parametros['documento'] = '';
                }
            }
            if (tipo === 'filter') {
                this.buscar(this.parametros);
            }

            // this.buscar(this.parametros);
        }

    }
    ordenarPorFecha(registros) {
        return registros.sort((a, b) => {
            let inia = a.fecha ? new Date(a.fecha) : null;
            let inib = b.fecha ? new Date(b.fecha) : null;
            if (inia && inib) {
                return (inia.getTime() - inib.getTime());
            }
        });
    }
    loadPrestaciones(event) {
        this.servicioPrestacion.get({
            turneable: 1
        }).subscribe(event.callback);
    }

    @Unsubscribe()
    loadFinanciadores(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            let query = {
                nombre: event.query
            };
            return this.servicioOS.getListado(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }

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
        this.showPrestacion = true;
        this.prestacion = datos;
        this.busquedas.map(item => {
            item.seleccionada = false;
        });
        datos.seleccionada = true;
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

    onClose() {
        this.showPrestacion = false;
        this.prestacion = null;
    }
}
