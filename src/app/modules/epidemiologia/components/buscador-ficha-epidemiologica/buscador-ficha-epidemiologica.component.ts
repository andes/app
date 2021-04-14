import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cache } from '@andes/shared';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { LocalidadService } from '../../../../services/localidad.service';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { ZonaSanitariaService } from '../../../../services/zonaSanitaria.service';

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
  public pacienteSelected: IPaciente;
  public query = null;
  public localidades$: Observable<any>;
  public zonaSanitaria$: Observable<any>;


  public columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      sorteable: true
    },
    {
      key: 'documento',
      label: 'Documento',
      sorteable: true
    },
    {
      key: 'paciente',
      label: 'Paciente',
      sorteable: true
    },
    {
      key: 'tipo',
      label: 'Tipo de ficha',
      sorteable: true
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sorteable: false
    }

  ];

  constructor(
    private plex: Plex,
    private formsService: FormsService,
    private formEpidemiologiaService: FormsEpidemiologiaService,
    private auth: Auth,
    private router: Router,
    private localidadService: LocalidadService,
    private zonaSanitariaService: ZonaSanitariaService,

  ) { }

  ngOnInit(): void {
    if (!this.auth.getPermissions('epidemiologia:?').length) {
      this.router.navigate(['inicio']);
    }
    this.puedeEditar = this.auth.check('epidemiologia:update');
    this.puedeVer = this.auth.check('epidemiologia:read');
    this.plex.updateTitle([
      { route: '/', name: 'EPIDEMIOLOGIA' },
      { name: 'Buscador Fichas epidemiologicas' }
    ]);
    this.dataType$ = this.formsService.search().pipe(
      cache()
    );
    this.localidades$ = this.localidadService.get({ codigo: 15 }).pipe(
      cache()
    );
    this.zonaSanitaria$ = this.zonaSanitariaService.search().pipe(
      cache()
    );
  }

  searchFichas() {
    this.query = {
      fechaCondicion: this.formEpidemiologiaService.queryDateParams(this.fechaDesde, this.fechaHasta),
      type: this.typeFicha?.name,
      paciente: this.pacienteSelected?.id,
      localidad: this.localidad?.nombre,
      organizacion: this.organizacion?.id,
      identificadorPcr: this.idPcr,
      zonaSanitaria: this.zonaSanitaria?._id
    };
    this.fichas$ = this.formEpidemiologiaService.search(this.query);
  }

  editarFicha(ficha) {
    this.paciente = ficha.paciente;
    this.fichaPaciente = ficha;
    this.showFicha = ficha.type;
    this.editFicha = true;
  }

  verFicha(ficha) {
    this.paciente = ficha.paciente;
    this.fichaPaciente = ficha;
    this.showFicha = ficha.type;
    this.editFicha = false;
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
  }
}
