import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
    constructor() { }

    public exportAsExcelFile(tbl: any, excelFileName: string): void {
        let fl = XLSX.utils.table_to_book(tbl, {raw: true});
        XLSX.writeFile(fl, excelFileName +  EXCEL_EXTENSION, {cellStyles: true});
    }

    /**
     * Exporta multiples tablas a un archivo de excel,
     * poniendo en cada hoja el titulo o nombre correspondiente a la tabla
     */
    public exportMultipleTablesAsExcelFile(data: Array<{title: string, table: any}>, excelFileName: string) {
        const workbook = XLSX.utils.book_new();
        for (const item of data) {
            const sheet = XLSX.utils.table_to_sheet(item.table, {raw: true});
            XLSX.utils.book_append_sheet(workbook, sheet, item.title);
        }
        XLSX.writeFile(workbook, excelFileName +  EXCEL_EXTENSION, {cellStyles: true});
    }
}
