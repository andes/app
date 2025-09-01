import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { PlexModalComponent } from '@andes/plex';
import { HistorialBusquedaService } from 'src/app/core/mpi/services/historialBusqueda.service';


@Component({
    selector: 'vincular-pacientes',
    templateUrl: 'vincular-pacientes.html',
    styleUrls: ['vincular-pacientes.scss']
})

export class VincularPacientesComponent {

    @Input() pacienteBase: IPaciente;
    @Output() setLink: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @Output() askUnlink: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();
    @ViewChild('modalVinculacion', { static: true }) modalVinculacion: PlexModalComponent;

    pacienteLink: IPaciente = null;
    showVinculaciones = false;
    showBuscador = false;
    searchClear = true;
    loading = false;
    resultadoPacientes: IPaciente[] = [];
    listaCandidatos: any[] = [];
    listaVinculados: IPaciente[] = [];

    constructor(
        private pacienteService: PacienteService,
        private plex: Plex,
        private historialBusquedaService: HistorialBusquedaService
    ) { }


    public loadVinculados(paciente: IPaciente, showVinculaciones = true) {
        this.showVinculaciones = showVinculaciones;
        this.showBuscador = !showVinculaciones;

        if (paciente.id) {
            this.listaVinculados = [];

            if (paciente.identificadores && paciente.identificadores.length) {
                const vinculados = paciente.identificadores.filter((item: any) => item.entidad === 'ANDES');
                const obtenerVinculados = from(vinculados).pipe(
                    concatMap(id => this.pacienteService.getById(id.valor).pipe())
                );
                obtenerVinculados.subscribe(pac => this.listaVinculados.push(pac));
            }
        }
    }

    close() {
        this.showBuscador = false;
        this.showVinculaciones = false;
    }

    // ACCIONES SOBRE UN PACIENTE -----------------------------

    showModal(pac: IPaciente) {
        this.pacienteLink = pac;
        this.modalVinculacion.show();
    }

    vincular(success: boolean) {
        if (success) {
            this.pacienteService.linkPatient(this.pacienteBase, this.pacienteLink).subscribe(pacientes => {
                if (pacientes.length) {
                    this.pacienteBase = pacientes[0];
                    this.pacienteLink = pacientes[1];
                    this.historialBusquedaService.delete(this.pacienteLink);
                }
                this.setLink.emit(this.pacienteBase);
                this.plex.toast('success', 'La vinculación ha sido realizada correctamente', 'Información', 3000);
            });
        }
        this.modalVinculacion.close();
    }

    // Notifica al componente 'Auditoria' para chequear permisos
    preDesvincular(pac: any) {
        this.askUnlink.emit(pac);
    }

    desvincular(pac: any) {
        this.plex.confirm('¿Está seguro que desea desvincular a este paciente?').then((rta) => {
            if (rta) {
                this.pacienteService.unlinkPatient(this.pacienteBase, pac).subscribe(pacientes => {
                    if (pacientes) {
                        this.pacienteBase = pacientes[0];
                        pac = pacientes[1];
                    }
                    // actualizamos listado de vinculados
                    this.setLink.emit(this.pacienteBase);
                    this.plex.toast('success', 'La desvinculación ha sido realizada correctamente', 'Información', 3000);
                });
            }
        });
    }


    // BUSQUEDA DE PACIENTES -------------------------------------

    public buscarCandidatos() {
        this.showBuscador = true;
        this.showVinculaciones = false;
        this.onSearchClear();
    }

    onSearchStart() {
        this.resultadoPacientes = [];
        this.loading = true;
        this.searchClear = false;
    }

    onSearchEnd(resultado: PacienteBuscarResultado) {
        this.loading = false;

        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            // Filtramos los pacientes que ya posean vinculaciones para evitar anidamiento de linkeo
            this.resultadoPacientes = this.pacienteBase ? resultado.pacientes.filter((pac: any) => (
                (this.pacienteBase.id !== pac.id) && (!pac.identificadores || pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length < 1))) : resultado.pacientes;
            // si en pacienteBase es un temporal, quita de la lista pacientes que sean validados
            if (this.pacienteBase.estado === 'temporal') {
                this.resultadoPacientes = this.resultadoPacientes.filter(pac => pac.estado === 'temporal');
            }
            // Si el paciente ya tiene vinculados, los quitamos de los resultados de búsqueda
            if (this.pacienteBase.identificadores?.length > 0) {
                this.resultadoPacientes = this.resultadoPacientes.filter(pac =>
                    !(this.pacienteBase.identificadores.find(identif => identif.entidad === 'ANDES' && identif.valor === pac.id)));
            }
        }
    }

    onSearchClear() {
        this.resultadoPacientes = [];
        this.searchClear = true;
    }
}
