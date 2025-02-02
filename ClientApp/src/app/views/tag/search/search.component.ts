import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { cilPencil, cilTrash } from '@coreui/icons';
import { 
  CardComponent, CardHeaderComponent, CardBodyComponent,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  TableDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { Tag } from './../../../interfaces/tag.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { ShowToastService } from '../../../shared/services/show-toast.service';
import { ErrorMessage } from '../../../interfaces/error.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,
    TableDirective,
    RowComponent, ColComponent,
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule,
    IconDirective,
    ModalMessageComponent,
    GridPagerComponent,
    NgIf
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  tags: Tag[] = [];
  tagToHandle!: Tag;
  tagForm!: FormGroup;
  submitted = false;
  actionIcons = { cilPencil, cilTrash };
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  @ViewChild(GridPagerComponent) pagerComponent!: GridPagerComponent;
  modalTitle: string = '';
  modalMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedItems: Tag[] = [];
  itemsPerTable: number[] = [];
  
  constructor(
    private repository: TagRepositoryService, 
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: ShowToastService
  ) { }

  ngOnInit(): void {
    this.tagForm = this.formBuilder.group({ name: [""] });
    this.getTags();
    this.currentPage = 1;
    this.itemsPerTable = this.defaults.ItemsPerTable;
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Tag);
  }

  get form() { return this.tagForm.controls; }

  onSubmit() {
    this.submitted = true;
    const tagSearch: Tag = {
      IdTag: 0,
      TagName: this.form['name'].value || ''
    }
    this.getTags(tagSearch);
  }
  onReset() {
    this.submitted = false;
    this.tagForm.reset();
  }
  onEdit(tag: Tag) {
    this.router.navigate(['/tags/save'], { state: tag });
  }
  openDeleteModal(tag: Tag) {
    this.tagToHandle = tag;
    this.modalTitle = 'Borrando etiqueta';
    this.modalMessage = `Vas a borrar la etiqueta '${tag.TagName}'. ¿Estás segura?`;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.onDelete(this.tagToHandle);
    }
  }
  onDelete(tagToDelete: Tag) {
    let message: string = `La etiqueta '${tagToDelete.TagName}' se ha borrado correctamente`;
    const toastTitle = 'Borrando etiqueta';

    this.repository
      .deleteTag(tagToDelete)
      .subscribe({
        next: (response) => {
          if (response > ResponseTypes.NO_CHANGE) {
            if ((this.tags.length - 1) % this.itemsPerPage === 0) {
              this.currentPage = 1;
            }
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.getTags();
          } else {
            message = `Ha habido un problema al borrar la etiqueta '${tagToDelete.TagName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.delete, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  private getTags = (tag: Tag = this.defaults.TagObject()) => {
    this.repository
      .getTags(tag)
      .subscribe({
        next: (response) => {
          this.tags = response;
          this.setPager();
          this.pagerComponent.setPageNumbers();
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  handlePageChange(event: number) {
    if (event) {
      this.currentPage = event;
      this.setPager();
    }
  }
  handleChangeTableRows(event: any) {
    let receivedItemsPerPage = event?.target?.value;
    if (isNaN(receivedItemsPerPage)) {
      receivedItemsPerPage = 10;
    }
    this.currentPage = 1;
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Tag);
    this.itemsPerPage = receivedItemsPerPage;
    this.pagerComponent.setPageNumbers();
    this.setPager();
  }
  setPager() {
    this.pagedItems = this.defaults.GetPagedItems(this.tags, this.currentPage, this.itemsPerPage);
  }
}
