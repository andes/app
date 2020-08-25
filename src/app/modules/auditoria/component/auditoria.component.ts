import { Plex } from '@andes/plex';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Subscription } from 'rxjs';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { VincularPacientesComponent } from './vincular-pacientes.component';
import { ModalCorreccionPacienteComponent } from './../component/modal-correccion-paciente.component';

@Component({
  selector: 'auditoria',
  templateUrl: 'auditoria.html',
  styleUrls: ['auditoria.scss']
})

export class AuditoriaComponent implements OnInit {

  @ViewChild('vincularComponent', null) vincularPacientes: VincularPacientesComponent;
  @ViewChild('modalCorreccion', null) modalCorreccion: ModalCorreccionPacienteComponent;

  // sidebar
  mainSize = 12;
  tituloSidebar = '';
  showDetallePaciente = false;
  showCabeceraDetalle = false;
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
  // reporte de errores
  pacientesReportados;
  corregirPaciente: Number = null;
  showReporteError = false; // se muestra en el sidebar datos del error reportado
  permisoEdicion: Boolean;
  permisoVincular: Boolean;

  constructor(
    public auth: Auth,
    private pacienteService: PacienteService,
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
    if (this.permisoEdicion) {
      this.getReportados(); // Si el usuario solo tiene permisos de edicion es necesario obtener los datos aquí
    }
    this.parametros = {
      skip: 0,
      limit: 10
    };
  }


  // REPORTE DE ERRORES -----------------------------------------

  // Aquellos pacientes que reportaron errores en sus datos personales
  getReportados() {
    const params = { reportarError: true, activo: true };
    this.pacienteService.getSearch(params).subscribe(resultado => {
      if (resultado) {
        this.pacientesReportados = resultado;
        this.corregirPaciente = null;
      }
    });
  }

  onSelectReportados(paciente: any): void {
    if (paciente) {
      this.pacienteSelected = paciente;
      this.showInSidebar('reporteError');
    } else {
      this.pacienteSelected = null;
    }
  }

  onSelectCorregir() {
    if (this.permisoEdicion) {
      this.modalCorreccion.show();
    } else {
      this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
    }
  }

  savePatient(paciente: IPaciente) {
    // si el paciente no debe ser modificado (cancelar) entonces es paciente=null
    if (paciente) {
      paciente.reportarError = false;
      paciente.notaError = '';
      if (!paciente.tipoIdentificacion) {
        paciente.tipoIdentificacion = null;
      }
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


  onSelect(paciente: any): void {
    this.pacienteSelected = paciente;
    this.showInSidebar('detallePaciente');
  }


  showInSidebar(opcion: string) {
    switch (opcion) {
      case 'detallePaciente':
        this.tituloSidebar = 'Detalle Paciente';
        this.showDetallePaciente = true;
        this.showCabeceraDetalle = false;
        this.showReporteError = false;
        this.vincularPacientes.close();
        this.mainSize = 8;
        break;
      case 'vinculaciones':
        this.tituloSidebar = 'Detalle Paciente';
        this.showDetallePaciente = false;
        this.showCabeceraDetalle = true;
        this.showReporteError = false;
        this.mainSize = 8;
        break;
      case 'reporteError':
        this.tituloSidebar = 'Descripción';
        this.showDetallePaciente = false;
        this.showReporteError = true;
        this.mainSize = 8;
        break;
      case 'vincular':
        this.tituloSidebar = 'Buscar candidato';
        this.showDetallePaciente = false;
        this.showCabeceraDetalle = false;
        this.mainSize = 8;
        break;
    }
  }

  closeSidebar() {
    this.mainSize = 12;
    this.pacienteSelected = null;
    this.showDetallePaciente = false;
    this.showCabeceraDetalle = false;
    this.showReporteError = false;
    this.vincularPacientes.close();
  }

  // VINCULACION Y ESTADO ACTIVO ----------------------------

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

  showVinculados(paciente: IPaciente) {
    // Actualizamos sidebar de vinculaciones
    this.pacienteSelected = paciente;
    this.showInSidebar('vinculaciones');
    this.vincularPacientes.loadVinculados(paciente);

    // Actualizamos resultados en panel principal
    this.buscar();
  }

  vincular(paciente: IPaciente) {
    if (this.permisoVincular) {
      this.pacienteSelected = paciente;
      this.showInSidebar('vincular');
      this.vincularPacientes.buscarCandidatos();
    } else {
      this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
    }
  }

  desvincular(paciente: IPaciente) {
    if (this.permisoVincular) {
      this.vincularPacientes.desvincular(paciente);
    } else {
      this.plex.info('warning', 'Usted no posee permisos para realizar esta acción.');
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
      if (resultado && resultado.length) {
        this.resultadoBusqueda = this.resultadoBusqueda.concat(resultado);
      }
      this.parametros.skip = resultado.length;
      // si vienen menos pacientes que {{ limit }} significa que ya se cargaron todos
      if (!resultado.length || resultado.length < this.parametros.limit) {
        this.scrollEnd = true;
      }
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

  onSearchClear() {
    this.searchClear = true;
    this.loading = false;
    this.resultadoBusqueda = [];
  }
}
