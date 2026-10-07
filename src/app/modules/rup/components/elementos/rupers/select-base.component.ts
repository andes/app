import { OnInit, Component, AfterViewInit } from '@angular/core';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { Observable, of } from 'rxjs';
import { RupElement } from '..';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 * addRegister: Agrega un nuevo registro por concepto seleccionado.
 * registerMapping: Listado de equivalencias { itemSelected, loadRegister, addToMolecule }.
 *                  itemSelected acepta el conceptId (select snomed) o el id de un select estático.
 *                  addToMolecule a nivel de cada mapeo sobreescribe el param global.
 * addToMolecule (param global): Si es true, el concepto dinámico se agrega dentro de la
 *                  molécula que contiene al select. Si es false (default), se agrega fuera.
 *
 * Nota sobre addToMoleculeInParams: alias de addToMolecule, mantenido por compatibilidad.
 */
@Component({
    selector: 'rup-select',
    template: ''
})
export class SelectBaseComponent extends RUPComponent implements OnInit, AfterViewInit {

    public idField = 'id';

    public labelField = 'nombre';

    public dataLoaded: any[] = [];

    public itemSelected: any | any[] = null;

    public otherEnabled: Boolean = false;

    private watch = false;

    /** conceptId del último concepto dinámico agregado vía addRegister (para select simple) */
    private _lastAddedConceptId: string | null = null;


    public otherText: String = '';

    get titulo() {
        if (this.params.title !== null && this.params.title !== undefined) {
            return this.params.title;
        } else {
            return this.registro.concepto.term;
        }
    }

    get allowOther() {
        if (this.params.allowOther !== null && this.params.allowOther !== undefined) {
            return this.params.allowOther;
        } else {
            return false;
        }
    }

    getData(input: string): Observable<any[]> {
        return of([]);
    }

    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }
        if (this.registro && this.registro.valor) {
            const value = this.registro.valor;
            if (Array.isArray(value)) {
                this.itemSelected = value;
            } else {
                if (value.id || value.conceptId) {
                    this.itemSelected = value;
                    this.otherEnabled = false;
                } else if (this.allowOther) {
                    this.otherEnabled = true;
                    this.otherText = value.nombre;
                }
            }
        }

        this.watch = this.params?.watch || false;

        if (this.watch && !this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                if (data.valor) {
                    this.itemSelected = { ...data.valor };
                    this.registro.valor = { ...data.valor };
                }
            });
        }

    }

    ngAfterViewInit() {
        if (this.params.preload) {
            this.getData(undefined).subscribe((data) => {
                this.dataLoaded = data;
            });
        }
    }

    displayName(item) {
        return item.nombre;
    }

    onValueChange() {
        if (!this.otherEnabled) {
            if (this.itemSelected) {
                this.registro.valor = this.itemSelected;
                if (this.params.addRegister) {
                    // Para select simple: eliminar el registro dinámico previamente agregado
                    // antes de agregar el nuevo, evitando acumulación de conceptos.
                    if (!this.params.multiple) {
                        this.removeLastAddedConcepto();
                    }

                    // verifico que no haya un listado de equivalencias para los conceptos
                    if (this.params.registerMapping) {
                        // el mapeo acepta conceptId (select snomed) o el id de un select estático
                        const mappedRegister = this.params.registerMapping.find(e => e.itemSelected === this.itemSelected.conceptId || e.itemSelected === this.itemSelected.id);
                        if (mappedRegister) {
                            // addToMolecule del mapeo tiene prioridad; luego el param global;
                            // si ninguno está definido, default false (agrega fuera de la molécula).
                            const addToMolecule = mappedRegister.addToMolecule ?? mappedRegister.addToMoleculeInParams ?? this.params.addToMolecule ?? this.params.addToMoleculeInParams ?? false;
                            this.addConcepto(mappedRegister.loadRegister, addToMolecule);
                        }
                    } else {
                        // se agrega un registro por concepto seleccionado
                        const addToMolecule = this.params.addToMolecule ?? this.params.addToMoleculeInParams ?? false;
                        this.addConcepto(this.itemSelected, addToMolecule);
                    }
                }
            } else {
                this.registro.valor = null;
            }
        } else {
            this.registro.valor = {
                nombre: this.otherText,
                id: null
            };
        }
        this.emitChange();
        this.addFact('value', this.registro.valor);
    }

    addConcepto(concepto: ISnomedConcept, addToMolecule = false) {
        if (addToMolecule) {
            // se agrega el concepto dentro de la molécula que contiene este registro
            const molecula = this.getMoleculaContenedora();
            if (molecula) {
                this._lastAddedConceptId = concepto.conceptId;
                this.ejecucionService.agregarConcepto(concepto, false, molecula.concepto);
                return;
            }
        }
        // addToMolecule=false (o no se encontró molécula): agrega fuera de la molécula
        this._lastAddedConceptId = concepto.conceptId;
        this.ejecucionService.agregarConcepto(concepto);
    }

    /**
     * Elimina el último concepto dinámico agregado por este select (select simple).
     * Busca el registro por conceptId en la lista de registros de la prestación
     * y lo quita del array correspondiente (raíz o dentro de la molécula contenedora).
     */
    private removeLastAddedConcepto() {
        if (!this._lastAddedConceptId || !this.ejecucionService) {
            return;
        }
        const conceptId = this._lastAddedConceptId;
        const prestacion = this.ejecucionService['prestacion'];
        if (!prestacion?.ejecucion?.registros) {
            return;
        }

        // Busca y elimina recursivamente en el árbol de registros
        const eliminarDeLista = (lista: any[]): boolean => {
            const idx = lista.findIndex(r => r.concepto?.conceptId === conceptId);
            if (idx !== -1) {
                lista.splice(idx, 1);
                this.ejecucionService.actualizar('eliminar');
                return true;
            }
            for (const reg of lista) {
                if (reg.registros?.length && eliminarDeLista(reg.registros)) {
                    return true;
                }
            }
            return false;
        };

        eliminarDeLista(prestacion.ejecucion.registros);
        this._lastAddedConceptId = null;
    }

    /**
     * Busca recursivamente la molécula (registro contenedor) dentro de la cual está
     * el registro de este select, para poder agregar el concepto dinámico adentro.
     */
    private getMoleculaContenedora() {
        if (!this.ejecucionService) {
            return null;
        }
        const registros = this.ejecucionService.getPrestacionRegistro();
        const buscar = (lista: any[]): any => {
            for (const registro of lista) {
                if (registro.registros && registro.registros.some(r => r.id === this.registro.id)) {
                    return registro;
                }
                const encontrado = buscar(registro.registros || []);
                if (encontrado) {
                    return encontrado;
                }
            }
            return null;
        };
        return buscar(registros);
    }

    @Unsubscribe()
    loadDatos(event) {
        if (!event) {
            return;
        }
        if (event.query && event.query.length > 2) {
            return this.getData(event.query).subscribe((data) => {
                event.callback(data);
            });
        } else {
            if (this.registro.valor && this.registro.valor.length) {
                event.callback(this.registro.valor);
            } else {
                event.callback([]);
            }
        }
    }


}
