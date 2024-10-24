import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm-copy',
  standalone: true,
  imports: [MatDialogModule, 
],
  templateUrl: './dialog-confirm-copy.component.html',
  styleUrl: './dialog-confirm-copy.component.scss'
})
export class DialogConfirmCopyComponent {
  constructor(public dialogRef: MatDialogRef<DialogConfirmCopyComponent>) {}

  onApplyRow(): void {
    this.dialogRef.close({ action: 'apply-row' });
  }

  onApplyCol(): void {
    this.dialogRef.close({ action: 'apply-col' });
  }

  cancel(): void{
    this.dialogRef.close({ action: 'cancel' });
  }
}
