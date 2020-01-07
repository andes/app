import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
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

}
