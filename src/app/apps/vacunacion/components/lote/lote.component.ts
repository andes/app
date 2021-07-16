import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { VacunasService } from 'src/app/services/vacunas.service';
import { Plex } from '@andes/plex';
import { map } from 'rxjs/operators';
import { cache } from '@andes/shared';
import { Console } from 'console';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
})
export class LoteComponent implements OnInit {
  public vacunaSelected: any;
  public dosisSeleccionada: any;
  public showSidebar = false;
  public vacunas$: Observable<any[]>;
  public lotes$: Observable<any[]>;
  public dosis$: Observable<any[]>;
  public esquemaNuevo$: Observable<any[]>;
  public esquemas$: Observable<any>;
  // public nombreDosis$: Observable<any[]>;
  public creando = false;
  public creandoDosis = false;
  public detalle = false;
  public seEncuentra = false;
  // public condicion = [];
  // public mostrar;
  // public mostrarEsquemas = false;
  public mostrarCondiciones = false;
  public columnasCondiciones = [
    {
      key: 'codigo',
      label: 'Codigo'
    },
    {
      key: 'nombre',
      label: 'Nombre'
    },
  ];

  public esquemaNuevo = [
    {
      id: 'id',
      codigo: 'codigo',
      nombre: 'nombre'
    }
  ];

  public dosisNombre = [
    {
      id: 1,
      nombre: '1ra Dosis'
    },
    {
      id: 2,
      nombre: '2da Dosis'
    }
  ];

  public loteSelected =
    {
      codigo: '',
      descripcion: '',
      habilitado: true,
      vacuna: null
    };

  public dosisSelected =
    {
      codigo: null,
      nombre: '',
      vacuna: null,
      esquema: null,
      habilitado: true
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
      this.dosisSelected.vacuna = vacuna;
      this.showSidebar = true;
      this.loadLote();
      this.loadDosis();
      this.cargarEsquema();
      this.atras();
      this.cerrar();
    }
  }

  cargarEsquema() {
    this.esquemaNuevo$ = this.vacunasService.getNomivacEsquemas({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
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
      codigo: this.dosisSeleccionada.esquema.codigo,
      sort: 'codigo'
    });
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  crearLote() {
    this.creando = true;
  }

  crearDosis() {
    this.creandoDosis = true;
  }

  mostrarDosis(dosis) {
    this.dosisSeleccionada = dosis;
    this.loadEsquemas();
  }

  cerrar() {
    this.creando = false;
    this.creandoDosis = false;
    this.limpiarForm();
  }

  atras() {
    this.detalle = false;
  }

  limpiarForm() {
    this.loteSelected.codigo = '';
    this.loteSelected.descripcion = '';
    this.dosisSelected.codigo = '';
    this.dosisSelected.nombre = null;
    this.dosisSelected.esquema = null;
  }

  mostrarCondicion() {
    this.mostrarCondiciones = true;
  }

  cerrarCondicion() {
    this.mostrarCondiciones = false;
  }

  cargarCondiciones(codigo, nombre) {
    this.esquemas$ = this.vacunasService.getNomivacEsquemas({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      codigo: codigo,
      nombre: nombre,
      sort: 'codigo'
    });
    this.mostrarCondiciones = true;
  }

  guardarLote() {
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
  guardarDosis() {
    let arre = Object.values(this.dosisSelected.nombre);
    this.dosisSelected.nombre = arre[1];
    this.vacunasService.guardarNomivacDosis(this.dosisSelected).subscribe(resultado => {
      if (resultado) {
        this.plex.toast('success', 'Dosis creada con éxito.');
        this.cerrar();
      }
    });
  }
}
