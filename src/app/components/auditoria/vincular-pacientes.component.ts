import { OnInit, Component, EventEmitter, Output } from '@angular/core';
import { PacienteService } from '../../core/mpi/services/paciente.service';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Router, ActivatedRoute } from '@angular/router';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'vincular-pacientes',
    templateUrl: 'vincular-pacientes.html',
})

export class VincularPacientesComponent implements OnInit {
    pacienteBase: IPaciente;
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    pacientes: any;
    listaCandidatos = [];
    showBuscador = true;
    constructor(
        private pacienteService: PacienteService,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            let id = params['idPaciente'];
            this.pacienteService.getById(id).subscribe(
                paciente => {
                    this.pacienteBase = paciente;
                    this.buscarCandidatos();
                },
                error => {
                    this.plex.info('warning', 'Intente nuevamente', 'Error de conexión');
                }
            );
        });
    }


    public cancelar() {
        this.router.navigate(['apps/mpi/auditoria']);
    }

    /**
     * Realiza una búsqueda de candidatos automática
     */
    buscarCandidatos(): any[] {
        if (!this.pacienteBase) {
            return null;
        }
        let dto: any = {
            type: 'suggest',
            claveBlocking: 'documento',
            percentage: true,
            apellido: this.pacienteBase.apellido.toString(),
            nombre: this.pacienteBase.nombre.toString(),
            documento: (this.pacienteBase.documento) ? this.pacienteBase.documento.toString() : '',
            sexo: ((typeof this.pacienteBase.sexo === 'string')) ? this.pacienteBase.sexo : (Object(this.pacienteBase.sexo).id),
            fechaNacimiento: this.pacienteBase.fechaNacimiento
        };
        this.pacienteService.get(dto).subscribe(resultado => {
            if (resultado) {
                // Filtramos los pacientes que ya posean algo en el array de identificadores para evitar
                // anidamiento de linkeos
                let pacientes: any = resultado.filter((paciente: any) =>
                    (paciente.id !== this.pacienteBase.id && (paciente.paciente.identificadores && paciente.paciente.identificadores.filter(identificador =>
                        identificador.entidad === 'ANDES').length < 1)));
                if (this.pacienteBase.estado === 'temporal') {
                    pacientes = pacientes.filter(pac => pac.estado === 'temporal');
                }
                let candidatosVinculacion = [];
                pacientes.forEach(elem => {
                    if (elem.paciente.activo !== false) {
                        candidatosVinculacion.push({ paciente: elem.paciente, vinculado: false, activo: elem.activo, match: elem.match });
                    }
                });
                this.listaCandidatos = candidatosVinculacion;
                this.loadPacientesVinculados();
            }
        });
    }

    loadPacientesVinculados() {
        let idsPacientesVinculados = this.pacienteBase.identificadores;
        if (idsPacientesVinculados) {
            idsPacientesVinculados.forEach(identificador => {
                if (identificador.entidad === 'ANDES') {
                    this.pacienteService.getById(identificador.valor).subscribe(pac => {
                        this.listaCandidatos.unshift({ paciente: pac, vinculado: true, activo: pac.activo });
                        this.verificarListado();
                    });
                } else {
                    this.verificarListado();
                }
            });
        } else {
            this.verificarListado();
        }
    }
    // Verifica si existen candidatos o vinculados para el paciente base
    verificarListado() {
        this.showBuscador = !(this.listaCandidatos.length > 0);
    }

    vincular(pac: any, index: number) {
        this.plex.confirm(' Vinculando los registros del paciente seleccionado a: ' + this.pacienteBase.apellido + ' ' + this.pacienteBase.nombre + ' ¿seguro desea continuar?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                let dataLink = {
                    entidad: 'ANDES',
                    valor: pac.id
                };
                this.pacienteService.postIdentificadores(this.pacienteBase.id, {
                    'op': 'link',
                    'dto': dataLink
                }).subscribe(() => {
                    this.listaCandidatos[index].vinculado = true;
                    this.listaCandidatos[index].activo = false;
                    this.plex.toast('success', 'La vinculación ha sido realizada correctamente', 'Información', 3000);
                });
            }
        });
    }

    desvincular(pac: any, index: number) {
        this.plex.confirm('¿Está seguro que desea desvincular a este paciente?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                let dataLink = {
                    entidad: 'ANDES',
                    valor: pac.id
                };
                this.pacienteService.postIdentificadores(this.pacienteBase.id, {
                    'op': 'unlink',
                    'dto': dataLink
                }).subscribe(resultado1 => {
                    this.listaCandidatos[index].vinculado = false;
                    this.listaCandidatos[index].activo = true;
                    this.plex.toast('success', 'La desvinculación ha sido realizada correctamente', 'Información', 3000);
                });
            }
        });

    }

    activar(pac: IPaciente, index: number) {
        this.pacienteService.enable(pac).subscribe(res => {
            this.listaCandidatos[index].activo = true;
        });
    }
    desactivar(pac: IPaciente, index: number) {
        // si el paciente tiene otros pacientes en su array de identificadores, no lo podemos desactivar
        if (pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length > 0) {
            this.plex.info('warning', 'Existen otros pacientes vinculados a este paciente', 'No Permitido').subscribe(
                () => { return null; }
            );
        } else {
            this.pacienteService.disable(pac).subscribe(res => {
                this.listaCandidatos[index].activo = false;
            });
        }
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            // Filtramos los pacientes que ya posean algo en el array de identificadores para evitar
            // anidamiento de linkeos
            this.pacientes = this.pacienteBase ? resultado.pacientes.filter((pac: any) => (
                (this.pacienteBase.id !== pac.id) && (!pac.identificadores || pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length < 1))) : resultado.pacientes;
            if (this.pacienteBase.estado === 'temporal') {
                this.pacientes = this.pacientes.filter(pac => pac.estado === 'temporal');
            }
            // Si el paciente ya se encuentra en la lista de candidatos, lo quitamos de los resultados de búsqueda
            if (this.listaCandidatos.length > 0) {
                this.pacientes = this.pacientes.filter(paciente =>
                    this.listaCandidatos.filter(candidato => (candidato.paciente.id) === paciente.id).length < 1
                );
            }
        }
    }

    searchClear() {
        this.pacientes = null;
    }

    addCandidato(event) {
        this.listaCandidatos.push({ activo: true, vinculado: false, paciente: event });
        this.pacientes = null;
        this.showBuscador = false;
    }


}
