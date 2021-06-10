import { cache } from '@andes/shared';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { SeguimientoPacientes } from '../../services/seguimiento-pacientes.service';

@Component({
  selector: 'seguimiento-epidemiologia',
  templateUrl: 'seguimientoEpidemiologia.html',
  encapsulation: ViewEncapsulation.None
})
export class SeguimientoEpidemiologiaComponent implements OnInit {
  showSideBar;
  listado;
  seguimientos$;
  seguimiento;
  fechaDesde;
  fechaHasta;
  estado;
  estadosSeguimiento;
  inProgress;
  documento;
  query;
  lastResults = new BehaviorSubject<any[]>(null);
  selectedLlamado;

  constructor(
    private seguimientoPacientesService: SeguimientoPacientes,
    private route: ActivatedRoute,
    private elementosRUPService: ElementosRUPService,
    private prestacionesService: PrestacionesService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.estadosSeguimiento = [
      { id: 'pendiente', nombre: 'Pendiente' },
      { id: 'seguimiento', nombre: 'Seguimiento' },
      { id: 'alta', nombre: 'De Alta' },
      { id: 'fallecido', nombre: 'Fallecido' }
    ];
  }

  volverInicio() {
    this.router.navigate(['../epidemiologia'], { relativeTo: this.route });
  }

  buscar() {
    this.query = {
      fechaInicio: this.seguimientoPacientesService.queryDateParams(this.fechaDesde, this.fechaHasta),
      estado: this.estado?.id,
      paciente: this.documento,
      sort: '-score.value score.fecha',
      limit: 20
    };

    this.inProgress = true;
    this.lastResults.next(null);
    this.seguimientos$ = this.lastResults.pipe(
      switchMap(lastResults => {
        if (!lastResults) {
          this.query.skip = 0;
        }
        return this.seguimientoPacientesService.search(this.query).pipe(
          map(resultados => {
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

  onScroll() {
    if (this.query.skip > 0 && this.query.skip % this.query.limit === 0) {
      this.lastResults.next(this.listado);
    }
  }

  selectSeguimiento(_seguimiento) {
    this.seguimiento = _seguimiento;
  }

  returnDetalle() {
    this.seguimiento = null;
  }

  iniciarSeguimiento(seguimiento) {
    const concepto = this.elementosRUPService.getConceptoSeguimientoCOVID();
    let nuevaPrestacionSeguimiento = this.prestacionesService.inicializarPrestacion(seguimiento.paciente, concepto, 'ejecucion', 'ambulatorio');
    this.prestacionesService.post(nuevaPrestacionSeguimiento).subscribe(prestacion => {
      this.prestacionesService.notificaRuta({ nombre: 'SEGUIMIENTO', ruta: 'epidemiologia/seguimiento' });
      this.router.navigate(['/rup/ejecucion', prestacion.id]);
    });
  }

  verLlamado($event) {
    this.selectedLlamado = $event;
  }
}
