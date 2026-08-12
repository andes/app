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
 * registerMapping: Listado de equivalencias { itemSelected, loadRegister }.
 *                  itemSelected acepta el conceptId (select snomed) o el id de un select estático.
 * addToMolecule: Agrega el concepto dentro de la molécula que contiene al select.
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
                    // verifico que no haya un listado de equivalencias para los conceptos
                    if (this.params.registerMapping) {
                        // el mapeo acepta conceptId (select snomed) o el id de un select estático
                        const mappedRegister = this.params.registerMapping.find(e => e.itemSelected === this.itemSelected.conceptId || e.itemSelected === this.itemSelected.id);
                        if (mappedRegister) {
                            const addToMolecule = mappedRegister.addToMolecule ?? mappedRegister.addToMoleculeInParams ?? this.params.addToMolecule ?? this.params.addToMoleculeInParams;
                            this.addConcepto(mappedRegister.loadRegister, addToMolecule);
                        }
                    } else {
                        // se agrega un registro por concepto seleccionado
                        const addToMolecule = this.params.addToMolecule ?? this.params.addToMoleculeInParams;
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
        const molecula = this.getMoleculaContenedora();
        if (addToMolecule || (this.params.addRegister && molecula)) {
            // se agrega el concepto dentro de la molécula que contiene este registro
            if (molecula) {
                this.ejecucionService.agregarConcepto(concepto, false, molecula.concepto);
                return;
            }
        }
        this.ejecucionService.agregarConcepto(concepto);
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
