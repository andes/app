import {
    Plex
} from '@andes/plex';
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {
    Ng2DragDropModule
} from 'ng2-drag-drop';
import * as moment from 'moment';
import {
    IPaciente
} from '../../interfaces/IPaciente';
import {
    matching
} from '@andes/match';

// Imports de servicios
import {
    AuditoriaPorBloqueService
} from '../../services/auditoria/auditoriaPorBloque.service';
import {
    AuditoriaService
} from '../../services/auditoria/auditoria.service';
import {
    IAudit
} from '../../interfaces/auditoria/IAudit';
import {
    PacienteService
} from './../../services/paciente.service';

@Component({
    selector: 'auditoria2',
    templateUrl: 'auditoria2.html',
    styleUrls: ['auditoria2.css', 'auditCommon.css']
})


export class Auditoria2Component implements OnInit {

    // Definición de variables y estructuras locales
    seleccionada = false;
    verDuplicados = false;
    draggingPatient = true;
    pacienteSelected: any;
    pacientesAudit: any[];
    pacientesVinculados = [];
    pacientesDesvinculados = [];
    match = new matching();
    weights = {
                identity: 0.3,
                name: 0.3,
                gender: 0.1,
                birthDate: 0.3
        };
    tipoDeMatching = 'Levenshtein';
    // definición de parametros de I/O
    @Input() origin: any;
    @Input() destiny: any;
    @Output() data: EventEmitter < IPaciente > = new EventEmitter < IPaciente > ();

    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private auditoriaPorBloqueService: AuditoriaPorBloqueService,
        private pacienteService: PacienteService,
        private plex: Plex,
    ) {}

    ngOnInit() {

        this.inicializar();

    }

    inicializar() {

        /* Ejecutar una consulta que obtenga un array con todos los pacientes que tienen la misma clave de blocking.
          Vamos a suponer que el paciente a buscar viene en un input desde otro componente.
        */

        this.pacienteService.getById(this.destiny.id).subscribe(data => {
            if (data) {
                this.pacienteSelected = data;
                if (!this.pacienteSelected.foto) {
                // Seteo una foto default
                  this.pacienteSelected.foto = 'data:image/jpeg;base64,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';
                }
                this.loadPacientesVinculados();
                this.pacientesDesvinculados.push(this.origin);
                // this.loadPacientePorBloque();
            }
        });
    }

    /**
     * Carga todos los pacientes vinculados, éstos no están activos y su objectId está asociado al paciente vinculado
     *
     * @memberof Auditoria2Component
     */
    loadPacientesVinculados() {
        let idVinculados = this.pacienteSelected.identificadores;
        if (idVinculados) {
            idVinculados.forEach(identificador => {
                if (identificador.entidad === 'ANDES') {
                    this.pacienteService.getById(identificador.valor).subscribe(pac => {
                        this.pacientesVinculados.push(pac);
                    });
                }
            });
        }

    }

    /**
     * Obtenemos la lista de pacientes que tienen la misma clave de blocking
     * le aplicamos además el algoritmo de matching
     * @memberof Auditoria2Component
     */
    // loadPacientePorBloque() {
    //     // Soundex Apellido
    //     let tipoClave = 4;
    //     let dto: any = {
    //         idTipoBloque: tipoClave,
    //         idBloque: this.pacienteSelected.claveBlocking[tipoClave].toString()
    //     };

    //     this.auditoriaPorBloqueService.getListaBloques(dto).subscribe(rta => {
    //         if (rta) {
    //             rta.forEach(element => {
    //                 if (element.id !== this.pacienteSelected.id) {
    //                     // Aplicamos match de pacientes y filtramos por mayores al 70%
    //                     let porcentajeMatching = this.match.matchPersonas(this.pacienteSelected, element,  this.weights, this.tipoDeMatching);
    //                     let patient = {
    //                         matching : 0,
    //                         paciente : null
    //                     };
    //                     if (porcentajeMatching > 0.7) {
    //                         patient.matching = porcentajeMatching * 100;
    //                         patient.paciente = element;
    //                         this.pacientesDesvinculados.push(patient);
    //                     }
    //                 }
    //             });
    //         };
    //     });
    // }

    arrastrandoPaciente(dragging) {
        this.draggingPatient = dragging;
    }

    /**
     * Función que realiza la vinculación desde clic en el clip
     *
     * @param {*} pac
     * @memberof Auditoria2Component
     */
    vincularPacienteClic(pac: any) {
        this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a: ' + this.pacienteSelected.apellido + ' ' + this.pacienteSelected.nombre + ' ¿seguro desea continuar?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(pac), 1);
                this.pacientesVinculados.push(pac);
                this.vincular(pac);
            }
        });
    }

    /**
     * Función que realiza la vinculación desde un Drag&Drop
     *
     * @param {*} evt
     * @memberof Auditoria2Component
     */
    vincularPacienteDrop(evt: any) {
        this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a: ' + this.pacienteSelected.apellido + ' ' + this.pacienteSelected.nombre + ' ¿seguro desea continuar?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(evt.dragData), 1);
                this.pacientesVinculados.push(evt.dragData);
                this.vincular(evt.dragData);
            }
        });
    }


    /**
     * Vincula el paciente seleccionado tanto por Drag&Drop como por el clic en el clip
     *
     * @param {*} paciente : El paciente a vincualar
     * @memberof Auditoria2Component
     */
    vincular(pac: any) {
        /* Acá hacemos el put con el update de los pacientes */
        let dataLink = {
            entidad: 'ANDES',
            valor: pac.id
        };
        this.pacienteService.patch(this.pacienteSelected.id, {
            'op': 'linkIdentificadores',
            'dto': dataLink
        }).subscribe(resultado => {
            if (resultado) {
                let activo = false;
                this.pacienteService.patch(pac.id, {
                    'op': 'updateActivo',
                    'dto': activo
                }).subscribe(resultado2 => {
                    if (resultado2) {
                        this.plex.toast('success', 'La vinculación ha sido realizada correctamente', 'Información', 3000);
                    }
                });
            }
        });
    }

    /**
     * Implica activa al paciente y quitar el objectId asociado al paciente
     *
     * @param {*} pac
     * @memberof Auditoria2Component
     */
    desvincularPaciente(pac: any) {
        this.plex.confirm('¿Está seguro que desea desvincular a este paciente?').then((resultado) => {
            let rta = resultado;
            if (rta) {
                this.pacientesVinculados.splice(this.pacientesVinculados.indexOf(pac), 1);
                this.pacientesDesvinculados.push(pac);
                this.pacienteService.patch(this.pacienteSelected.id, {
                    'op': 'unlinkIdentificadores',
                    'dto': pac.paciente.id
                }).subscribe(resultado1 => {
                    if (resultado1) {
                        // Activa el paciente
                        let activo = true;
                        this.pacienteService.patch(pac.paciente.id, {
                            'op': 'updateActivo',
                            'dto': activo
                        }).subscribe(resultado2 => {
                            if (resultado2) {
                                this.plex.toast('success', 'La desvinculación ha sido realizada correctamente', 'Información', 3000);
                            }
                        });
                    }
                });
            }
        });

    }

    onBack() {
        this.data.emit();
    }
}
