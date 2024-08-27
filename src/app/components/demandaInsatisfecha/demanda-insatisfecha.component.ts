
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ILlamado } from 'src/app/interfaces/turnos/IListaEspera';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';
import { TurnoService } from 'src/app/services/turnos/turno.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'demanda-insatisfecha',
    templateUrl: 'demanda-insatisfecha.html'
})

export class DemandaInsatisfechaComponent implements OnInit {
    public listaOrganizaciones = [];
    public listaEspera = [];
    public listado$: Observable<any[]>;
    public listaLlamados = [];
    public listaHistorial = [];
    public itemSelected = null;
    public filtros: any = {};
    public selectorPrestacion;
    public selectorOrganizacion;
    public selectorMotivo;
    public selectorEstadoLlamado;
    public nuevoLlamado: ILlamado = {};
    public selectedPaciente;
    public showTurnos;
    public paciente;
    public observacion;
    public showFinalizarDemanda;
    public selectorFinalizar;
    public textoOtros;
    public prestacion = {
        solicitud: {
            tipoPrestacion: null
        },
        paciente: null
    };
    public estadosLlamado = [
        { id: 'turnoAsignado', nombre: 'Turno asignado' },
        { id: 'noContesta', nombre: 'No contesta' },
        { id: 'numeroEquivocado', nombre: 'Numero equivocado' },
        { id: 'otro', nombre: 'Otro' }
    ];

    public verFormularioLlamado = false;

    public motivos = [
        { id: 1, nombre: 'No existe la oferta en el efector' },
        { id: 2, nombre: 'No hay turnos disponibles' },
        { id: 3, nombre: 'Oferta rechazada por el paciente' }
    ];

    public opciones = [
        { id: 1, nombre: 'Ya tiene turno' },
        { id: 2, nombre: 'Otro' },
    ];

    public columns = [
        {
            key: 'paciente',
            label: 'Paciente'
        },
        {
            key: 'prestacion',
            label: 'Prestación'
        },
        {
            key: 'fecha',
            label: 'Fecha'
        },
        {
            key: 'motivo',
            label: 'Motivo'
        },
        {
            key: 'estado',
        }
    ];

    public itemsListado = [
        {
            label: 'DAR TURNO', handler: () => { this.darTurno(); }
        },
        {
            label: 'FINALIZAR', handler: () => { this.finalizarDemanda(); }
        },
    ];

    public tabIndex = 0;
    public pacienteFields = ['sexo', 'fechaNacimiento', 'cuil', 'financiador', 'numeroAfiliado', 'direccion'];

    @ViewChild('formLlamados', { read: NgForm }) formLlamados: NgForm;

    constructor(
        private listaEsperaService: ListaEsperaService,
        private plex: Plex,
        private auth: Auth,
        private serviceTurno: TurnoService,
    ) { }

    ngOnInit(): void {
        const fechaDesdeInicial = moment().subtract(7, 'days').startOf('day');

        this.filtros.fechaDesde = fechaDesdeInicial;
        this.filtros.organizacion = this.auth.organizacion.id;

        this.getDemandas({ fechaDesde: fechaDesdeInicial, organizacion: this.auth.organizacion.id });

        this.auth.organizaciones(true).subscribe((organizaciones) => {
            this.listaOrganizaciones = organizaciones;
        });
    }

    private getDemandas(filtros) {
        this.listaEsperaService.get({ ...filtros, estado: 'pendiente' }).subscribe((listaEspera: any[]) => {
            this.listaEspera = listaEspera;
            this.listaEspera.forEach(item => {
                item.motivos = [...new Set(item.demandas.map(({ motivo }) => motivo))];
            });
        });
    }


    public obtenerObjetoMasAntiguo() {
        if (this.listaEspera.length === 0) {
            return null;
        }

        return this.listaEspera.reduce((masAntiguo, item) => {
            return item.fecha < masAntiguo.fecha ? item : masAntiguo;
        });
    }

    public getHistorial(historial) {
        const demandas = this.itemSelected.demandas;
        const primerDemanda = demandas.reduce((masAntiguo, item) => {
            return item.fecha < masAntiguo.fecha ? item : masAntiguo;
        });

        if (historial) {
            this.serviceTurno.getHistorial({ pacienteId: this.itemSelected.paciente.id }).pipe(
                map(historial => historial.filter(item => moment(item.horaInicio).isAfter(moment(primerDemanda.fecha))))
            ).subscribe(historialFiltrado => {
                this.listaHistorial = historialFiltrado;
            });
        }
    }

