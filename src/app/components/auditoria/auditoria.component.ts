import { Plex } from '@andes/plex';
import { Component, OnInit, Output } from '@angular/core';
import { AuditoriaService } from './auditoria.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { SisaService } from '../../services/fuentesAutenticas/servicioSisa.service';
import { RenaperService } from '../../services/fuentesAutenticas/servicioRenaper.service';
import { PacienteBuscarResultado } from '../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';

@Component({
  selector: 'auditoria',
  templateUrl: 'auditoria.html',
  styleUrls: ['auditoria.scss']
})

export class AuditoriaComponent implements OnInit {

  @Output() patientToFix: any;
  @Output() patient: any;

  enableDuplicados: boolean;
  enableActivar: boolean;
  enableValidar: boolean;
  pacienteSelected: any;
  showDetallePaciente = false;
  enableVinculados = false;
  loading = false;
  showAuditoria = true;
  pacVinculados = [];
  public panelIndex = 0;
  private datosFA: any;
  pacientes: any;
  pacientesInactivos: any;
  pacienteActivo: any;
  showVincular = false;
  showCandidatos = false;
  enableVincular = false;
  showBuscador = false;
  showMensaje = false;
  pacientesReportados: IPaciente[] = [];
  corregirPaciente: Number = null;  // posicion delnpaciente a modificar (reporte de errores)
  showBotonesReporte = false;
  permisoEdicion: Boolean;
  permisoVincular: Boolean;

  constructor(
    public auth: Auth,
    private pacienteService: AuditoriaService,
    private servicioSisa: SisaService,
    private servicioRenaper: RenaperService,
    private agendaService: AgendaService,
    private plex: Plex,
    private router: Router,
  ) { }

  // Cargamos todos los pacientes temporales y activos
  ngOnInit() {
    if (!(this.auth.getPermissions('auditoriaPacientes:?').length > 0)) {
      this.router.navigate(['./inicio']);
      return;
    }
    this.permisoEdicion = this.auth.check('auditoriaPacientes:edicion');
    this.permisoVincular = this.auth.check('auditoriaPacientes:vincular');
    if (this.permisoEdicion && !this.permisoVincular) {
      this.getReportados(); // Si el usuario solo tiene permisos de edicion es necesario obtener los datos aquí
    }
    this.onLoadData();
  }

  onLoadData() {
    this.showDetallePaciente = false;
    this.enableVinculados = false;
  }

  getVinculados() {
    const params = { identificadores: 'ANDES' };
    this.pacienteService.get(params).subscribe(resultado => {
      if (resultado) {
        this.pacVinculados = resultado;
      }
    });
  }
  getInactivos() {
    const params = { activo: false };
    this.pacienteService.get(params).subscribe(
      resultado => {
        this.pacientesInactivos = resultado;
      });
  }

  // Aquellos pacientes que reportaron errores en sus datos personales
  getReportados() {
    const params = { reportarError: true, activo: true };
    this.pacienteService.get(params).subscribe(resultado => {
      if (resultado) {
        this.pacientesReportados = resultado;
        this.corregirPaciente = null;
      }
    });
  }

  onSelectReportados(paciente: any): void {
    if (!this.showBotonesReporte) {
      if (paciente) {
        this.pacienteSelected = paciente;
      } else {
        this.pacienteSelected = null;
      }
    }
  }

  onSelectCorregir(index, paciente) {
    if (this.permisoEdicion) {
      if (!this.showBotonesReporte) {
        this.corregirPaciente = index;
        this.showBotonesReporte = true;
        this.pacienteSelected = paciente;
      }
    }
  }

  guardarCorreccion(): void {
    this.plex.confirm('Desea continuar?', 'La información que está por cambiar modificará información sensible del paciente y tendrá repercusión en su Historia de Salud.').then((confirmar) => {
      if (confirmar) {
        this.pacienteSelected.reportarError = false;
        this.pacienteSelected.notaError = '';
        this.corregirPaciente = null;
        this.showBotonesReporte = false;
        this.pacienteService.save(this.pacienteSelected).subscribe(() => {
          this.pacienteSelected = null;
          this.getReportados();
        });
      }
    });
  }

  onSelect(paciente: any): void {
    if (paciente) {
      this.pacienteActivo = this.patient = paciente;
      this.showCandidatos = false;
      // Vinculamos solo pacientes activos.
      this.enableVincular = paciente.activo;
      this.enableActivar = !paciente.activo;
      if (paciente && paciente.id) {
        this.pacienteService.findById(paciente.id).subscribe(pac => {
          this.pacienteSelected = pac;

          this.showDetallePaciente = true;
          if (this.pacienteSelected.estado !== 'validado') {
            this.enableValidar = false;
            this.enableDuplicados = false;
          } else {
            this.enableValidar = false;
            if (paciente.identificadores) {
              let identificadoresAndes = paciente.identificadores.filter(identificador => {
                return identificador.entidad === 'ANDES';
              });
              this.enableDuplicados = (identificadoresAndes.length > 0);
            }
          }
        });
      }
    } else {
      this.pacienteSelected = null;
    }
  }

