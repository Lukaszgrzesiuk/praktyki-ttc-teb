import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoteService, Note } from '../services/note.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  notesHistory: Note[] = [];
  
  // Form variables
  newTitle: string = '';
  newContent: string = '';
  
  // Ratings (Default to 1 due to SQL CHECK constraint)
  helpfulnessRating: number = 1;
  creationEaseRating: number = 1;

  // Relational variables
  groupId: number | null = null;
  
  // Variables from session
  currentLoggedInUserId: number | null = null; 
  currentUserName: string = '';

  // File variables
  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  editingNoteId: number | null = null;
  showForm: boolean = false;

  // Variable for enlarging photos
  enlargedPhoto: string | null = null;

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentLoggedInUserId = this.authService.getCurrentUserId();
    this.currentUserName = this.authService.getCurrentUserName();

    if (this.currentLoggedInUserId) {
      this.loadNotes();
    }
  }

  loadNotes() {
    if (!this.currentLoggedInUserId) return;
    
    this.noteService.getNotesForUser(this.currentLoggedInUserId).subscribe({
      next: (data) => { this.notesHistory = data; },
      error: (err) => console.error('Fetch error:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  saveNote() {
    if (!this.currentLoggedInUserId) return;

    const formData = new FormData();
    formData.append('Title', this.newTitle);
    formData.append('Content', this.newContent);
    formData.append('Permissions', 'Public'); 
    formData.append('Author', this.currentUserName); 
    formData.append('HelpfulnessRating', this.helpfulnessRating.toString());
    formData.append('CreationEaseRating', this.creationEaseRating.toString());
    formData.append('AuthorId', this.currentLoggedInUserId.toString());
    
    if (this.groupId) {
      formData.append('GroupId', this.groupId.toString());
    }

    if (this.selectedPhoto) formData.append('Photo', this.selectedPhoto);
    if (this.selectedVideo) formData.append('Video', this.selectedVideo);
    if (this.selectedAudio) formData.append('Audio', this.selectedAudio);

    this.noteService.addNote(formData).subscribe({
      next: (savedNote) => {
        this.loadNotes();
        this.toggleForm();
      },
      error: (err) => alert('Error saving to backend!')
    });
  }

  editNote(note: Note) {
    this.showForm = true;
    this.editingNoteId = note.id ?? null;
    this.newTitle = note.title;
    this.newContent = note.content ?? '';
    this.helpfulnessRating = note.helpfulnessRating ?? 1;
    this.creationEaseRating = note.creationEaseRating ?? 1;
    this.groupId = note.groupId ?? null;
  }

  deleteNote(id: number | undefined) {
    if (id && confirm('Delete this note?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.notesHistory = this.notesHistory.filter(n => n.id !== id);
        }
      });
    }
  }

  getEmoji(value: number | undefined): string {
    const val = value ?? 1;
    if (val <= 2) return '😢';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '🤩';
  }

  openPhoto(url: string) { this.enlargedPhoto = url; }
  closePhoto() { this.enlargedPhoto = null; }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    this.helpfulnessRating = 1;
    this.creationEaseRating = 1;
    this.groupId = null;
    
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.editingNoteId = null;
  }
}