    public cambiarTab(value) {
        this.tabIndex = value;
    }

    public seleccionarDemanda(demanda) {
        this.itemSelected = demanda;
        this.listaHistorial = null;
        this.tabIndex = 0;
        this.listaLlamados = !this.itemSelected.llamados ? [] : [...this.itemSelected.llamados];
    }

    public actualizarDemanda(demanda) {
        const i = this.listaEspera.findIndex(item => item.id === demanda.id);
        this.listaEspera[i] = demanda;
        this.listaEspera.forEach(item => {
            item.motivos = [...new Set(item.demandas.map(({ motivo }) => motivo))];
        });
    }

    public actualizarFiltros({ value }, tipo) {

        if (tipo === 'paciente') {
            this.filtros = { ...this.filtros, paciente: value };
        }

        if (tipo === 'fechaDesde') {
            this.filtros = { ...this.filtros, fechaDesde: value };
        }

        if (tipo === 'fechaHasta') {
            this.filtros = { ...this.filtros, fechaHasta: value };
        }

        if (tipo === 'prestacion') {
            const values = value?.map(prestacion => prestacion.term);
            this.filtros = { ...this.filtros, prestacion: values?.join(',') };
        }

        if (tipo === 'motivo') {
            this.filtros = { ...this.filtros, motivo: value?.nombre };
        }

        if (tipo === 'organizacion') {
            const values = value?.map(organizacion => organizacion.id);
            this.filtros = { ...this.filtros, organizacion: values?.join(',') };
        }

        this.getDemandas(this.filtros);
    }

    public cerrar() { this.itemSelected = null; }

    public agregarLlamado() {
        this.verFormularioLlamado = !this.verFormularioLlamado;
        this.nuevoLlamado = {};
        this.formLlamados?.reset({});
        this.formLlamados?.form.markAsPristine();
    }

    public async guardarLlamado(id) {
        this.formLlamados.control.markAllAsTouched();

        if (this.formLlamados.form.valid) {
            try {
                this.listaLlamados.push({ ...this.nuevoLlamado, createdBy: this.auth.usuario, createdAt: moment() });

                this.listaEsperaService.patch(id, 'llamados', this.listaLlamados).subscribe((demanda) => {
                    this.plex.toast('success', 'Llamado registrado exitosamente');
                    this.agregarLlamado();
                    this.actualizarDemanda(demanda);
                });
            } catch (error) {
                this.plex.toast('danger', 'Error al guardar el llamado');
            }
        }
    }

    public seleccionarEstadoLlamado() {
        this.nuevoLlamado.estado = this.selectorEstadoLlamado?.nombre;

        if (this.selectorEstadoLlamado?.id !== 'otro') {
            this.nuevoLlamado.comentario = null;
        }
    }

    public afterDarTurno(datosTurno) {
        const data = {
            estado: 'resuelto',
            fecha: moment().toDate(),
            motivo: (datosTurno) ? 'Turno asignado' : 'Finalizada',
            observacion: this.textoOtros || '',
        };
        if (datosTurno) {
            data['turno'] = {
                id: datosTurno.idTurno,
                idAgenda: datosTurno.idAgenda,
            };
        };
        this.listaEsperaService.patch(this.itemSelected.id, 'estado', data).subscribe(() => {
            this.plex.toast('success', 'Demanda cerrada exitosamente');
            this.actualizarFiltros({ value: '' }, '');
        });
        this.itemSelected = false;
        this.volver();
    }

    private darTurno() {
        this.showTurnos = true;
        this.paciente = this.itemSelected.paciente;
        this.prestacion.solicitud.tipoPrestacion = this.itemSelected.tipoPrestacion;
        this.prestacion.paciente = this.paciente;
    }

    finalizarDemanda() {
        this.showFinalizarDemanda = true;
    }

    volver() {
        this.showTurnos = false;
        this.showFinalizarDemanda = false;
        this.selectorFinalizar = null;
    }

    onInputChange() {
        this.textoOtros = null;
    }
}
