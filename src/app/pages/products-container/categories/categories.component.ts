import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {

  categoryForm: FormGroup;
  categoriesList: any[] = [];
  editMode = false;
  formMode: 'Add' | 'Edit' = 'Add';
  successMessage = null;
  errorMessage = [];
  currentCategoryId: number | null = null;
  categorySub: Subscription;

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.categoryService.getCategories();
  }

  hidewForm() {
    this.editMode = false;
    this.categoryForm.reset();
    this.currentCategoryId = null;
  }

  loadServices() {
    this.categorySub = this.categoryService.categories.subscribe(data => {
      this.categoriesList = data;
    });
  }

  toggleEditMode(category?: any): void {
    // this.editMode = !this.editMode;
    this.editMode = true;
    this.formMode = category ? 'Edit' : 'Add';
    if (category) {
      this.currentCategoryId = category.id;
      this.categoryForm.patchValue(category);
    } else {
      this.currentCategoryId = null;
      this.categoryForm.reset();
    }
  }

  async saveCategory() {
    if (this.categoryForm.valid) {

      let formData = new FormData();
      Object.keys(this.categoryForm.value).forEach(key => {
        if (this.categoryForm.value[key] !== null && this.categoryForm.value[key] !== '') {
          formData.append(key, this.categoryForm.value[key]);
        } else {
            formData.append(key, '');
        }
      });
      
      try {
        if (this.formMode === 'Add') {
          await this.categoryService.createCategory(formData);
        } else if (this.formMode === 'Edit' && this.currentCategoryId !== null) {
          await this.categoryService.updateCategory(this.currentCategoryId, formData);
        }
        this.successMessage = 'Category saved successfully';
        // this.editMode = false;
        this.hidewForm();
        setTimeout(() => {
          this.successMessage = undefined;
        }, 3000);
      } catch (e: any) {
        console.log(e?.error?.message);
        this.errorMessage = e?.error?.message || 'An error occurred';
        setTimeout(() => {
          this.errorMessage = undefined;
        }, 6000);
      }
    }
  }

  async deleteCategory(id: number) {
    try {
      if (window.confirm('Do you want to delete this category?')) {
        await this.categoryService.deleteCategory(id);
      } else return;
          this.successMessage = 'Category deleted successfully';
          this.hidewForm();
          setTimeout(() => {
            this.successMessage = undefined;
          }, 3000);
        
      } catch (err) {
        if(!err.error.status && err.error.code == 409) this.errorMessage.push(err.error.message);
        else this.errorMessage.push('Something went wrong');
        setTimeout(() => {
          this.errorMessage = [];
        }, 3000);
        console.log(err);
      }
  }


  ngOnDestroy() {
    if(this.categorySub) this.categorySub.unsubscribe();
  }

}
