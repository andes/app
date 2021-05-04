import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cache } from '@andes/shared';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { LocalidadService } from '../../../../services/localidad.service';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { ZonaSanitariaService } from '../../../../services/zonaSanitaria.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

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
  public puedeVerHistorial: boolean;
  public pacienteSelected: IPaciente;
  public query = null;
  public localidades$: Observable<any>;
  public zonaSanitaria$: Observable<any>;
  public listado: any[];
  public lastResults = new BehaviorSubject<any[]>(null);
  public inProgress = false;
  public fichaHistorial;

  public columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      sorteable: true,
      sort: (a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime()
    },
    {
      key: 'documento',
      label: 'Documento',
      sorteable: true,
      sort: (a: any, b: any) => a.paciente.documento.localeCompare(b.paciente.documento)
    },
    {
      key: 'paciente',
      label: 'Paciente',
      sorteable: true,
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
      sort: (a: any, b: any) => a.type.name.localeCompare(b.type.name)
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
    private pacienteService: PacienteService
  ) { }

  ngOnInit(): void {
    if (!this.auth.getPermissions('epidemiologia:?').length) {
      this.router.navigate(['inicio']);
    }
    this.puedeEditar = this.auth.check('epidemiologia:update');
    this.puedeVer = this.auth.check('epidemiologia:read');
    this.puedeVerHistorial = this.auth.check('epidemiologia:historial');
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
    this.inProgress = true;
    this.query = {
      fechaCondicion: this.formEpidemiologiaService.queryDateParams(this.fechaDesde, this.fechaHasta),
      type: this.typeFicha?.name,
      paciente: this.pacienteSelected?.id,
      localidad: this.localidad?.nombre,
      organizacion: this.organizacion?.id,
      identificadorPcr: this.idPcr,
      zonaSanitaria: this.zonaSanitaria?._id,
      skip: 0,
      limit: 15
    };
    this.lastResults.next(null);
    this.fichas$ = this.lastResults.pipe(
      switchMap(lastResults => {
        if (!lastResults) {
          this.query.skip = 0;
        }
        return this.formEpidemiologiaService.search(this.query).pipe(
          map(resultados => {
            if (resultados) {
              this.listado = lastResults ? lastResults.concat(resultados) : resultados;
              this.query.skip = this.listado.length;
            } else {
              this.listado = [];
            }
            this.inProgress = false;
            return this.listado;
          })
        );
      })
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
  }

  clearHistorial() {
    this.fichaHistorial = null;
  }
}
