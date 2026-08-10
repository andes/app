import { OnInit, Component, AfterViewInit } from '@angular/core';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { Observable, of } from 'rxjs';
import { RupElement } from '..';
import { ISnomedConcept } from '../../../interfaces/snomed-concept.interface';
import { IPrestacionRegistro } from '../../../interfaces/prestacion.registro.interface';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 * addRegister: Agrega un registro por concepto seleccionado.
 * registerMapping: Listado de equivalencias entre el item seleccionado (conceptId o id de un select estático)
 *          y el concepto que se debe cargar. Cada entrada puede definir "inMolecule" para cargar el concepto
 *          dentro de la molécula actual.
 * addRegisterInMolecule: Si está activo, el concepto agregado se carga dentro de la molécula actual.
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
                const hasAddRegister = this.params.addRegister || this.params.addRegitry;
                const inMoleculeGlobal = this.params.addRegisterInMolecule || this.params.addRegitryInMolecule;
                if (hasAddRegister) {
                    // verifico que no haya un listado de equivalencias para los conceptos
                    if (this.params.registerMapping) {
                        // el item seleccionado puede ser un concepto snomed (conceptId) o un item de un select estático (id)
                        const itemId = this.itemSelected.conceptId || this.itemSelected.id;
                        const mappedRegister = this.params.registerMapping.find(e => e.itemSelected === itemId);
                        if (mappedRegister) {
                            this.addConcepto(mappedRegister.loadRegister, mappedRegister.inMolecule || inMoleculeGlobal);
                        }
                    } else {
                        // se agrega un registro por concepto seleccionado
                        this.addConcepto(this.itemSelected, inMoleculeGlobal);
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

    addConcepto(concepto: ISnomedConcept, inMolecule = false) {
        const molecula = this.getMoleculeRegistro();
        if (inMolecule && this.ejecucionService) {
            if (molecula) {
                this.ejecucionService.agregarConcepto(
                    concepto,
                    false,
                    molecula.concepto
                );
                return;
            }

        }


        this.ejecucionService.agregarConcepto(concepto);
    }

    private getMoleculeRegistro(): IPrestacionRegistro {
        const esMolecula = (registro: IPrestacionRegistro): boolean => {
            const elemento = registro.elementoRUP ? this.elementosRUPService.cacheById[registro.elementoRUP] : null;
            return elemento?.componente === 'MoleculaBaseComponent';
        };

        // Recorre el árbol de registros de la prestación buscando el ancestro más
        // cercano del select que sea una molécula (comparamos por ID y por referencia).
        const recorrer = (registro: IPrestacionRegistro, ancestros: IPrestacionRegistro[]): IPrestacionRegistro => {
            const hijos = registro.registros || [];
            for (const sub of hijos) {
                if (sub === this.registro || sub.id === this.registro.id) {
                    // el select está dentro de `registro`; retornamos el ancestro molécula más cercano
                    return esMolecula(registro) ? registro : ancestros.find(a => esMolecula(a)) || null;
                }
                const encontrado = recorrer(sub, [registro, ...ancestros]);
                if (encontrado) { return encontrado; }
            }
            return null;
        };

        for (const registro of (this.prestacion?.ejecucion?.registros || [])) {
            const encontrado = recorrer(registro, []);
            if (encontrado) { return encontrado; }
        }
        return null;
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
