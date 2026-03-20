import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Note } from '../services/note.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserPanelComponent } from '../panel/user-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UserPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // Make sure you have this file
})
export class DashboardComponent implements OnInit {
  notesHistory: Note[] = [];
  
  // Form variables
  newTitle: string = '';
  newContent: string = '';
  
  // Ratings (Default to 1, not 0, due to SQL CHECK constraint)
  helpfulnessRating: number = 1;
  creationEaseRating: number = 1;

  // Relational variables
  groupId: number | null = null;
  authorId: number | null = null;
  
  // SIMULATED LOGGED-IN USER ID (to be replaced with real auth service later)
  currentLoggedInUserId: number = 1; 

  // File variables
  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  editingNoteId: number | null = null;
  showForm: boolean = false;

  // Variable for enlarging photos
  enlargedPhoto: string | null = null;

  constructor(private noteService: NoteService) {}

  ngOnInit() {
    // Load notes ONLY for the current user
    this.loadNotes();
  }

  loadNotes() {
    // Uses the new endpoint: GET /api/notes/user/1
    this.noteService.getNotesForUser(this.currentLoggedInUserId).subscribe({
      next: (data) => { this.notesHistory = data; },
      error: (err) => console.error('Fetch error:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  // Handle local file selection
  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      if (type === 'photo') this.selectedPhoto = file;
      if (type === 'video') this.selectedVideo = file;
      if (type === 'audio') this.selectedAudio = file;
    }
  }

  saveNote() {
    // Backend requires [FromForm], so we use FormData
    const formData = new FormData();
    formData.append('Title', this.newTitle);
    formData.append('Content', this.newContent);
    formData.append('Permissions', 'Public'); // Hardcoded for now
    formData.append('Author', 'Current User'); // Hardcoded for now

    // Append ratings
    formData.append('HelpfulnessRating', this.helpfulnessRating.toString());
    formData.append('CreationEaseRating', this.creationEaseRating.toString());
    
    // Save current logged-in user as the note's AuthorId
    formData.append('AuthorId', this.currentLoggedInUserId.toString());
    
    // If a group was selected, append it
    if (this.groupId) {
      formData.append('GroupId', this.groupId.toString());
    }

    // Append files if they were selected
    if (this.selectedPhoto) formData.append('Photo', this.selectedPhoto);
    if (this.selectedVideo) formData.append('Video', this.selectedVideo);
    if (this.selectedAudio) formData.append('Audio', this.selectedAudio);

    this.noteService.addNote(formData).subscribe({
      next: (savedNote) => {
        // Reload list to ensure all relationships and new data are fetched properly
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
    
    // Fallback to 1 to satisfy SQL Server constraints
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

  // Safe getEmoji function accepting number or undefined
  getEmoji(value: number | undefined): string {
    const val = value ?? 1; // Fallback to 1
    if (val <= 2) return '😢';
    if (val <= 4) return '😐';
    if (val <= 6) return '🙂';
    if (val <= 8) return '😊';
    return '🤩';
  }

  // Photo modal functions
  openPhoto(url: string) { this.enlargedPhoto = url; }
  closePhoto() { this.enlargedPhoto = null; }

  resetForm() {
    this.newTitle = '';
    this.newContent = '';
    // Reset to 1, not 0!
    this.helpfulnessRating = 1;
    this.creationEaseRating = 1;
    this.groupId = null;
    
    this.selectedPhoto = null;
    this.selectedVideo = null;
    this.selectedAudio = null;
    this.editingNoteId = null;
  }
}