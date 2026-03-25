import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NoteService, Note } from '../services/note.service';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  notesHistory: Note[] = [];
  chatMessages: {sender: 'user' | 'ai', text: string}[] = [
    { sender: 'ai', text: 'Hi! I am your AI assistant. Tell me what you want to note down (e.g., "Save an urgent note: buy milk"), and I will organize and rank it.' }
  ];
  chatInput: string = '';

  newTitle: string = '';
  newContent: string = '';
  helpfulnessRating: number = 1;
  creationEaseRating: number = 1;
  groupId: number | null = null;
  
  currentLoggedInUserId: number | null = null; 
  currentUserName: string = '';
  isAdmin: boolean = false; 

  selectedPhoto: File | null = null;
  selectedVideo: File | null = null;
  selectedAudio: File | null = null;

  editingNoteId: number | null = null;
  showForm: boolean = false;
  enlargedPhoto: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private adminService: AdminService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentLoggedInUserId = this.authService.getCurrentUserId();
    this.currentUserName = this.authService.getCurrentUserName();

    if (this.currentLoggedInUserId) {
      this.loadNotes();
      
      this.adminService.checkIfAdmin(this.currentLoggedInUserId).subscribe({
        next: (res) => this.isAdmin = res.isAdmin,
        error: (err) => console.error(err)
      });
    }
  }

  sendMessage() {
    this.errorMessage = null;
    if (!this.chatInput.trim()) return;

    const userText = this.chatInput;
    this.chatMessages.push({ sender: 'user', text: userText });
    this.chatInput = '';
    this.scrollToBottom();

    if (this.currentLoggedInUserId) {
      const payload = {
        Message: userText,
        AuthorId: this.currentLoggedInUserId,
        AuthorName: this.currentUserName
      };

      this.http.post<any>('http://localhost:5000/api/aichat/process', payload).subscribe({
        next: (res) => {
          const aiReply = `Done! I created a note titled "${res.title}" and rated its importance as ${res.rating}/10.`;
          this.chatMessages.push({ sender: 'ai', text: aiReply });
          this.loadNotes();
          this.scrollToBottom();
        },
        error: (err) => {
          this.chatMessages.push({ sender: 'ai', text: 'An error occurred while connecting to AI.' });
          this.errorMessage = 'Failed to execute: Could not connect to AI service.';
          console.error(err);
          this.scrollToBottom();
        }
      });
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }, 100);
  }

  loadNotes() {
    if (!this.currentLoggedInUserId) return;
    
    this.noteService.getNotesForUser(this.currentLoggedInUserId).subscribe({
      next: (data) => { 
        this.notesHistory = data.sort((a, b) => (b.helpfulnessRating ?? 0) - (a.helpfulnessRating ?? 0)); 
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.errorMessage = 'Failed to execute: Could not load notes.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.errorMessage = null;
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
    this.errorMessage = null;
    if (!this.currentLoggedInUserId) return;

    if (!this.newTitle.trim() || !this.newContent.trim()) {
      this.errorMessage = 'Failed to execute: Please provide both title and content.';
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.newTitle);
    formData.append('Content', this.newContent);
    formData.append('Permissions', 'Public'); 
    formData.append('Author', this.currentUserName); 
    formData.append('HelpfulnessRating', this.helpfulnessRating.toString());
    formData.append('CreationEaseRating', this.creationEaseRating.toString());
    formData.append('author_id', this.currentLoggedInUserId.toString());
    if (this.groupId) formData.append('group_id', this.groupId.toString());

    if (this.selectedPhoto) formData.append('Photo', this.selectedPhoto);
    if (this.selectedVideo) formData.append('Video', this.selectedVideo);
    if (this.selectedAudio) formData.append('Audio', this.selectedAudio);

    this.noteService.addNote(formData).subscribe({
      next: () => {
        this.loadNotes();
        this.toggleForm();
      },
      error: (err) => {
        this.errorMessage = 'Failed to execute: Error saving to backend!';
      }
    });
  }

  editNote(note: Note) {
    this.showForm = true;
    this.errorMessage = null;
    this.editingNoteId = note.id ?? null;
    this.newTitle = note.title;
    this.newContent = note.content ?? '';
    this.helpfulnessRating = note.helpfulnessRating ?? 1;
    this.creationEaseRating = note.creationEaseRating ?? 1;
    this.groupId = note.groupId ?? null;
  }

  deleteNote(id: number | undefined) {
    this.errorMessage = null;
    if (id && confirm('Delete this note?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => { this.notesHistory = this.notesHistory.filter(n => n.id !== id); },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Could not delete the note.';
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