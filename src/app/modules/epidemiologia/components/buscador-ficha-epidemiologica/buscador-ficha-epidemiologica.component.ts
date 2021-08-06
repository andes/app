import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { LocalidadService } from '../../../../services/localidad.service';
import { ZonaSanitariaService } from '../../../../services/zonaSanitaria.service';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';

@Component({
  selector: 'app-buscador-ficha-epidemiologica',
  templateUrl: './buscador-ficha-epidemiologica.component.html'
})

export class BuscadorFichaEpidemiologicaComponent implements OnInit {
  public fechaDesde: Date;
  public fechaHasta: Date;
  public typeFicha = null;
  public localidad = null;
  public organizacion = null;
  public zonaSanitaria = null;
  public idPcr = null;
  public idClasificacion = null;
  public idTipoConfirmacion = null;
  public idClasificacionFinal = null;
  public dataType$: Observable<any>;
  public fichas$: Observable<any>;
  public showFicha = false;
  public paciente: IPaciente;
  public fichaPaciente;
  public resultadoBusqueda = [];
  public showBusquedaPaciente = false;
  public editFicha = false;
  public puedeEditar: boolean;
  public puedeVer: boolean;
  public puedeVerHistorial: boolean;
  public pacienteSelected: IPaciente;
  public query = null;
  public localidades$: Observable<any>;
  public zonaSanitaria$: Observable<any>;
  public listado: any[];
  public lastResults = new BehaviorSubject<any[]>(null);
  public inProgress = false;
  public fichaHistorial;
  public codigoSISAEdit;
  public codigoSisa;
  public collapse = false;
  public registroSisaOpts = [
    { id: 'noSISA', nombre: 'Sin registro SISA' },
    { id: 'SISA', nombre: 'Con registro SISA' },
  ];
  public clasificacion = [
    { id: 'casoSospechoso', nombre: 'Caso sospechoso' },
    { id: 'contactoEstrecho', nombre: 'Contacto estrecho' },
    { id: 'otrasEstrategias', nombre: 'Otras estrategias' },
    { id: 'controlAlta', nombre: 'Control de alta' }
  ];
  public tipoConfirmacion = [
    { id: 'confirmado', nombre: 'Criterio clínico epidemiológico (Nexo)' },
    { id: 'antigeno', nombre: 'Antígeno' },
    { id: 'pcr', nombre: 'PCR-RT' },
    { id: 'lamp', nombre: 'LAMP(NeoKit)' }
  ];
  public clasificacionFinal = [
    { id: 'Confirmado', nombre: 'Confirmado' },
    { id: 'Sospechoso', nombre: 'Sospechoso' },
    { id: 'Descartado', nombre: 'Descartado' }
  ];
  public filtrarSISA;
  public permisoHuds = false;
  public columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime()
    },
    {
      key: 'documento',
      label: 'Documento',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.paciente.documento.localeCompare(b.paciente.documento)
    },
    {
      key: 'paciente',
      label: 'Paciente',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => {
        const nameA = `${a.paciente.apellido} ${a.paciente.nombre}`;
        const nameB = `${b.paciente.apellido} ${b.paciente.nombre}`;
        return nameA.localeCompare(nameB);
      }
    },
    {
      key: 'tipo',
      label: 'Tipo de ficha',
      sorteable: true,
      opcional: true,
      sort: (a: any, b: any) => a.type.name.localeCompare(b.type.name)
    },
    {
      key: 'pcr',
      label: 'PCR',
      sorteable: false,
      opcional: true
    },
    {
      key: 'clasificacion',
      label: 'Clasificación',
      opcional: true,
      sorteable: false
    },
    {
      key: 'acciones',
      label: 'Acciones',
      opcional: false,
      sorteable: false
    },
    {
      key: 'sisa',
      label: 'Registro SISA',
      opcional: true,
      sorteable: false,
      right: true
    }
  ];
  colsVisibles = {
    'fecha': true,
    'documento': true,
    'paciente': true,
    'tipo': false,
    'clasificacion': false,
    'acciones': true,
    'sisa': true,
    'pcr': true
  };

  constructor(
    private plex: Plex,
    private formsService: FormsService,
    private formEpidemiologiaService: FormsEpidemiologiaService,
    private auth: Auth,
    private router: Router,
    private localidadService: LocalidadService,
    private zonaSanitariaService: ZonaSanitariaService,
    private pacienteService: PacienteService,
    private motivoAccesoService: ModalMotivoAccesoHudsService
  ) { }

  ngOnInit(): void {
    if (!this.auth.getPermissions('epidemiologia:?').length) {
      this.router.navigate(['inicio']);
    }
    this.permisoHuds = this.auth.check('huds:visualizacionHuds');
    this.puedeEditar = this.auth.check('epidemiologia:update');
    this.puedeVer = this.auth.check('epidemiologia:read');
    this.puedeVerHistorial = this.auth.check('epidemiologia:historial');
    this.plex.updateTitle([
      { route: '/', name: 'EPIDEMIOLOGIA' },
      { name: 'Buscador Fichas epidemiologicas' }
    ]);
    this.dataType$ = this.formsService.search();
    this.localidades$ = this.localidadService.get({ codigo: 15 });
    this.zonaSanitaria$ = this.zonaSanitariaService.search();
  }

  searchFichas() {
    this.inProgress = true;
    this.query = {
      fechaCondicion: this.formEpidemiologiaService.queryDateParams(this.fechaDesde, this.fechaHasta),
      type: this.typeFicha?.name,
      paciente: this.pacienteSelected?.id,
      localidad: this.localidad?.id,
      organizacion: this.organizacion?.id,
      identificadorPcr: this.idPcr,
      tipoConfirmacion: this.idTipoConfirmacion?.id,
      zonaSanitaria: this.zonaSanitaria?._id,
      clasificacionFinal: this.idClasificacionFinal?.id,
      skip: 0,
      limit: 15
    };


    if (this.idClasificacion) {
      this.query.clasificacion = this.idClasificacion.id;
    }

    if (this.filtrarSISA) {
      this.query.codigoSisa = this.filtrarSISA.id === 'SISA';
    }

    this.lastResults.next(null);
    this.fichas$ = this.lastResults.pipe(
      switchMap(lastResults => {
        if (!lastResults) {
          this.query.skip = 0;
        }
        return this.formEpidemiologiaService.search(this.query).pipe(
          map(resultados => {
            resultados.forEach(ficha => {
              const seccionClasificacion = ficha.secciones.find(seccion => seccion.name === 'Tipo de confirmación y Clasificación Final');
              const idPcr = seccionClasificacion?.fields.find(field => field.identificadorpcr)?.identificadorpcr;
              ficha.idPcr = idPcr ? idPcr : 'Sin PCR';
            });
            this.listado = lastResults ? lastResults.concat(resultados) : resultados;
            this.query.skip = this.listado.length;
            this.inProgress = false;
            return this.listado;
          })
        );
      }),
      cache()
    );
  }

  editarVerFicha(ficha, edit) {
    if (!ficha.ficha && this.fichaHistorial) {
      this.fichaHistorial = null;
    }
    const fichaView = ficha.ficha ? ficha.ficha : ficha;
    this.pacienteService.getById(fichaView.paciente.id).subscribe(pac => {
      this.paciente = pac;
      this.fichaPaciente = fichaView;
      this.showFicha = fichaView.type.name;
      this.editFicha = edit;
    });
  }

  volver() {
    this.showFicha = null;
  }

  searchEnd(resultado) {
    if (resultado.err) {
      this.plex.info('danger', resultado.err);
      return;
    }
    this.resultadoBusqueda = resultado.pacientes;
  }

  onSearchClear() {
    this.resultadoBusqueda = [];
  }

  onSelect(paciente: IPaciente): void {
    this.pacienteSelected = paciente;
    this.onSearchClear();
  }

  resetPacienteSelected() {
    this.pacienteSelected = null;
    this.listado = [];
    this.fichas$ = null;
  }

  onScroll() {
    if (this.query.skip > 0 && this.query.skip % this.query.limit === 0) {
      this.lastResults.next(this.listado);
    }
  }

  verHistorial(ficha) {
    this.fichaHistorial = ficha;
    this.codigoSISAEdit = false;
    this.codigoSisa = null;
  }

  clearHistorial() {
    this.fichaHistorial = null;
  }

  editarCodigoSISA(ficha, _codigoSisa) {
    this.fichaPaciente = ficha;
    this.codigoSISAEdit = true;
    this.codigoSisa = _codigoSisa;
    this.fichaHistorial = null;
  }

  confirmSisa() {
    return this.codigoSisa ?
      this.guardarSisa() :
      this.plex.confirm('¿Desea continuar?', 'Está a punto de blanquear el código SISA de la ficha.').then(
        r => r ? this.guardarSisa() : null
      );
  }

  private guardarSisa() {
    const secciones = this.fichaPaciente.secciones;
    let seccionOperaciones = secciones.find(s => s.name === 'Operaciones');

    if (!seccionOperaciones) {
      seccionOperaciones = {
        name: 'Operaciones',
        fields: []
      };
      secciones.push(seccionOperaciones);
    }

    let fieldSisa = seccionOperaciones.fields.find(f => (f.codigoSisa ? true : false));
    if (!fieldSisa) {
      fieldSisa = {
        codigoSisa: null
      };
      seccionOperaciones.fields.push(fieldSisa);
    }

    fieldSisa.codigoSisa = this.codigoSisa;

    this.codigoSISAEdit = false;

    this.formEpidemiologiaService.update(this.fichaPaciente.id, { secciones }).subscribe(() => {
      this.fichaPaciente.codigoSisa = this.codigoSisa;
      this.fichaPaciente = null;
      this.plex.toast('success', 'Código SISA registrado correctamente', 'Ficha actualizada', 300);
      this.searchFichas();
    });
  }

  cancelarSisa() {
    this.codigoSISAEdit = false;
  }

  verHuds(pacienteId) {
    this.motivoAccesoService.getAccessoHUDS(this.paciente).subscribe(motivo => {
      if (motivo) {
        this.router.navigate(['/huds/paciente/', pacienteId]);
      }
    });
  }
  changeCollapse(event) {
    this.collapse = event;
  }
}
