import { Plex } from '@andes/plex';
import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { AgendaService } from './../../services/turnos/agenda.service';
import { SisaService } from '../../services/fuentesAutenticas/servicioSisa.service';
import { RenaperService } from '../../services/fuentesAutenticas/servicioRenaper.service';
import { PacienteBuscarResultado } from '../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../core/mpi/interfaces/IPaciente';
import { Observable, of, Subscription } from 'rxjs';
import { PacienteService } from '../../core/mpi/services/paciente.service';
import { VincularPacientesComponent } from './vincular-pacientes.component';

@Component({
  selector: 'auditoria',
  templateUrl: 'auditoria.html',
  styleUrls: ['auditoria.scss']
})

export class AuditoriaComponent implements OnInit {

  @ViewChild('vincularComponent', null) vincularPacientes: VincularPacientesComponent;

  // sidebar
  mainSize = 12;
  tituloSidebar = '';
  showVinculaciones = false;
  showDetallePaciente = false;
  showCabeceraDetalle = false;
  showVincularPacientes = false;
  // busqueda
  textoLibre: string = null;
  resultadoBusqueda: IPaciente[] = null;
  pacienteSelected: IPaciente = null;
  listaVinculados: IPaciente[] = [];
  loading = false;
  searchClear = true;
  parametros;
  scrollEnd = false;
  searchSubscription = new Subscription();

  pacientesInactivos$: Observable<IPaciente[]> = of([]);
  pacientesReportados;
  showVincular = false;
  showCandidatos = false;
  enableVincular = false;
  showBuscador = false;
  showMensaje = false;
  // posicion del paciente a modificar (reporte de errores) // vr si serve de algo esta varuable ahora
  corregirPaciente: Number = null;
  showBotonesReporte = false; // aparenemnete  muestra la vieja patalla para corregir los pacientes (sería el modal ahora)
  public showModalCorregir = false;
  showReporteError = false; // se muestra en el sidebar datos del error reportado
  permisoEdicion: Boolean;
  permisoVincular: Boolean;

  constructor(
    public auth: Auth,
    private pacienteService: PacienteService,
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
    if (this.permisoEdicion) { // if (this.permisoEdicion && !this.permisoVincular) {
      this.getReportados(); // Si el usuario solo tiene permisos de edicion es necesario obtener los datos aquí
    }
    this.parametros = {
      skip: 0,
      limit: 10
    };
  }

  showVinculados(paciente: IPaciente) {
    this.pacienteSelected = paciente;
    this.showInSidebar('vinculaciones');
    this.vincularPacientes.loadVinculados(paciente);
  }

  // Aquellos pacientes que reportaron errores en sus datos personales
  getReportados() { // ver tema d elos permisos, capaz algunos pacientes no deberían ver esa pestaña directamente
    const params = { reportarError: true, activo: true };
    this.pacienteService.getSearch(params).subscribe(resultado => {
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
        this.showInSidebar('reporteError');
      } else {
        this.pacienteSelected = null;
      }
    }
  }

  onSelectCorregir(index, paciente) {
    if (this.permisoEdicion) {
      this.showModalCorregir = true;
    }
  }

  savePatient(paciente: any) {
    this.showModalCorregir = false;
    // si el paciente no debe ser modificado (cancelar) entonces es null
    if (paciente) {
      paciente.reportarError = false;
      paciente.notaError = '';
      this.pacienteService.save(paciente).subscribe((respSave: any) => {

        if (respSave && !respSave.errors) {
          // Si el matcheo es alto o el dni-sexo está repetido no se permite guardar el paciente
          if (respSave.macheoAlto && respSave.dniRepetido) {
            this.plex.info('danger', 'Existen pacientes similares, el paciente no puede ser modificado hasta que sea vinculado');
          } else {
            this.pacienteSelected = respSave;
            this.plex.toast('success', 'Los datos se actualizaron correctamente!');
          }

        } else {
          this.plex.toast('danger', 'No es posible actualizar el paciente');
        }
        this.closeSidebar();
        this.getReportados();
      });
    }
  }

  // guardarCorreccion(): void {
  //   this.plex.confirm('Desea continuar?', 'La información que está por cambiar modificará información sensible del paciente y tendrá repercusión en su Historia de Salud.').then((confirmar) => {
  //     if (confirmar) {
  //       this.pacienteSelected.reportarError = false;
  //       this.pacienteSelected.notaError = '';
  //       this.corregirPaciente = null;
  //       this.showBotonesReporte = false;
  //       this.auditoriaService.save(this.pacienteSelected).subscribe(() => {
  //         this.pacienteSelected = null;
  //         this.getReportados();
  //       });
  //     }
  //   });
  // }

  onSelect(paciente: any): void {
    this.pacienteSelected = paciente;
    this.showInSidebar('detallePaciente');
  }

  // onSelectVinculados(paciente: any): void {
  //   if (paciente.id) {
  //     this.auditoriaService.findById(paciente.id).subscribe(pac => {
  //       this.pacienteSelected = pac;
  //       this.showDetallePaciente = false;
  //       this.enableVinculados = true;
  //     });
  //   }
  // }

