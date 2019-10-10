import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

Injectable();
export class InternacionCacheService {

    private dataCache = new BehaviorSubject<any>(null);

    setData(data: any, origen: String) {
        this.dataCache.next({ data: data, origen: origen });
    }

    getData(): any {
        return this.dataCache.value;
    }

    clearData() {
        this.dataCache.next(null);
    }
}
