
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
// import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

import { Plex } from '@andes/plex';
import { MenuItem } from '@andes/plex/src/lib/app/menu-item.class';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html'
})
export class PrestacionEjecucionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input() prestacion: IPrestacionPaciente;
    listaProblemas: IProblemaPaciente[] = [];
    problemaBuscar: String = '';

    tiposProblemas = [];
    tipoProblema = null;
    problemaTratar: any;
    mostrarMenu: Boolean = false;

    items = [
        new MenuItem({ label: 'Ir a inicio', icon: 'dna', route: '/incio' }),
        new MenuItem({ label: 'Ir a ruta inexistente', icon: 'flag', route: '/ruta-rota' }),
        new MenuItem({ divider: true }),
        new MenuItem({ label: 'Item con handler', icon: 'wrench', handler: (() => { alert('Funciona!'); return false; }) })
    ];


    showEvolucionar = false;
    showTransformar = false;
    showEnmendar = false;
    showEvolTodo = false;
    showValidar = false;
    data: Object = {};

    prestacionesEjecutar: any[] = [];
    // nuevas prestaciones a ejecutar en la consulta 
    nuevasPrestaciones: ITipoPrestacion[] = [];


    // AGREGAR PRESTACION
    // objeto para crear una nueva prestacion e inicializar
    nuevaPrestacion: any;
    // lista de problemas posibles en la ejecucion/evolucion de las prestaciones
    listaProblemaPrestacion = [];
    // prestacion seleccionada para ejecutar en el transcurso de la prestacion original
    prestacionAEjecutar: any = null;
    // array de id prestaciones que se ejecutaron en la consulta para filtrar luego
    prestacionesEjecucion: any[] = [];
    idTiposPrestacionesEjecucion: any[] = [];

    // PRESTACIONES FUTURAS
    // utilizado para el select
    nuevoTipoPrestacion: ITipoPrestacion;
    // array de opcioens seleccionadas
    nuevaPrestacionListaProblemas: any = [];
    // listado de prestaciones futuras a pedir en el plan
    prestacionesFuturas: IPrestacionPaciente[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) {
    }

    ngOnInit() {

        this.cargarDatosPrestacion();
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    updatePrestacion() {
        // actualizamos la prestacion de origen
        this.servicioPrestacion.put(this.prestacion).subscribe(prestacionActualizada => {
            // this.prestacion = prestacionActualizada;
            // buscamos la prestacion actualizada con los datos populados
            this.servicioPrestacion.getById(prestacionActualizada.id).subscribe(prestacion => {
                this.prestacion = prestacion;
            });
        });
    }

    // lista de problemas
    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.nombre == tipoProblema.nombre)
    }

    guardarProblema(nuevoProblema) {
        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            if (resultado) {
                this.listaProblemas.push(resultado);

                // asignamos el problema a la prestacion de origen
                // this.prestacion.solicitud.listaProblemas.push(resultado);
                this.updatePrestacion();
            } else {
                this.plex.alert('Error al intentar asociar el problema a la consulta');
            }
        });
    }

    agregarProblema() {
        if (!this.existeProblema(this.tipoProblema)) {
            let nuevoProblema = {
                id: null,
                tipoProblema: this.tipoProblema,
                idProblemaOrigen: null,
                paciente: this.prestacion.paciente.id,
                fechaInicio: new Date(),
                activo: true,
                evoluciones: []
            };

            this.guardarProblema(nuevoProblema);

        } else {
            this.plex.alert('EL problema ya existe para esta consulta');
        }
    }

    eliminarProblema(problema: IProblemaPaciente) {
        this.plex.confirm('Está seguro que desea eliminar el problema: ' + problema.tipoProblema.nombre + ' de la consulta actual?').then(resultado => {

            if (resultado) {

            }
        });
    }

    evolucionarProblema(problema) {
        this.showEvolucionar = true;
        this.problemaTratar = problema;

    }

    transformarProblema(problema) {
        this.showTransformar = true;
        this.problemaTratar = problema;
        this.listaProblemas = this.listaProblemas.filter(item => item.id !== problema.id);

    }

    evolucionarTodo() {
        this.showEvolucionar = false;
        this.showEvolTodo = true;
    }
    // Fin lista de problemas 

    onReturn(dato: IProblemaPaciente) {
        this.showEvolucionar = false;
    }

    onReturnTransformar(dato: IProblemaPaciente) {
        this.showTransformar = false;
        this.listaProblemas.push(dato);
        // asignamos el problema a la prestacion de origen
        // this.prestacion.solicitud.listaProblemas.push(resultado);
        this.updatePrestacion();
    }

    onReturnTodos(dato: IProblemaPaciente[]) {
        this.showEvolucionar = false;
        this.showEvolTodo = false;
    }

    verMenu(problema) {
        this.items = [
            new MenuItem({ label: 'Evolucionar Problema', handler: (() => { this.evolucionarProblema(problema) }) }),
            new MenuItem({ label: 'Transformar Problema', handler: (() => { this.evolucionarProblema(problema) }) })
        ];
        this.mostrarMenu = true;
    }

    cargarDatosPrestacion() {
        this.listaProblemas = this.prestacion.ejecucion.listaProblemas;
    }
    validarPrestacion() {
        this.showValidar = true;
    }

    onReturnComponente(datos, tipoPrestacionActual) {
        console.log("dato del componente", datos);
        this.data[tipoPrestacionActual.key] = datos;
    }

    volver() {
        this.evtData.emit(this.prestacion);
    }
}