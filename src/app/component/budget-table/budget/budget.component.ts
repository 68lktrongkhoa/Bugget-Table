import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CalendarComponent } from "../../calendar/calendar/calendar.component";
import { MatDialog } from '@angular/material/dialog';
import cloneDeep from 'lodash/cloneDeep';
import { DialogConfirmCopyComponent } from '../dialog-confirm-copy/dialog-confirm-copy/dialog-confirm-copy.component';
import { DialogAddNewCategoryComponent } from '../dialog-add-new-category/dialog-add-new-category/dialog-add-new-category.component';
import { MatIconModule } from '@angular/material/icon';

interface BudgetRowBase {
  category: string ;
  parent: boolean;
  type: number;
  isSub: boolean;
  emptyRow:boolean;
  subCategories?: BudgetRow[];
  total: number | '';  
}

interface BudgetRow extends BudgetRowBase {
  [month: string ]: number | BudgetRow[] | string | undefined | boolean;  
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [FormsModule, CommonModule, CalendarComponent, MatIconModule],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})

export class BudgetComponent {
  @ViewChildren('editableCell') cells!: QueryList<ElementRef>;
  yearCurrent: number = new Date().getFullYear();
  months: string[] = this.getMonths(1,12,this.yearCurrent); 
  showCalendar: boolean = false;
  isContextMenuVisible : boolean = false;
  year: string = '';
  smonth: number | undefined;
  emonth: number | undefined;
  selectedSDate: Date = new Date();
  selectedEDate: Date = new Date();
  public formattedEDate: string = this.formatDate(this.selectedEDate);
  public formattedSDate: string = this.formatDate(this.selectedSDate);

  selectedDate: string | undefined;
  generateIcome = ['Income', 'General Income ', 'Sales ', 'Commission', 'Add a new ‘General Income’ Category'];
  otherIncome = ['Other Income', 'Training', 'Consulting', 'New income category'];

budgetData: BudgetRow[] = [
  ...this.generateIcome.map((category, index) => ({
    category, 
    parent: index === 0 ? true : false,
    isSub: false,
    type: 1,
    ...this.initializeRow(index)
  })),
  { category: 'Sub Totals', isSub: true, type: 1,...this.initializeRow(99)},
  ...this.otherIncome.map((category, index) => ({
    category,
    parent: index === 0 ? true : false,
    isSub: false,
    type: 2,
    ...this.initializeRow(index)
  })),
  { category: 'Sub Totals',  isSub: true, type: 2,...this.initializeRow(99)} 
];

  overallTotal: number = 0;

  constructor(private dialog: MatDialog) {}

  ngOnInit(){
    this.formattedEDate = this.formatDate(this.selectedEDate);
    this.formattedSDate = this.formatDate(this.selectedSDate);
    const [smonth, syear] = this.formattedSDate.split('/');
    const [emonth, eyear] = this.formattedEDate.split('/');
    this.smonth = parseInt(smonth, 10); 
    this.emonth = parseInt(emonth, 10); 
    this.months = this.getMonths(2, this.emonth,syear);
  }

  formatDate(date: Date): string {
    const month = ('0' + (date.getMonth() + 1)).slice(-2); 
    const year = date.getFullYear().toString().slice(-4); 
    return `${month}/${year}`; 
  }


