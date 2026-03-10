import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

export interface Note {
  id: number;
  title: string;       
  content: string;     
  creationDate: Date;  
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, DatePipe], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showForm: boolean = false;
  newTitle: string = '';
  newContent: string = '';
  notesHistory: Note[] = [];

  toggleForm() {
    this.showForm = !this.showForm;
    
    if (!this.showForm) {
      this.newTitle = '';
      this.newContent = '';
    }
  }

  saveNewNote() {
    if (this.newTitle.trim() || this.newContent.trim()) {
      const newNote: Note = {
        id: Date.now(), 
        title: this.newTitle,
        content: this.newContent,
        creationDate: new Date()
      };
      
      this.notesHistory.push(newNote);
      this.toggleForm(); 
    }
  }
}