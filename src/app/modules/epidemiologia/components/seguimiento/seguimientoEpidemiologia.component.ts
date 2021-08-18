import { cache } from '@andes/shared';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { SeguimientoPacientesService } from '../../services/seguimiento-pacientes.service';
import { Auth } from '@andes/auth';
import { SemaforoService } from 'src/app/modules/semaforo-priorizacion/service/semaforo.service';

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
  actualizacionSeguimiento;
  organizacion;
  opcionesSemaforo;

  constructor(
    private seguimientoPacientesService: SeguimientoPacientesService,
    private route: ActivatedRoute,
    private elementosRUPService: ElementosRUPService,
    private prestacionesService: PrestacionesService,
    private router: Router,
    private semaforoService: SemaforoService,
    private auth: Auth) {
  }

  ngOnInit(): void {
    this.estadosSeguimiento = [
      { id: 'pendiente', nombre: 'Pendiente' },
      { id: 'seguimiento', nombre: 'Seguimiento' },
      { id: 'alta', nombre: 'De Alta' },
      { id: 'fallecido', nombre: 'Fallecido' }
    ];
    this.organizacion = this.auth.organizacion;
    this.semaforoService.findByName('seguimiento-epidemiologico').subscribe(res => this.opcionesSemaforo = res.options);
  }

  volverInicio() {
    this.router.navigate(['../epidemiologia'], { relativeTo: this.route });
  }

  buscar() {
    this.query = {
      fechaInicio: this.seguimientoPacientesService.queryDateParams(this.fechaDesde, this.fechaHasta),
      estado: this.estado?.id,
      organizacionSeguimiento: this.organizacion?.id,
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
            this.closeSideBar();
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
    this.actualizacionSeguimiento = false;
    this.seguimiento = _seguimiento;
  }

  actualizarSeguimiento(_seguimiento) {
    this.selectSeguimiento(_seguimiento);
    this.actualizacionSeguimiento = true;
  }

  closeSideBar() {
    this.seguimiento = null;
    this.actualizacionSeguimiento = false;
  }

  reload() {
    this.closeSideBar();
    this.buscar();
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

  getColorPrioridad(prioridad) {
    return prioridad ? this.opcionesSemaforo.find(x => x.id === prioridad)?.itemRowStyle : false;
  }
}
