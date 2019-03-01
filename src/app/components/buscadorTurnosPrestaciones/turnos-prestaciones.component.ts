import { Component, OnInit, Output, OnDestroy } from '@angular/core';
import { TurnosPrestacionesService } from './services/turnos-prestaciones.service';
import { Auth } from '@andes/auth';
import { TipoPrestacionService } from '../../services/tipoPrestacion.service';
import { ISubscription } from 'rxjs/Subscription';
import { ProfesionalService } from '../../services/profesional.service';
import { ObraSocialService } from '../../services/obraSocial.service';



@Component({
    selector: 'turnos-prestaciones',
    templateUrl: 'turnos-prestaciones.html',

})

export class TurnosPrestacionesComponent implements OnInit, OnDestroy {
    private busquedas;
    private mostrarMasOpciones;
    private lastRequest: ISubscription;
    private parametros;
    private hoy;
    private fechaDesde: any;
    private fechaHasta: any;
    private sumar;
    private sinOS;
    private showPrestacion;
    public arrayEstados;
    prestacion: any;
    router: any;

    constructor(
        private auth: Auth,
        private turnosPrestacionesService: TurnosPrestacionesService, public servicioPrestacion: TipoPrestacionService, public serviceProfesional: ProfesionalService,
        private servicioOS: ObraSocialService
    ) { }
    ngOnInit() {
        this.arrayEstados = [{ id: 'Sin registro de asistencia', nombre: 'Sin registro de asistencia' }, { id: 'Ausente', nombre: 'Ausente' }, { id: 'Presente con registro del profesional', nombre: 'Presente con registro del profesional' }, { id: 'Presente sin registro del profesional', nombre: 'Presente sin registro del profesional' }];
        this.mostrarMasOpciones = false;
        this.sumar = false;
        this.sinOS = false;
        this.parametros = {
            fechaDesde: '',
            fechaHasta: '',
            organizacion: '',
            idPrestacion: '',
            idProfesional: '',
            financiadores: '',
            estado: ''
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
    }
    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
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
            organizacion: this.auth.organizacion._id,
            idPrestacion: '',
            idProfesional: '',
            financiadores: '',
            estado: ''
        };

        this.turnosPrestacionesService.get(params).subscribe((data) => {
            this.busquedas = this.ordenarPorFecha(data);
        });

    }
    buscar(parametros) {
        this.turnosPrestacionesService.get(parametros).subscribe((data) => {
            this.busquedas = this.ordenarPorFecha(data);
        });
    }
    refreshSelection(value, tipo) {
        let fechaDesde = this.fechaDesde ? moment(this.fechaDesde).startOf('day') : null;
        let fechaHasta = this.fechaHasta ? moment(this.fechaHasta).startOf('day') : null;
        if (fechaDesde && fechaDesde.isValid() && fechaHasta && fechaHasta.isValid()) {
            if (tipo === 'fechaDesde') {
                if (fechaDesde.isValid()) {
                    this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
                    this.parametros['organizacion'] = this.auth.organizacion._id;
                }
            }
            if (tipo === 'fechaHasta') {
                if (fechaHasta.isValid()) {
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

            this.buscar(this.parametros);
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
    loadFinanciadores(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            if (this.lastRequest) {
                this.lastRequest.unsubscribe();
            }
            let query = {
                nombre: event.query
            };
            this.lastRequest = this.servicioOS.getListado(query).subscribe(event.callback);
        } else {
            if (this.lastRequest) {
                this.lastRequest.unsubscribe();
            }
            event.callback([]);
        }

    }
    loadEquipoSalud(event) {
        if (event.query && event.query !== '' && event.query.length > 2) {
            if (this.lastRequest) {
                this.lastRequest.unsubscribe();
            }
            let query = {
                nombreCompleto: event.query
            };
            this.lastRequest = this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            if (this.lastRequest) {
                this.lastRequest.unsubscribe();
            }
            event.callback([]);
        }
    }

    mostrarPrestacion(datos) {
        this.showPrestacion = true;
        this.prestacion = datos;

    }

    onClose() {
        this.showPrestacion = false;
        this.prestacion = null;
    }

}
