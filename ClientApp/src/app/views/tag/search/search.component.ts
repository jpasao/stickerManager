import { Component } from '@angular/core';
import { Tag } from './../../../interfaces/tag.model';
import { TagRepositoryService } from './../../../shared/services/tag-repository.service'  
import { CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective } from '@coreui/angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, TableDirective],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  tags: Tag[] = [];
  defaultTag: Tag = {
    IdTag: 0,
    TagName: ''
  }
  constructor(private repository: TagRepositoryService) { }

  ngOnInit(): void {
    this.getTags();
  }

  private getTags = () => {    
    this.repository
      .getTags(this.defaultTag)
      .subscribe(response => {
        this.tags = response;
      });
  }
}
