import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { IProduct } from '../../../models/product';
import { ProductService } from '../../../services/product/product.service';
import { Subscription, skip, take } from 'rxjs';
import { ModalComponent } from '../../../components/modal/modal.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ModalComponent, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  // products: IProduct[] = [];
  // productSub: Subscription;
  // private productService = inject(ProductService);

  // filteredList: any[] = [];
  // categories: string[] = [];
  // selectedCategory: string = '';
  // searchQuery: string = '';

  // constructor() {}

  // async ngOnInit() {
  //   this.productSub = this.productService.products.subscribe({
  //     next: products => {
  //       this.products = products;
  //       console.log('Products list: ', this.products);
  //       this.categories = [...new Set(this.products.map(item => item.category))];
  //       this.filteredList = this.products;
  //     },
  //     error: (err) => console.error('Error fetching products', err)
  //   });
  //   await this.productService.getProducts();
  // }

  // filterByCategory(event): void {
  //   const category = event.target.value;
  //   this.selectedCategory = category;
  //   this.applyFilters();
  // }

  // searchProducts(event): void {
  //   const query = event.target.value;
  //   this.searchQuery = query;
  //   this.applyFilters();
  // }

  // applyFilters(): void {
  //   this.filteredList = this.products.filter(item => {
  //     return ((!this.selectedCategory || item.category === this.selectedCategory) && (!this.searchQuery || item.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
  //     );
  //   });
  // }

  // ngOnDestroy() {
  //   if(this.productSub) this.productSub.unsubscribe();
  // }

  // getTagClass(tag: string): string {
  //   switch (tag.toLowerCase()) {
  //     case 'new':
  //       return 'bg-success';
  //     case 'promotion':
  //       return 'bg-danger';
  //     case 'best-sale':
  //       return 'bg-warning';
  //     case 'sale':
  //       return 'bg-info';
  //     case 'hot':
  //       return 'bg-dark';
  //     default:
  //       return 'bg-secondary';
  //   }
  // }

  products: IProduct[] = [];
  productSub: Subscription;

  displayModal = false;
  modalTitle = '';
  modalContent: string | string[];
  modalSize: 'sm' | 'md' | 'lg' = 'md';


  productForm: FormGroup;

  selectedFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  editMode = false;
  // showForm = false;
  formMode: 'Add' | 'Edit' = 'Add';
  successMessage = null;
  errorMessage = [];
  currentProductId: number | null = null;
  serviceSub: Subscription;
  categories: any[] = [];

  tagsList: any[] = [];
  colorsList: any[] = [];
  selectedTags: string[] = [];
  selectedColors: string[] = [];

  // safeMapUrl: SafeResourceUrl | null = null;
  private sanitizer = inject(DomSanitizer);

  constructor(
    private productService: ProductService, 
    private categoryService: CategoryService, 
    private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      price: [null, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      promo_price: [null, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      stock: [null, [Validators.minLength(0)]],
      description: [''],
      status: [false],
      category_id: ['', Validators.required],
      // type: [null, [Validators.pattern(/^\d+$/)]],
      image: [''],
      // image: ['', this.formMode === 'Add' && !this.selectedFile ? Validators.required : null],
      colors: [''],
      brand: [''],
      additional_info: [''],
      // colors: this.fb.array([])
    });
  }

  async ngOnInit() {
    // if (this.isEdit) {
    //   this.productForm.patchValue(this.product);
    // }

    this.getColorsTags();

    this.productSub = this.productService.products.subscribe({
      next: (products) => {
        this.products = products;
        console.log('Products list: ', this.products);
        // this.categories = [...new Set(this.products.map(item => item.category))];
        // this.filteredList = this.products;
      },
      error: (err) => console.error('Error fetching products', err),
    });

    this.categoryService.categories.pipe(skip(1), take(1)).subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categories list*****: ', this.categories);
      },
      error: (err) => console.error('Error fetching categories', err),
    });

    await this.productService.getProducts();
    await this.categoryService.getCategories();
  }

  async getColorsTags() {
    const { colors, tags }: any = await this.productService.getTagsColors();
    this.colorsList = colors;
    this.tagsList = tags;
    console.log('Products Colors: ', colors);
    console.log('Products Tags: ', tags);
  }

  openModal(): void {
    this.formMode = 'Add';
    this.modalTitle = 'Add product';
    this.modalSize = 'lg'; // Grande taille pour les avis
    this.displayModal = true;
  }

  closeModal(): void {
    // this.displayModal = false;
    this.resetForm();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    // console.log('SELECTED FILE: ', this.selectedFile);
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // // Check file type
      // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      // if (!allowedTypes.includes(this.selectedFile.type)) {
      //   alert('Invalid file type. Only PNG, JPEG and GIF images are allowed.');
      //   return;
      // }
      // // Check file size
      // if (this.selectedFile.size > 2048000) {
      //   alert('File size exceeds limit. Maximum allowed size is 2MB.');
      //   return;
      // }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result;
        // this.logoPreview = this.sanitizer.bypassSecurityTrustResourceUrl(this.settings.map);
        // console.log('Safe image Url: ', this.safeMapUrl);
   
      };
      reader.readAsDataURL(this.selectedFile);
      input.value = '';

      // Set the form control value
      // this.productForm.get('image')?.setValue(this.selectedFile);
      // this.productForm.get('image')?.updateValueAndValidity();
    }
  }

  sanitizeUrl(val) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(val);
  }

  handleEditMode(product?: any): void {
    console.log('Selected product:', product);
    console.log('Selected image:', product.images[0]);
    this.openModal();
    // this.editMode = !this.editMode;
    this.editMode = true;
    this.formMode = product ? 'Edit' : 'Add';
    if (product) {
      this.selectedTags = product.tags ? [...product.tags] : [];
      this.selectedColors = product.colors ? [...product.colors] : [];
      product.status = product.status == 1 ? true : false;
      // product.type = product.type == 1 ? true : false;
      this.currentProductId = product.id;
      this.productForm.patchValue(product);
      this.logoPreview = product.images[0];
      // this.productForm.get('image').patchValue(product.images[0]);
    } else {
      // this.currentProductId = null;
      this.resetForm();
    }
    console.log('selected edit colors: ', this.selectedColors);
  }

  async saveProduct() {
    console.log('Current ID: ', this.currentProductId);
    if (this.productForm.valid) {
      if (this.productForm.get('status').value == true)
        this.productForm.get('status').patchValue(1);
      else this.productForm.get('status').patchValue(0);
      // if (this.productForm.get('type').value == true)
      //   this.productForm.get('type').patchValue(1);
      // else this.productForm.get('type').patchValue(2);

      let formData = new FormData();
      Object.keys(this.productForm.value).forEach((key) => {
        if (
          this.productForm.value[key] !== null &&
          this.productForm.value[key] !== ''
        ) {
          formData.append(key, this.productForm.value[key]);
        } else {
          // if (key === 'price' || key === 'promo_price' || key === 'description' || key === 'type') formData.append(key, '');
          formData.append(key, '');
        }
      });
      // formData.append('colors[]', JSON.stringify(this.selectedTags));
      // formData.append('tags[]', JSON.stringify(this.selectedColors));
      this.selectedTags.forEach(tag => {
        formData.append('tags[]', tag);
        });
        this.selectedColors.forEach(tag => {
        formData.append('colors[]', tag);
        });

      if (this.selectedFile)
        formData.append('image', this.selectedFile, this.selectedFile.name);
      else formData.delete('image');

      // Display the key/value pairs
      formData.forEach((value,key) => {
        console.log(key+': '+value)
         });
      // return;
      try {
        if (this.formMode === 'Add') {
          await this.productService.createProduct(formData);
        } else if (this.formMode === 'Edit' && this.currentProductId !== null) {
          console.log('Cureen Product ID: ', this.currentProductId);
          await this.productService.updateProduct(this.currentProductId, formData);
        }
        this.successMessage = 'Product saved successfully';
        // this.editMode = false;
        this.resetForm();
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

  addTag(event: any) {
    const selectedTag = event.target.value;
    if (selectedTag && !this.selectedTags.includes(selectedTag)) {
      this.selectedTags.push(selectedTag);
    }
    event.target.value = ''; // Reset the select to the placeholder value
  }

  removeTag(tag: string) {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
  }

  addColor(event) {
    const selectedColor = event.target.value;
    if (selectedColor && !this.selectedColors.includes(selectedColor)) {
      this.selectedColors.push(event.target.value);
    }
    event.target.value = ''; // Reset the select to the placeholder value
  }

  removeColor(color: string) {
    this.selectedColors = this.selectedColors.filter((t) => t !== color);
  }

  resetForm() {
    this.editMode = false;
    this.selectedColors = [];
    this.selectedTags = [];
    this.selectedFile = null;
    this.logoPreview = null;
    this.productForm.reset();
    this.currentProductId = null;
    this.displayModal = false;
  }

  // onFileSelected(event: any) {
  //   if (event.target.files && event.target.files.length > 0) {
  //     this.productForm.get('image')?.setValue(event.target.files[0]);
  //   }
  // }

  // save() {
  //   if (this.productForm.valid) {
  //     const formData = new FormData();
  //     Object.keys(this.productForm.value).forEach(key => {
  //       if (this.productForm.value[key] !== null && this.productForm.value[key] !== '') {
  //         formData.append(key, this.productForm.value[key]);
  //       }
  //     });

  //     if (this.isEdit) {
  //       // this.productService.updateProduct(this.product.id, formData).subscribe(() => {
  //       //   this.productService.loadProducts();
  //       //   this.activeModal.close();
  //       // });
  //     } else {
  //       // this.productService.createProduct(formData).subscribe(() => {
  //       //   this.productService.loadProducts();
  //       //   this.activeModal.close();
  //       // });
  //     }
  //   }
  // }

  // openAddModal() {
  //   // const modalRef = this.modalService.open(ProductFormComponent);
  //   // modalRef.componentInstance.isEdit = false;
  // }

  // openEditModal(product: any) {
  //   // const modalRef = this.modalService.open(ProductFormComponent);
  //   // modalRef.componentInstance.isEdit = true;
  //   // modalRef.componentInstance.product = product;
  // }

  // openDetailModal(product: any) {
  //   // const modalRef = this.modalService.open(ProductDetailComponent);
  //   // modalRef.componentInstance.product = product;
  // }

  // deleteProduct(id: number) {
  //   // this.productService.deleteProduct(id).subscribe(() => {
  //   //   this.productService.loadProducts();
  //   // });
  // }

  async deleteProduct(id: number) {
    if (window.confirm('Do you want to remove this product?')) {
      await this.productService.deleteProduct(id);
    } else return;
      this.successMessage = 'Product deleted successfully';
      setTimeout(() => {
        this.successMessage = undefined;
      }, 3000);
  }

  ngOnDestroy() {
    if (this.productSub) this.productSub.unsubscribe();
  }
}
