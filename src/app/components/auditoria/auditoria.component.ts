import {
    Plex
} from '@andes/plex';
import {
    Component,
    OnInit,
    HostBinding,
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
    IAudit
} from '../../interfaces/auditoria/IAudit';
import {} from './../../services/paciente.service';
import * as moment from 'moment';
// Services
import {
    PacienteService
} from './../../services/paciente.service';
import {
    AgendaService
} from './../../services/turnos/agenda.service';
import {
    AuditoriaService
} from '../../services/auditoria/auditoria.service';
import {
    SisaService
} from '../../services/fuentesAutenticas/servicioSisa.service';
import {
    SintysService
} from '../../services/fuentesAutenticas/servicioSintys.service';
import {
    AnsesService
} from '../../services/fuentesAutenticas/servicioAnses.service';

@Component({
    selector: 'auditoria',
    templateUrl: 'auditoria.html',
    styleUrls: ['auditoria.css', 'auditCommon.css']
})

export class AuditoriaComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @Output() patientToFix: any;
    @Output() patient: any;

    enableDuplicados: boolean;
    enableValidar: boolean;
    enableValidarMpi: boolean;
    pacienteSelected: any;
    listaCandidatos: any[];
    mostrarPaciente = false;
    loading = false;
    checkMpi = false;
    showAuditoria2 = false;
    showAuditoria = true;
    pacTemporales = [];
    private datosFA: any;


    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private servicioSisa: SisaService,
        private servicioSintys: SintysService,
        private servicioAnses: AnsesService,
        private agendaService: AgendaService,
        private plex: Plex
    ) {}

    // Cargamos todos los pacientes temporales y activos
    ngOnInit() {
        this.checkMpi = false;
        this.pacienteService.getAuditoria({
            estado: 'temporales',
            activo: true
        }).subscribe(resultado => {
            if (resultado) {
                this.pacTemporales = resultado;
            }
        });
    }

    onSelect(paciente: any): void {
        this.checkMpi = false;
        this.listaCandidatos = null;
        if (paciente.id) {
            this.pacienteService.getById(paciente.id).subscribe(pac => {
                this.pacienteSelected = pac;
                if (!this.pacienteSelected.foto) {
                    // Seteo una foto default
                    this.pacienteSelected.foto = 'data:image/jpeg;base64,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';
                }
                this.mostrarPaciente = true;
                if (this.pacienteSelected.estado !== 'validado') {
                    this.enableValidarMpi = true;
                    this.enableValidar = false;
                    this.enableDuplicados = false;
                } else {
                    this.enableValidarMpi = false;
                    this.enableValidar = false;
                    this.enableDuplicados = true;
                }
            });
        }
    }

    verDuplicados() {
        this.showAuditoria2 = true;
    }
    ocultarAuditoria() {
      this.showAuditoria = false;
    }

    async validar() {
        this.plex.showLoader();
        if (this.pacienteSelected.entidadesValidadoras.indexOf('sisa') < 0 && this.pacienteSelected.estado !== 'validado') {
            await this.checkSisa();
        }
        if (this.pacienteSelected.entidadesValidadoras.indexOf('anses') < 0 && this.pacienteSelected.estado !== 'validado') {
            await this.checkAnses();
        }
        if (this.pacienteSelected.entidadesValidadoras.indexOf('sintys') < 0 && this.pacienteSelected.estado !== 'validado') {
            await this.checkSintys();
        }
        if (this.pacienteSelected.estado !== 'validado') {
            if (this.datosFA && this.datosFA.matcheos && this.datosFA.matcheos.matcheo < 90) {
                this.checkPrestaciones();
            } else {
                this.rechazarValidacion();
            }
            this.plex.hideLoader();
        }
    }


    operationLink(pacienteToFix, paciente) {
      this.patientToFix = pacienteToFix;
      this.patient = paciente;
      this.verDuplicados();
      this.ocultarAuditoria();
    }

    async validarMpi(pacienteSeleccionado) {
        this.pacienteService.get({
            type: 'suggest',
            claveBlocking: pacienteSeleccionado.claveBlocking[0], // Usamos esta clave ya que hay temporales migrados que no poseen clave de blocking (deberá reemplazarse por CB)
            documento: pacienteSeleccionado.documento ? pacienteSeleccionado.documento : null,
            nombre: pacienteSeleccionado.nombre,
            apellido: pacienteSeleccionado.apellido,
            fechaNacimiento: pacienteSeleccionado.fechaNacimiento,
            sexo: pacienteSeleccionado.sexo
        }).subscribe(resultado => {
            this.checkMpi = true;
            if (resultado) {
                let data: any = resultado.filter(paciente => paciente.id !== pacienteSeleccionado.id);
                let datos = [];
                data.forEach(elem => {
                  debugger;
                  if (elem.paciente.activo) {
                    datos.push(elem);
                  };
                });
                this.listaCandidatos = datos;
            }
        });

    }

    checkSisa() {
        return new Promise((resolve) => {
            this.servicioSisa.get(this.pacienteSelected).subscribe(res => {
                resolve(this.verificarDatosFA(res, 'sisa'));
            });
        });
    }

    checkAnses() {
        return new Promise((resolve) => {
            this.servicioAnses.get(this.pacienteSelected).subscribe(res => {
                resolve(this.verificarDatosFA(res, 'anses'));
            });
        });
    }

    checkSintys() {
        return new Promise((resolve) => {
            this.servicioSintys.get(this.pacienteSelected).subscribe(res => {
                resolve(this.verificarDatosFA(res, 'sintys'));
            });
        });
    }

    checkPrestaciones() {
        this.agendaService.find(this.pacienteSelected.id).subscribe(data => {
            if (data.length < 1) {
                this.plex.confirm('¿Desea darlo de baja?', 'Paciente inactivo').then((confirmar) => {
                    if (confirmar) {
                        this.pacienteSelected.activo = false;
                    }
                    this.pacienteService.save(this.pacienteSelected).subscribe(res4 => {
                        // TODO ocultar info paciente y resetear campo busqueda
                    });
                });
            }
        });
    }

    rechazarValidacion() {
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('danger', '', 'Paciente no encontrado');
        });
    }

    verificarDatosFA(data, fa) {
        this.plex.hideLoader();
        // Registramos el intento de validación con cada fuente auténtica
        this.pacienteSelected.entidadesValidadoras.push(fa);
        this.datosFA = data;
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo === 100) {
            this.validarPaciente(fa);
            this.enableValidar = false;
            return true;
        }
        if (this.datosFA.matcheos && this.datosFA.matcheos.matcheo >= 93 &&
            this.pacienteSelected.sexo === this.datosFA.matcheos.datosPaciente.sexo &&
            this.pacienteSelected.documento === this.datosFA.matcheos.datosPaciente.documento) {
            this.validarPaciente(fa);
            this.enableValidar = false;
            return true;
        } else {
            return false;
        }

    }

    validarPaciente(fa) {
        // No corregir el nombre con sintys ni anses porque
        // no tiene separado el nombre y el apellido
        if (fa === 'sisa') {
            this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
            this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
        }
        this.pacienteSelected.fechaNacimiento = this.datosFA.matcheos.datosPaciente.fechaNacimiento;
        this.pacienteSelected.estado = 'validado';
        this.pacienteService.save(this.pacienteSelected).subscribe(result => {
            this.plex.info('success', '', 'Validación Exitosa');
        });
    }

    afterAuditoria(evento) {
        this.showAuditoria2 = false;
    }

}
