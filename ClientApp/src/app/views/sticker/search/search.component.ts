import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { cilPencil, cilTrash, cilFeaturedPlaylist } from '@coreui/icons';
import { 
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, 
  ButtonDirective,
  FormSelectDirective,
  TableDirective, TableColorDirective, 
  RowComponent, ColComponent, 
  FormDirective, FormLabelDirective, FormControlDirective,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ToastrService } from 'ngx-toastr';

import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { StickerRepositoryService } from '../../../shared/services/network/sticker-repository.service'
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { ResponseTypes } from '../../../shared/enums.model';
import { Sticker } from './../../../interfaces/sticker.model';
import { Tag } from '../../../interfaces/tag.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { GridPagerComponent } from '../../../components/grid-pager/grid-pager.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective, 
    ButtonDirective,
    FormSelectDirective,
    TableDirective, TableColorDirective, 
    RowComponent, ColComponent, 
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, 
    BadgeComponent,
    IconDirective, 
    ModalMessageComponent, 
    GridPagerComponent, 
    NgIf
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  stickers: Sticker[] = [];
  tags: Tag[] = [];
  stickerToHandle!: Sticker;
  stickerForm!: FormGroup;
  submitted = false;
  actionIcons = { cilPencil, cilTrash, cilFeaturedPlaylist };
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  modalTitle: string = '';
  modalMessage: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagedItems: Sticker[] = [];
  showPager: boolean = false;
  itemsPerTable: number[] = [];
  showDetails: boolean = false;
  stickerImage: string = '';
  hasTags: boolean = false;

  constructor(
    private stickerRepository: StickerRepositoryService, 
    private tagRepository: TagRepositoryService,
    private photoRepository: PhotoRepositoryService,
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.stickerForm = this.formBuilder.group({ name: [""], tag: [""] });
    this.getTags();
    this.getStickers();
    this.currentPage = 1;
    this.itemsPerTable = this.defaults.ItemsPerTable;
    this.itemsPerPage = this.defaults.GetItemsPerPage();
  }

  get form() { return this.stickerForm.controls; }

  onSubmit() {
    this.submitted = true;
    const selectedTags = this.form['tag'].value;
    let tagObject: Tag[] = [this.defaults.TagObject()];
    if (selectedTags) {
      tagObject = selectedTags.map((tag: string) => {
        return {
          IdTag: tag,
          TagName: ''
        }
      });
    }
    const stickerSearch: Sticker = {
      IdSticker: 0,
      StickerName: this.form['name'].value || '',
      Tag: tagObject,
    }
    this.getStickers(stickerSearch);
  }
  onReset() {
    this.submitted = false;
    this.stickerForm.reset();
  }
  openDetail(sticker: Sticker) {
    this.showDetails = true;
    this.stickerToHandle = sticker;
    this.hasTags = sticker.Tag[0] !== null;
    this.photoRepository
      .getPhotos(sticker)
      .subscribe(response => {
        this.stickerImage = (response !== null && response.length > 0)
          ? `data:image/jpeg;base64,${response[0].StickerImage}`
          : '';
      })
  }
  onEdit(sticker: Sticker) {
    this.router.navigate(['/stickers/save'], { state: sticker });
  }
  openDeleteModal(sticker: Sticker) {
    this.stickerToHandle = sticker;
    this.modalTitle = 'Borrando pegatina';
    this.modalMessage = `Vas a borrar la pegatina ${sticker.StickerName}. ¿Estás segura?`;
    this.modalComponent.toggleModal();
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.onDelete(this.stickerToHandle);
    }
  }
  onDelete(stickerToDelete: Sticker) {
    let message: string = `La pegatina ${stickerToDelete.StickerName} se ha borrado correctamente`;
    const toatsTitle = 'Borrando pegatina';

    this.stickerRepository
      .deleteSticker(stickerToDelete)
      .subscribe(response => {
        if (response > ResponseTypes.NO_CHANGE) {
          if ((this.stickers.length - 1) % this.itemsPerPage === 0) {
            this.currentPage = 1;
          }
          this.toast.success(message, toatsTitle);
          this.getStickers();
        } else {
          message = `Ha habido un problema al borrar la pegatina ${stickerToDelete.StickerName}`;
          this.toast.warning(message, toatsTitle);
        }
      });
  }
  private getStickers = (sticker: Sticker = this.defaults.StickerObject()) => {    
    this.stickerRepository
      .getStickers(sticker)
      .subscribe(response => {
        this.stickers = response;
        this.pagedItems = this.defaults.GetPagedItems(this.stickers, this.currentPage, this.itemsPerPage);
        this.showPager = this.stickers.length > this.itemsPerPage;
      });
  }
  private getTags = () => {
    this.tagRepository
      .getTags(this.defaults.TagObject())
      .subscribe(response => {
        this.tags = response;
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
    this.defaults.SaveItemsPerPage(receivedItemsPerPage.toString());
    this.itemsPerPage = receivedItemsPerPage;
    this.setPager();
  }
  setPager() {
    this.pagedItems = this.defaults.GetPagedItems(this.stickers, this.currentPage, this.itemsPerPage);
    this.showPager = this.stickers.length > this.itemsPerPage;
  }
  getRowColor(sticker: Sticker) {
    if (sticker === undefined || this.stickerToHandle === undefined) return '';
    return sticker.IdSticker === this.stickerToHandle.IdSticker ? 'info' : ''
  }
}