  checkPanel(panelIndex) {
    if (panelIndex === 1) {
      this.getVinculados();
    }
    if (panelIndex === 2) {
      this.getInactivos();
    }
    if (panelIndex === 3) {
      this.getReportados();
    }
    this.showDetallePaciente = false;
    this.enableActivar = false;
    this.enableVinculados = false;
    this.enableValidar = false;
    this.enableVincular = false;
    this.searchClear();
  }
  onSelectVinculados(paciente: any): void {
    if (paciente.id) {
      this.pacienteService.findById(paciente.id).subscribe(pac => {
        this.pacienteSelected = pac;
        this.showDetallePaciente = true;
        this.enableValidar = false;
        this.enableVinculados = true;
      });
    }
  }


  verDuplicados() {
    this.showAuditoria = false;
  }
  ocultarAuditoria() {
    this.showAuditoria = false;
  }

  validar(fuenteAutentica) {
    this.plex.showLoader();
    if (this.pacienteSelected.entidadesValidadoras.indexOf('sisa') < 0 && fuenteAutentica === 'sisa') {
      this.servicioSisa.get(this.pacienteSelected).subscribe(res => {
        this.verificarDatosFA(res, 'sisa');
        this.plex.hideLoader();
      });
    }
    if (this.pacienteSelected.entidadesValidadoras.indexOf('renaper') < 0 && fuenteAutentica === 'renaper') {
      this.servicioRenaper.get(this.pacienteSelected).subscribe(res => {
        this.verificarDatosFA(res, 'renaper');
        this.plex.hideLoader();
      });
    }
    if (this.pacienteSelected.estado !== 'validado') {
      if (this.datosFA && this.datosFA.matcheos && this.datosFA.matcheos.matcheo < 90) {
        this.checkPrestaciones();
      } else {
        this.rechazarValidacion();
      }
    }
  }


  operationLink(pacienteToFix, paciente) {
    this.patientToFix = pacienteToFix;
    this.patient = paciente;
    this.verDuplicados();
  }

  viewLinkedPatients(paciente) {
    this.verDuplicados();
    this.patient = paciente;
    this.patientToFix = null;
  }

  vincular() {
    if (this.permisoVincular) {
      if (!this.pacienteSelected) {
        return null;
      }
      this.showVincular = true;
      this.showAuditoria = false;
      this.router.navigate(['apps/mpi/auditoria/vincular-pacientes', { idPaciente: this.pacienteSelected.id }]);
    }
  }

  cancelar() {
    this.showCandidatos = false;
    this.showBuscador = false;
    this.showMensaje = false;
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
    if (fa === 'renaper') {
      this.pacienteSelected.nombre = this.datosFA.matcheos.datosPaciente.nombre;
      this.pacienteSelected.apellido = this.datosFA.matcheos.datosPaciente.apellido;
    }

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
    this.showAuditoria = true;
    this.showCandidatos = false;
    this.pacienteSelected = null;
    this.enableValidar = false;
    this.enableVincular = false;
    this.showBuscador = false;
    this.showMensaje = false;
    this.enableVinculados = false;
    this.searchClear();
    this.onLoadData();
  }

  searchStart() {
    this.pacientes = null;
    this.pacienteSelected = null;

  }

  searchEnd(resultado: PacienteBuscarResultado) {
    if (resultado.err) {
      this.plex.info('danger', resultado.err);
    } else {
      // Filtramos los pacientes que ya posean algo en el array de identificadores para evitar
      // anidamiento de linkeos
      this.pacientes = this.pacienteSelected ? resultado.pacientes.filter((pac: any) => (
        (this.pacienteSelected.id !== pac.id) && pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length < 1)) : resultado.pacientes;
    }
  }

  searchClear() {
    this.pacientes = null;
  }

  cancelVincular() {
    this.showVincular = false;
    this.showAuditoria = true;
    this.searchClear();

  }

  activar(pac: IPaciente, index: number) {
    if (this.permisoVincular) {
      this.pacienteService.setActivo(pac, true).subscribe(res => {
        this.plex.toast('success', 'Paciente Activado');
        this.getInactivos();
      });
    }
  }
  desactivar(pac: IPaciente, index: number) {
    if (this.permisoVincular) {
      // si el paciente tiene otros pacientes en su array de identificadores, no lo podemos desactivar
      if (pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length > 0) {
        this.plex.info('warning', 'Existen otros pacientes vinculados a este paciente', 'No Permitido');
      } else {
        this.pacienteService.setActivo(pac, false).subscribe(res => {
          this.pacientes.splice(index, 1);
          this.pacienteSelected = null;
          this.plex.toast('info', 'Paciente Desactivado');
        });
      }
    }
  }
}
