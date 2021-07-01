import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { VacunasService } from 'src/app/services/vacunas.service';
import { Plex } from '@andes/plex';
import { map } from 'rxjs/operators';
import { cache } from '@andes/shared';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
})
export class LoteComponent implements OnInit {
  public vacunaSelected: any;
  public dosisSelected: any;
  public showSidebar = false;
  public vacunas$: Observable<any[]>;
  public lotes$: Observable<any[]>;
  public dosis$: Observable<any[]>;
  public esquemas$: Observable<any>;
  public creando = false;
  public detalle = false;
  public seEncuentra = false;
  public condicion = [];
  public mostrar;
  public mostrarEsquemas = false;
  public mostrarCondiciones = false;

  public loteSelected =
    {
      codigo: '',
      descripcion: '',
      habilitado: true,
      vacuna: null
    };

  constructor(
    private vacunasService: VacunasService,
    private plex: Plex
  ) { }

  ngOnInit(): void {
    this.vacunas$ = this.vacunasService.getNomivacVacunas({
      habilitado: true,
      calendarioNacional: 'NO',
      sort: 'nombre'
    });
  }

  showInSideBar(vacuna) {
    if (vacuna) {
      vacuna.id = vacuna._id;
      this.loteSelected.vacuna = vacuna;
      this.vacunaSelected = vacuna;
      this.showSidebar = true;
      this.loadLote();
      this.loadDosis();
      this.atras();
      // this.cerrar();
    }
  }

  loadLote() {
    this.lotes$ = this.vacunasService.getNomivacLotes({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  loadDosis() {
    this.dosis$ = this.vacunasService.getNomivacDosis({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  loadEsquemas() {
    this.esquemas$ = this.vacunasService.getNomivacEsquemas({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      codigo: this.dosisSelected.esquema.codigo,
      sort: 'codigo'
    });
    this.condicion = [];
    this.esquemas$.subscribe(r => {
      r.forEach(res => {
        this.condicion.push(res.condicion);
      });
    });
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  crearLote() {
    this.creando = true;
  }

  mostrarDosis(dosis) {
    // this.detalle = true;
    this.dosisSelected = dosis;
    this.loadEsquemas();
  }

  cerrar() {
    this.creando = false;
    this.limpiarForm();
  }

  atras() {
    this.detalle = false;
  }

  limpiarForm() {
    this.loteSelected.codigo = '';
    this.loteSelected.descripcion = '';
  }

  cambiarOpcion(opcion) {
    this.mostrar = opcion;
  }

  cargarEsquemas() {
    this.mostrarCondiciones = false;
    this.mostrarEsquemas = true;
  }

  cargarCondiciones() {
    this.mostrarEsquemas = false;
    this.mostrarCondiciones = true;
  }

  guardar() {
    this.seEncuentra = false;
    this.lotes$.subscribe(lotes => {
      this.seEncuentra = lotes.some(lote => lote.codigo.toUpperCase() === this.loteSelected.codigo.toUpperCase());
      if (this.seEncuentra) {
        this.plex.toast('danger', 'El lote que esta creando ya existe.');
      } else {
        this.vacunasService.guardarNomivacLotes(this.loteSelected).subscribe(resultado => {
          if (resultado) {
            this.plex.toast('success', 'Lote creado con éxito.');
            this.cerrar();
          }
        });
      }
    });
  }
}
