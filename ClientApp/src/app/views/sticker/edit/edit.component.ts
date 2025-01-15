import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';

import { 
  CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective,
  ButtonDirective, ButtonGroupComponent,
  TableDirective,
  RowComponent, ColComponent,
  FormDirective, FormLabelDirective, FormControlDirective, FormFeedbackComponent,
  TextColorDirective,
  InputGroupComponent, InputGroupTextDirective,
} from '@coreui/angular';
import { Select2Module, Select2UpdateEvent, Select2Option } from 'ng-select2-component';

import { InvalidDirective } from '../../../shared/invalid.directive';
import { DefaultValuesService } from '../../../shared/services/default-values.service';
import { StickerRepositoryService } from '../../../shared/services/network/sticker-repository.service';
import { TagRepositoryService } from '../../../shared/services/network/tag-repository.service';
import { PhotoRepositoryService } from '../../../shared/services/network/photo-repository.service';
import { Sticker } from '../../../interfaces/sticker.model';
import { Tag } from '../../../interfaces/tag.model';
import { Dependency } from '../../../interfaces/dependency.model';
import { Photo } from '../../../interfaces/photo.model';
import { ErrorMessage } from '../../../interfaces/error.model';
import { ResponseTypes, Operations, Entities, ColorClasses } from '../../../shared/enums.model';
import { ModalMessageComponent } from '../../../components/modal/modal-message.component';
import { ShowToastService } from '../../../shared/services/show-toast.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CardComponent, CardHeaderComponent, CardBodyComponent, ImgDirective,
    ButtonDirective, ButtonGroupComponent,
    TableDirective,
    RowComponent, ColComponent,
    FormDirective, FormLabelDirective, FormControlDirective, FormsModule, ReactiveFormsModule, FormFeedbackComponent,
    TextColorDirective,
    InputGroupComponent, InputGroupTextDirective,
    InvalidDirective,
    NgIf,
    Select2Module,
    ModalMessageComponent,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  receivedSticker!: Sticker;
  tags: Select2Option[] = [];
  stickerTags: number[] = [];
  stickerImage!: Photo;
  isEditing: boolean;
  stickerEditForm!: FormGroup;
  savePlaceholder: string;
  formValidated: boolean = false;
  dependencies!: Dependency[];
  saving: boolean = false;
  @ViewChild(ModalMessageComponent) modalComponent!: ModalMessageComponent;
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(
    private stickerRepository: StickerRepositoryService,
    private tagRepository: TagRepositoryService,
    private photoRepository: PhotoRepositoryService,
    private router: Router,
    private defaults: DefaultValuesService,
    private formBuilder: FormBuilder,
    private toast: ShowToastService) {
    this.receivedSticker = this.defaults.StickerObject();
    const receivedData = this.router.getCurrentNavigation()?.extras.state as Sticker || {};
    const hasData = Object.keys(receivedData).length > 0;
    if (hasData) {
      this.receivedSticker.IdSticker = receivedData['IdSticker'];
      this.receivedSticker.StickerName = receivedData['StickerName'];
      this.receivedSticker.Tag = receivedData['Tag'];
    }
    this.isEditing = hasData;
    this.savePlaceholder = this.isEditing ? 'Editar' : 'Nueva';
  }

  ngOnInit(): void {
    this.getTags();
    this.getPhoto();
    this.stickerEditForm = this.formBuilder.group({ 
      name: [this.receivedSticker.StickerName, [Validators.required]],
      tag: [this.receivedSticker.Tag]
      });
  }

  get form() { return this.stickerEditForm.controls; }

  private getTags = () => {
    this.tagRepository
      .getTags(this.defaults.TagObject())
      .subscribe(response => {
        this.tags = response.map((tag) => {
          return {
            value: tag.IdTag,
            label: tag.TagName
          }
        });
        if (this.receivedSticker.Tag !== null) {
          this.stickerTags = this.receivedSticker.Tag.map((tag) => tag.IdTag);
        }
      });
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
            this.tags.forEach(tag => {
              if (tag.value === tagName) {
                tag.value = response;
              }
            });
            this.toast.show(toastTitle, message, ColorClasses.info);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.tag);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }

  getPhoto() {
    this.photoRepository
      .getPhotos(this.receivedSticker)
      .subscribe({
        next: (response) => {
          if (response.length) {
            const imageSrc = (response !== null && response.length > 0)
            ? `data:image/jpeg;base64,${response[0].StickerImage}`
            : '';
            this.stickerImage = {
              IdSticker: this.receivedSticker.IdSticker || 0,
              IdImage: response[0].IdImage,
              StickerImage: new FormData,
              Src: imageSrc,
            }
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.get, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }

  openDeleteModal() {
    if (this.isEditing) {
      this.modalTitle = 'Borrando imagen';
      this.modalMessage = `Vas a borrar la imagen de '${this.receivedSticker.StickerName}'. ¿Estás segura?`;
      this.modalComponent.toggleModal();
    } else {
      this.stickerImage.Src = '';
    }
  }
  handleDeleteModalResponse(event: boolean) {
    if (event) {
      this.modalComponent.toggleModal();
      this.deletePhoto();
    }
  }
  deletePhoto() {
    let message: string = `La imagen de '${this.receivedSticker.StickerName}' se ha borrado correctamente`;
    const toatsTitle = 'Borrando imagen';

    this.photoRepository
      .deletePhoto(this.stickerImage.IdImage)
      .subscribe({
        next: (response) => {
          if (response > ResponseTypes.NO_CHANGE) {
            this.toast.show(toatsTitle, message, ColorClasses.info);
            this.stickerImage.Src = '';
          } else {
            message = `Ha habido un problema al borrar la imagen de '${this.receivedSticker.StickerName}'`;
            this.toast.show(toatsTitle, message, ColorClasses.warning);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.delete, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }

  onSubmit() {
    const name = this.form['name'].value;
    const tags = this.form['tag'].value;
    this.formValidated = name.length !== 0;
    if (name.length === 0) {
      return;
    }
    const tagsToSave = tags !== null
      ? tags.map((tag: any) => {
        let num = tag;
        if (isNaN(parseInt(num.toString()))) {
          num = this.tags.find(element => element.label === num)?.value;
        }
        return { IdTag: num, TagName: '' }
      })
      : [this.defaults.TagObject()];
    const stickerToSave: Sticker = {
      IdSticker: this.isEditing ? this.receivedSticker.IdSticker : 0,
      StickerName: this.form['name'].value,
      Tag: tagsToSave,
      Category: []
    };
    this.saving = true;
    if (this.isEditing) {
      this.stickerRepository
        .updateSticker(stickerToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.sticker);
            this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
          }
        });
    } else {
      this.stickerRepository
        .createSticker(stickerToSave)
        .subscribe({
          next: (response) => {
            this.handleResponse(response)
          },
          error: (err) => {
            const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.sticker);
            this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
          }
        });
    }
  }

  handleResponse(result: number) {
    let message: string = `La pegatina '${this.form['name'].value}' se ha guardado correctamente`;
    const toastTitle = 'Guardando pegatina';

    if (result < ResponseTypes.SOME_CHANGES) {
      message = `Ha habido un problema al editar la pegatina '${this.form['name'].value}'`;
      this.toast.show(toastTitle, message, ColorClasses.warning);
    } else {
      this.toast.show(toastTitle, message, ColorClasses.info);
      if (this.isEditing === false) {
        this.isEditing = true;
        this.receivedSticker.IdSticker = result;
        this.receivedSticker.StickerName = this.form['name'].value;
        this.receivedSticker.Tag = this.form['tag'].value;
        this.stickerImage = {
          ...this.stickerImage,
          IdSticker: result
        };
      }
      if (this.stickerImage.StickerImage.get('images') !== null) {
        this.saveImage();
      }
    }
  }

  async showImage(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.defaults
        .convertToBase64(fileList[0])
        .then((base64) => {
          this.stickerImage = {
            IdSticker: this.receivedSticker.IdSticker,
            IdImage: 0,
            StickerImage: new FormData,
            Src: `${base64}`,
          };
        });

      const formData = new FormData();
      formData.append('images', fileList[0]);
      this.stickerImage = {
        ...this.stickerImage,
        StickerImage: formData
      };
    }
  }

  async saveImage() {
    this.photoRepository
      .savePhoto(this.stickerImage)
      .subscribe({
        next: (response) => {
          let message: string = `La imagen se ha guardado correctamente`;
          const toastTitle = 'Guardando imagen';
          if (response < ResponseTypes.SOME_CHANGES) {
            message = `Ha habido un problema al guardar la imagen para '${this.form['name'].value}'`;
            this.toast.show(toastTitle, message, ColorClasses.warning);
          } else {
            this.stickerImage = {
              IdSticker: this.receivedSticker.IdSticker,
              IdImage: response,
              StickerImage: new FormData,
              Src: this.stickerImage.Src,
            };
            this.toast.show(toastTitle, message, ColorClasses.info);
          }
        },
        error: (err) => {
          const errorTexts: ErrorMessage = this.defaults.GetErrorMessage(err, Operations.save, Entities.photo);
          this.toast.show(errorTexts.Title, errorTexts.Message, ColorClasses.danger);
        }
      });
  }

  getWidth() {
    return this.isEditing ? '8' : '10';
  }
}
