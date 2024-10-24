import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule, DatePickerModule, TimePickerModule, DateRangePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';

import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BudgetComponent } from './component/budget-table/budget/budget.component';
import { CalendarComponent } from './component/calendar/calendar/calendar.component';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarModule, 
    DatePickerModule, 
    TimePickerModule, 
    DateRangePickerModule,
    DateTimePickerModule, 
    RouterOutlet,
    FormsModule, 
    CommonModule,
    BudgetComponent, CalendarComponent,
    MatDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Avnon_Budget_Table';
}