  getMonths(start: any, end: any, year: any): string[] {
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(new Date(year, i - 1).toLocaleString('default', { month: 'long' }));
    }
    return months;
  }

  calculateIncome(row: BudgetRow, month: string): number {
    const value = row[month];
    if (typeof value === 'number') {
      return value * 0.1;
    }
    return 0;
  }
  

  calculateTotalIncome(row: BudgetRow): number {
    return this.months.reduce((sum, month) => sum + this.calculateIncome(row, month), 0);
  }

  initializeRow(i: any) {
    if (i != 0){
      const row: any = {};
      this.months.forEach(month => (row[month] = 0));
      return row;
    }
  } 

  addRow(index: number) {
    if (index <= this.budgetData.length - 1) {
      this.budgetData.splice(index + 1, 0, { 
        category: '',
        parent: false, 
        type: this.budgetData[index].type,
        ...this.initializeRow(index + 1) 
      });
    }
    this.budgetData = cloneDeep(this.budgetData);
    
  }

  onInputChange(rowIndex: number, monthUpdate: string, target: EventTarget | null): void {
    if (target instanceof HTMLTableCellElement) {
      const value = target.textContent || '';
      const numericValue = parseFloat(value) || 0;
      this.budgetData[rowIndex][monthUpdate] = numericValue;
      this.setCursorToEnd(target);
    }
  }

  setCursorToEnd(element: HTMLElement) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  
  onEnterPress(rowIndex: number, monthUpdate: string, target: EventTarget | null): void {
    if (target instanceof HTMLTableCellElement) {
      this.budgetData = cloneDeep(this.budgetData);
      const value = target.textContent || '';
      const numericValue = parseFloat(value) || 0;
      this.budgetData[rowIndex][monthUpdate] = numericValue;
      this.updateTotals(monthUpdate, rowIndex);
    }
  }

  onArrowKey(rowIndex: number, colIndex: number, event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const rowCount = this.budgetData.length;
      const colCount = this.months.length + 3; 
      let newRowIndex = rowIndex;
      let newColIndex = colIndex;
  
      switch (event.key) {
        case 'ArrowUp':
          newRowIndex = rowIndex > 0 ? rowIndex - 1 : rowCount - 1;
          break;
        case 'ArrowDown':
          newRowIndex = rowIndex < rowCount - 1 ? rowIndex + 1 : 0;
          break;
        case 'ArrowLeft':
          if (colIndex === 0) {
            newRowIndex = rowIndex > 0 ? rowIndex - 1 : rowCount - 1;
            newColIndex = colCount - 1;
          } else {
            newColIndex = colIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (colIndex === colCount - 1) {
            newRowIndex = rowIndex < rowCount - 1 ? rowIndex + 1 : 0;
            newColIndex = 0;
          } else {
            newColIndex = colIndex + 1;
          }
          break;
      }
  
      const cellIndex = newRowIndex * colCount + newColIndex;
      const targetCell = this.cells.toArray()[cellIndex];
      
      if (targetCell) {
        targetCell.nativeElement.focus();
        event.preventDefault();
      }
    }
  }

  calculateRowTotal(row: any) {
    if (!row.parent) {
      return this.months.reduce((total, month) => total + (parseFloat(row[month]) || 0), 0);
    }
    return ''; 
  }
  
  getRollingTotal(): number {
    return this.budgetData.reduce((total, row) => {
      const rowTotal = this.calculateRowTotal(row);
      return total + (!row.parent ? Number(rowTotal) : 0); 
    }, 0);
  }
  
  onCellBlur(rowIndex: number, monthUpdate: string, target: EventTarget | null): void {
    if (target instanceof HTMLTableCellElement) {
      this.budgetData = cloneDeep(this.budgetData); 
      const value = target.textContent || '';
      const numericValue = parseFloat(value) || 0;
      this.budgetData[rowIndex][monthUpdate] = numericValue;
      this.updateTotals(monthUpdate, rowIndex);
    }
  }
  
  updateTotals(monthUpdate: string, rowIndex: number) {
    const rowToUpdate = this.budgetData[rowIndex];
    const rowType = rowToUpdate.type;
    let sum = 0;
  
    this.budgetData.forEach(row => {
      const value = row[monthUpdate];
      const { type, parent, isSub } = row;

      if (type === rowType && !parent) {
        if (isSub) {
          row[monthUpdate] = sum;
        } else if (typeof value === 'number') {
          sum += value;
        }
      }
    })
    this.overallTotal = this.budgetData.reduce((sum, row) => sum + (row.total || 0), 0);
  }

  deleteRow(index: number) {
    this.budgetData.splice(index, 1);
    this.budgetData = cloneDeep(this.budgetData);
    this.budgetData.forEach((row: any, i: number) => {
      if(row.parent == false ){
        this.months.forEach((month: any) => {
          this.updateTotals(month, i);
        });
      }
    });
  }

  getOverallTotal(month: string): number {
    return this.budgetData.reduce((sum, row) => {
      const value = row[month];
      if (typeof value === 'number' && row.isSub) {
        return sum + value;
      }
      return sum;
    }, 0);
  }

  showContextMenu(event: MouseEvent, rowIndex: number, month: string) {
    event.preventDefault();
    this.isContextMenuVisible = true;
    const dialogRef = this.dialog.open(DialogConfirmCopyComponent, {
      data: { rowIndex, month }, 
      position: { top: `${event.clientY}px`, left: `${event.clientX}px` } 
    });

    dialogRef.afterClosed().subscribe(result => {
      let a = this.budgetData[rowIndex][month]
      if (result?.action === 'apply-row') {
        this.applyAllCellInRow(rowIndex, month , a ); 
      } else if (result?.action === 'apply-col') {
        this.applyAllCellInCol(rowIndex, month , a); 
      }
    });
  }

  applyAllCellInRow(index: number, month: string , a: any): void {
    this.budgetData.forEach((row: any, i: number) => {
      if(row.parent == false ){
        if (i == index){
          Object.keys(row).forEach(key => {
            if (key !== 'parent' && key !=='category' && key !== 'type') { 
              row[key] = a;
              this.updateTotals(key,i);
            }
          });
        }
      }
    });
    this.budgetData = cloneDeep(this.budgetData);
  }

  applyAllCellInCol(index: number, month: string , a: any): void {
    this.budgetData.forEach((row: any, i: number) => {
      if(row.parent == false ){
        row[month] = a;
        Object.keys(row).forEach(key => {
          if (key !== 'parent' && key !=='category' && key !== 'type' && key == month) { 
            row[key] = a;
            this.updateTotals(key,i);
          }
        });
      }
    })
    this.budgetData = cloneDeep(this.budgetData);
  }

  addNewCategory(){
    const dialogRef = this.dialog.open(DialogAddNewCategoryComponent, {
      data: this.budgetData,
      width: "50%",
      height: "50%"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) { 
        console.log("result",result)
        const newCategory = [result[0].parent, ...result[0].children.map((child: any) => child.name)];
        this.budgetData.push(
          ...newCategory.map((category, index) => ({
            category, 
            parent: index === 0,
            type: result[0].type,
            ...this.initializeRow(index)
          })),
          { category: 'Sub Totals', isSub: true ,type: result[0].type , ...this.initializeRow(99) } 
        );
      }
    })
  }
  exportToPDF() {
    const doc = new jsPDF();
    const tableElement = document.querySelector('table');

    if (tableElement) {
      html2canvas(tableElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const heightLeft = imgHeight;
        let position = 0;
        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        position -= heightLeft;
        doc.save('budget_report.pdf');
      });
    }
  }

  save(){
    //Save data
  }

  cleanAllData(){
    this.budgetData = [
      ...this.generateIcome.map((category, index) => ({
        category, 
        parent: index === 0 ? true : false,
        type: 1,
        ...this.initializeRow(index)
      })),
      { category: 'Sub Totals',isSub: true,type: 1,...this.initializeRow(99)},
      ...this.otherIncome.map((category, index) => ({
        category,
        parent: index === 0 ? true : false,
        type: 2,
        ...this.initializeRow(index)
      })),
      { category: 'Sub Totals',isSub: true, type: 2,...this.initializeRow(99)} 
    ];
  }

  ChooseDate(isSDate:boolean){
    let dialogRef;
    const dialogData = isSDate ? { sdate: this.formattedSDate } : { edate: this.formattedEDate };
    dialogRef = this.dialog.open(CalendarComponent, {
      data: dialogData
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {   
        this.months = [];
        if (isSDate){
          this.formattedSDate = result
          const [month, year] = result.split('/');
          this.smonth = parseInt(month, 10);
        }else {
          this.formattedEDate = result
          const [month, year] = result.split('/');
          this.emonth = month;
        }
        const [month, year] = result.split('/');
        this.year = year;
      }
      this.showCalendar = false;
      this.months = this.getMonths(this.smonth, this.emonth,this.year)
    });
  }
}

