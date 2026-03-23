import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ActivityLog {
  action: string;
  timestamp: Date;
  isSuspicious: boolean;
}

interface User {
  id: number;
  name: string;
  groups: string[];
  notes: string[];
  logs: ActivityLog[];
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'] // FIX: styleUrls instead of styleUrl
})
export class AdminPanelComponent {
  users: User[] = [];
  selectedUser: User | null = null;
  userIdCounter: number = 1; // FIX: explicitly declare type

  // FIX: Initialize all string properties to avoid TypeScript strict mode errors
  searchQuery: string = '';
  newUserName: string = '';
  newUserPassword: string = '';
  newGroupName: string = '';
  newNoteTitle: string = '';

  // Dynamic list filtering users by input text
  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(u => u.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  // --- USER MANAGEMENT ---
  selectUser(user: User) {
    this.selectedUser = user;
    this.newGroupName = '';
    this.newNoteTitle = '';
  }

  // Adding a user requires username and password
  addUser() {
    if (this.newUserName.trim() && this.newUserPassword.trim()) {
      const newUser: User = {
        id: this.userIdCounter++,
        name: this.newUserName.trim(),
        groups: [],
        notes: [],
        logs: [{ action: 'Account created', timestamp: new Date(), isSuspicious: false }]
      };
      
      this.users.push(newUser);
      
      // Clear fields after adding
      this.newUserName = '';
      this.newUserPassword = '';
      
      if (!this.selectedUser) {
        this.selectUser(newUser);
      }
    } else {
      alert('Please provide both username and password!');
    }
  }

  deleteUser() {
    if (this.selectedUser) {
      this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
      this.selectedUser = null;
    }
  }

  // --- GROUP MANAGEMENT ---
  addGroup() {
    if (this.selectedUser && this.newGroupName.trim()) {
      this.selectedUser.groups.push(this.newGroupName.trim());
      this.logActivity(`Added to group: ${this.newGroupName.trim()}`, false);
      this.newGroupName = '';
    }
  }

  removeGroup(group: string) {
    if (this.selectedUser) {
      this.selectedUser.groups = this.selectedUser.groups.filter(g => g !== group);
      this.logActivity(`Removed from group: ${group}`, false);
    }
  }

  // --- NOTE MANAGEMENT ---
  addNote() {
    if (this.selectedUser && this.newNoteTitle.trim()) {
      this.selectedUser.notes.push(this.newNoteTitle.trim());
      this.logActivity(`Created note: ${this.newNoteTitle.trim()}`, false);
      this.newNoteTitle = '';
    }
  }

  removeNote(note: string) {
    if (this.selectedUser) {
      this.selectedUser.notes = this.selectedUser.notes.filter(n => n !== note);
      this.logActivity(`Deleted note: ${note}`, false);
    }
  }

  // --- MONITORING & ALERTS ---
  private logActivity(actionMessage: string, isSuspicious: boolean) {
    if (this.selectedUser) {
      this.selectedUser.logs.unshift({
        action: actionMessage,
        timestamp: new Date(),
        isSuspicious: isSuspicious
      });
    }
  }

  simulateMisuse() {
    if (this.selectedUser) {
      this.logActivity('MISUSE DETECTED: Note shared outside allowed group', true);
    }
  }

  sendAlert() {
    if (this.selectedUser) {
      const hasMisuse = this.selectedUser.logs.some(log => log.isSuspicious);
      if (hasMisuse) {
        alert(`WARNING SENT TO ${this.selectedUser.name}:\nWe detected unauthorized use of your notes. Please follow the platform guidelines.`);
      } else {
        alert(`Message sent to ${this.selectedUser.name}:\nPlease remember to keep your notes organized.`);
      }
    }
  }
}