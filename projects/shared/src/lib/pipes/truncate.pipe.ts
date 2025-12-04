import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
    transform(value: string): string {
        if (value?.length > 20) {
            return value.substring(0, 20) + '...';
        }
        return value;
    }
}
