import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { config } from 'rxjs';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable()
export class ExcelService {
constructor() { }
public exportAsExcelFile(tbl: any, excelFileName: string): void {
  let fl = XLSX.utils.table_to_book(tbl, { /*Sheets: 'Reporte'}*/ );


  let x = tbl.rows[0].cells[0].innerHTML.length;
    // console.dir(x)
    // console.dir(tbl.rows[0].cells.length);

   let configCol: any = [] ;

      for (let i = 0; i < tbl.rows[0].cells.length; i++) {
     configCol.push( {'wpx':  180}); // tbl.rows[0].cells[i].innerHTML.length
   }

   console.dir(configCol);
   console.dir(fl);
  fl['Sheets']['Sheet1']['!cols'] = configCol;
  XLSX.writeFile(fl, excelFileName + '_Reporte_' + new  Date().getTime() + EXCEL_EXTENSION, {cellStyles: true});
}


}