  showInSidebar(opcion: string) {
    switch (opcion) {
      case 'detallePaciente':
        this.tituloSidebar = 'Detalle Paciente';
        this.showDetallePaciente = true;
        this.showVinculaciones = false;
        this.showCabeceraDetalle = false;
        this.showVincularPacientes = false;
        this.showReporteError = false;
        this.mainSize = 8;
        break;
      case 'vinculaciones':
        this.tituloSidebar = 'Detalle Paciente';
        this.showDetallePaciente = false;
        this.showVinculaciones = true;
        this.showCabeceraDetalle = true;
        this.showVincularPacientes = true;
        this.showReporteError = false;
        this.mainSize = 8;
        break;
      case 'reporteError':
        this.showDetallePaciente = false;
        this.showVinculaciones = false;
        this.showReporteError = true;
        this.mainSize = 8;
        break;
      case 'vincular':
        this.tituloSidebar = 'Buscar candidato';
        this.showDetallePaciente = false;
        this.showVinculaciones = false;
        this.showCabeceraDetalle = false;
        this.showVincularPacientes = true;
        this.mainSize = 6;
        break;
    }
  }

  closeSidebar() {
    this.mainSize = 12;
    this.pacienteSelected = null;
    this.showDetallePaciente = false;
    this.showCabeceraDetalle = false;
    this.showVinculaciones = false;
    this.showVincularPacientes = false;
    this.showReporteError = false;
  }

  // verDuplicados() {
  //   this.showAuditoria = false;
  // }

  // operationLink(pacienteToFix, paciente) {
  //   this.patientToFix = pacienteToFix;
  //   this.patient = paciente;
  //   this.verDuplicados();
  // }

  // viewLinkedPatients(paciente) {
  //   this.verDuplicados();
  //   this.patient = paciente;
  //   this.patientToFix = null;
  // }

  // cancelVincular() {

  //   this.searchClear();

  // }

  setEstadoActivo([paciente, activo]: [IPaciente, boolean]) {
    if (this.permisoVincular) {
      // si el paciente tiene otros pacientes en su array de identificadores, no lo podemos desactivar
      if (paciente.identificadores && paciente.identificadores.filter(identificador => identificador.entidad === 'ANDES').length) {
        this.plex.info('warning', 'Existen otros pacientes vinculados a este paciente', 'No Permitido');
        return;
      }
      this.pacienteService.setActivo(paciente, activo).subscribe(res => {
        (activo) ? this.plex.toast('success', 'Paciente Activado') : this.plex.toast('info', 'Paciente Desactivado');
      });
    }
  }

  // llama al componente vincularPacientes según corresponda
  vincular([paciente, vincular]: [IPaciente, boolean]) {
    if (this.permisoVincular) {
      this.pacienteSelected = paciente;
      // vincular o desvincular un paciente?
      if (vincular) {
        this.showInSidebar('vincular');
        this.vincularPacientes.buscarCandidatos();
      } else {
        this.vincularPacientes.desvincular(paciente);
      }
    }
  }


  // BUSQUEDA DE PACIENTES ------------------------------------------------


  buscar(resetParams = true) {
    if (resetParams) {
      this.resultadoBusqueda = [];
      this.parametros.skip = 0;
      this.scrollEnd = false;
    }

    if (!this.textoLibre || !this.textoLibre.length) {
      this.onSearchClear();
      return;
    }
    let busqueda = this.textoLibre.trim();
    let params = {
      cadenaInput: busqueda,
      skip: this.parametros.skip,
      limit: this.parametros.limit
    };

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.searchSubscription = this.pacienteService.getSearch(params).subscribe((resultado: any) => {
      if (this.resultadoBusqueda && this.resultadoBusqueda.length) {
        resultado = this.resultadoBusqueda.concat(resultado);
      }
      this.parametros.skip = resultado.length;
      // si vienen menos pacientes que {{ limit }} significa que ya se cargaron todos
      if (!resultado.length || resultado.length < this.parametros.limit) {
        this.scrollEnd = true;
      }
      this.onSearchEnd({ pacientes: resultado, err: null });
    });
  }


  /**
   * Recibe el último resultado emitido y le realiza una nueva búsqueda por texto
   * retornando ambos resultados concatenados
   */
  public onScroll() {
    if (!this.scrollEnd) {
      this.buscar(false);
    }
  }


  onSearchStart() {
    this.pacienteSelected = null;
    this.searchClear = false;
    this.loading = true;
    this.closeSidebar();
  }

  onSearchEnd(resultado: PacienteBuscarResultado) {
    this.loading = false;
    if (resultado.err) {
      this.plex.info('danger', resultado.err);
    } else {
      // Filtramos los pacientes que ya posean algo en el array de identificadores para evitar
      // anidamiento de linkeos
      this.resultadoBusqueda = this.pacienteSelected ? resultado.pacientes.filter((pac: any) => (
        (this.pacienteSelected.id !== pac.id) && pac.identificadores && pac.identificadores.filter(identificador => identificador.entidad === 'ANDES').length < 1)) : resultado.pacientes;
    }
  }

  onSearchClear() {
    this.searchClear = true;
    this.loading = false;
    this.resultadoBusqueda = [];
  }
}
