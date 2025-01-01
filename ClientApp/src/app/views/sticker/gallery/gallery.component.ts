import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Observable, Subject } from 'rxjs';

import {
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
  ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
  FormSelectDirective,
  TableDirective, TableColorDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective, FormCheckLabelDirective,
  ContainerComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilPencil, cilTrash } from '@coreui/icons';
import { Select2Module, Select2UpdateEvent, Select2Option } from 'ng-select2-component';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { StickerRepositoryService } from '../../../shared/services/network/sticker-repository.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { ColorClasses, EndPoints, Entities, Operations, ResponseTypes } from '../../../shared/enums.model';
import { Photo } from '../../../interfaces/photo.model';
import { Sticker } from '../../../interfaces/sticker.model';
import { Tag } from '../../../interfaces/tag.model';
import { StickerFilter } from '../../../interfaces/sticker-filter.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';
import { StickerFilterComponent } from '../../../components/sticker-filter/sticker-filter.component'
import { ErrorMessage } from '../../../interfaces/error.model';
import { ShowToastService } from '../../../shared/services/show-toast.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, BorderDirective,
    ButtonDirective, ButtonGroupComponent, InputGroupComponent, InputGroupTextDirective,
    IconDirective,
    FormSelectDirective,
    TableDirective, TableColorDirective,
    RowComponent, ColComponent,
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, FormCheckLabelDirective,
    ModalMessageComponent,
    StickerFilterComponent,
    GridPagerComponent,
    NgIf,
    ContainerComponent,
    Select2Module
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit{
  images: Photo[] = [];
  tags: Select2Option[] = [];
  search!: StickerFilter;
  submitted = false;
  actionIcons = { cilPencil, cilTrash };
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerTable: number[] = [];
  totalItems: number = 0;
  @ViewChild(GridPagerComponent) pagerComponent!: GridPagerComponent;
  radioForm = new UntypedFormGroup({
    field: new UntypedFormControl('field'),
    ascend: new UntypedFormControl('ascend')
  });
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  modalTitle: string = '';
  modalMessage: string = '';
  stickerToHandle!: Sticker;
  imageToHandle!: Photo;

  constructor(
    private photoRepository: PhotoRepositoryService,
    private tagRepository: TagRepositoryService,
    private stickerRepository: StickerRepositoryService,
    private defaults: DefaultValuesService,
    private router: Router,
    private toast: ShowToastService
  ){ }

  ngOnInit(): void {
    this.itemsPerPage = this.defaults.GetItemsPerPage(EndPoints.Thumbnail);
    this.countPhotos();
    this.getTags();
    this.getThumbnails();
    this.itemsPerTable = this.defaults.ItemsPerTable;
  }

  private countPhotos() {
    this.photoRepository
      .countPhotos()
      .subscribe({
        next: (response) => this.totalItems = response[0],
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  getFilters(event: StickerFilter) {
    this.submitted = true;
    if (event) {
      this.search = event;
      this.getThumbnails(event);
    }
  }
  private getThumbnails = (filters: StickerFilter = this.defaults.FilterObject()) => {
    const pagedSearch: StickerFilter = { ...filters, Start: this.currentPage, Size: this.itemsPerPage};
    this.photoRepository
      .getThumbnails(pagedSearch)
      .subscribe({
        next: (response) => {
          this.images = response.map((image) => {
            return {
              IdSticker: 0,
              IdImage: image.IdImage,
              StickerImage: new FormData,
              Src: '',
              StickerThumbnail: `data:image/jpeg;base64,${image.StickerThumbnail}`,
              StickerName: image.StickerName
            }
          });
          this.pagerComponent.setPageNumbers();
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  private getTags = () => {
    this.tagRepository
      .getTags(this.defaults.TagObject())
      .subscribe({
        next: (response) => {
          this.tags = response.map((tag) => {
            return {
              value: tag.IdTag,
              label: tag.TagName
            }
          });
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  private getSticker = (): Observable<Sticker> => {
    const sticker: StickerFilter = this.defaults.FilterObject();
    sticker.Sticker.StickerName = this.imageToHandle.StickerName!;
    let stickerToReturn = new Subject<Sticker>
    this.stickerRepository
      .getStickers(sticker)
      .subscribe({
        next: (response) => {
          stickerToReturn.next(response[0]);
          return response[0];
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.sticker);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
      return stickerToReturn.asObservable();
  }
  handlePageChange(event: number) {
    if (event) {
      this.currentPage = event;
      this.getThumbnails();
    }
  }
  handleChangeTableRows(event: any) {
    let receivedItemsPerPage = event?.target?.value;
    if (isNaN(receivedItemsPerPage)) {
      receivedItemsPerPage = 10;
    }
    this.currentPage = 1;
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString(), EndPoints.Thumbnail);
    this.itemsPerPage = receivedItemsPerPage;
    this.pagerComponent.setPageNumbers();
    this.getThumbnails();
  }
  handleCreateTag(event: Select2UpdateEvent<any>) {
    if (event === null || event.value.value.length === 0) return;
    const tagName = event.value.value;
    const tagToSave: Tag = {
      IdTag: 0,
      TagName: tagName
    };
    this.tagRepository
      .createTag(tagToSave)
      .subscribe({
        next: (response) => {
          let message: string = `La etiqueta '${tagName}' se ha guardado correctamente`;
          const toastTitle = 'Guardando etiqueta';

          if (response < ResponseTypes.SOME_CHANGES) {
            message = `Ha habido un problema al crear la etiqueta '${tagName}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          } else {
            this.toast.show(toastTitle, message, ColorClasses.info);
            this.tags.forEach(tag => {
              if (tag.value === tagName) {
                tag.value = response;
              }
            });
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }
  onEdit(image: Photo) {
    this.imageToHandle = image;
    this.getSticker()
      .subscribe((response) => 
        this.router.navigate(['/stickers/save'], { state: response })
    );
  }
  openDeleteModal(image: Photo) {
    this.modalTitle = 'Borrando imagen';
    this.modalMessage = `Vas a borrar la pegatina '${image.StickerName}'. ¿Estás segura?`;
    this.imageToHandle = image;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.deleteSticker();
    }
  }
  deleteSticker() {
    let message: string = `La pegatina '${this.imageToHandle.StickerName}' se ha borrado correctamente`;
    const toatsTitle = 'Borrando pegatina';

    this.getSticker()
      .subscribe({
        next: (stickerToDelete) => {
          this.stickerRepository
            .deleteSticker(stickerToDelete)
            .subscribe({
              next: (response) => {
                if (response > ResponseTypes.NO_CHANGE) {
                  this.toast.show(toatsTitle, message, ColorClasses.info);
                  this.getThumbnails();
                } else {
                  message = `Ha habido un problema al borrar la pegatina '${this.imageToHandle.StickerName}'`;
                  this.toast.show(toatsTitle, message, ColorClasses.warning);
                }
              },
              error: (err) => {
                const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.delete, Entities.photo);
                this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
              }
            });
        }
      })
  }
}
