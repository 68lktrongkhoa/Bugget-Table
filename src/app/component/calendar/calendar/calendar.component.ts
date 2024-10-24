import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarModule, DatePickerModule, TimePickerModule, DateRangePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CalendarModule, DatePickerModule, TimePickerModule, DateRangePickerModule, DateTimePickerModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  selectedDate: string;
  @Output() dateSelected = new EventEmitter<string>();

  
  constructor(
    public dialogRef: MatDialogRef<CalendarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Nhận dữ liệu từ component cha
  ) {
    this.selectedDate = data || new Date(); // Gán giá trị ngày từ component cha hoặc lấy ngày hiện tại
  }

  private formatDate(date: Date): string {
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Lấy tháng và đảm bảo 2 chữ số
    const year = date.getFullYear().toString().slice(-4); // Lấy 2 chữ số cuối của năm
    return `${month}/${year}`; // Trả về định dạng mm/yy
  }

  closeDialog(): void {
    this.dialogRef.close(this.selectedDate);
    this.dateSelected.emit(this.selectedDate);
  }

  onDateChange(event: any): void {
    const dateValue: Date = event.value; 
    this.selectedDate = this.formatDate(dateValue);
  }
}
