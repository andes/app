import { Pipe, PipeTransform } from '@angular/core';
import { ElementosRUPService } from '../services/elementosRUP.service';

@Pipe({
    name: 'elementoRUPById'
})
export class ElementoRUPByIdPipes implements PipeTransform {
    constructor(private elementoRUPService: ElementosRUPService) { }
    transform(id: string): any {
        return this.elementoRUPService.getById(id);
    }
}
