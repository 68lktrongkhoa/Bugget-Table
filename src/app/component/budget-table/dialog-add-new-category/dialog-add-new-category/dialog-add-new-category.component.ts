import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-add-new-category',
  standalone: true,
  imports: [MatIconModule,FormsModule,CommonModule],
  templateUrl: './dialog-add-new-category.component.html',
  styleUrl: './dialog-add-new-category.component.scss'
})
export class DialogAddNewCategoryComponent {

  categoryName: string = ''; 
  errorMessage: string = '';
  childItems: { name: string }[] = [{ name: '' }]; 
  categoryList: { parent: string, children: { name: string }[] }[] = []; 



  constructor(
    public dialogRef: MatDialogRef<DialogAddNewCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (this.categoryName && this.childItems.length > 0) {

      const maxType = this.data.reduce((max: number, item: { type: number; }) => (item.type > max ? item.type : max), this.data[0]?.type || 0);
      const newCategory = {
        parent: this.categoryName,
        children: [...this.childItems],
        type: maxType + 1
      };
      this.categoryList.push(newCategory); 
      this.categoryName = '';
      this.errorMessage = '';
      this.childItems = [];
      this.dialogRef.close(this.categoryList);
    } else {
      this.errorMessage = "Category name is required.";
      this.categoryName = '';
    }
  }

  removeChild(index: number): void {
    this.childItems.splice(index, 1); 
  }

  addChild(): void {
    this.childItems.push({ name: '' }); 
  }
}
