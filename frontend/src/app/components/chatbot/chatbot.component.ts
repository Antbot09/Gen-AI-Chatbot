import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, ChatResponse } from '@app/services/chat.service';

interface Message {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  messages: Message[] = [];
  newMessage: string = '';
  
  // Window size properties
  width: number = 600;
  height: number = 600;
  isMinimized: boolean = false;
  private minWidth: number = 300;
  private minHeight: number = 400;
  private isResizing: boolean = false;
  private initialX: number = 0;
  private initialY: number = 0;
  private initialWidth: number = 0;
  private initialHeight: number = 0;

  // Inactivity timer properties
  private readonly INACTIVITY_TIMEOUT = 15000; // 15 seconds in milliseconds
  private inactivityTimer: any;
  private lastUserInteraction: number = Date.now();
  private hasEndedChat: boolean = false;

  constructor(private chatService: ChatService) {
    // Add event listeners for resize
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  ngOnInit(): void {
    this.messages.push({ text: 'Hello! How can I help you with your internet service today?', isUser: false });
    this.startInactivityTimer();
  }

  ngOnDestroy(): void {
    // Clean up event listeners and timers
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.clearInactivityTimer();
  }

  private startInactivityTimer(): void {
    this.clearInactivityTimer();
    this.inactivityTimer = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - this.lastUserInteraction;
      if (timeSinceLastInteraction >= this.INACTIVITY_TIMEOUT && !this.hasEndedChat) {
        this.sendEndingMessage();
      }
    }, 1000); // Check every second
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
    }
  }

  private sendEndingMessage(): void {
    this.hasEndedChat = true;
    this.clearInactivityTimer();
    this.messages.push({
      text: 'Thank you for chatting with us today! Since I haven\'t heard from you in a while, I\'ll end our conversation here. If you need further assistance, feel free to start a new chat. Have a great day!',
      isUser: false
    });
  }

  resetInactivityTimer(): void {
    if (this.hasEndedChat) {
      return;
    }
    this.lastUserInteraction = Date.now();
  }

  private scrollToBottom(): void {
    try {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  startResize(event: MouseEvent): void {
    this.isResizing = true;
    this.initialX = event.clientX;
    this.initialY = event.clientY;
    this.initialWidth = this.width;
    this.initialHeight = this.height;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.initialX;
    const deltaY = event.clientY - this.initialY;

    this.width = Math.max(this.minWidth, this.initialWidth + deltaX);
    this.height = Math.max(this.minHeight, this.initialHeight + deltaY);
  }

  private handleMouseUp(): void {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }

    if (this.hasEndedChat) {
      // Reset chat if it was ended due to inactivity
      this.hasEndedChat = false;
      this.messages = []; // Clear previous messages
      this.messages.push({ text: 'Hello! How can I help you with your internet service today?', isUser: false });
    }

    this.resetInactivityTimer();
    this.messages.push({ text: this.newMessage, isUser: true });
    const userMessage = this.newMessage;
    this.newMessage = '';

    // Add loading message
    const loadingIndex = this.messages.length;
    this.messages.push({ text: 'Typing...', isUser: false });

    this.chatService.sendMessage(userMessage).subscribe({
      next: (response: ChatResponse) => {
        this.resetInactivityTimer();
        // Replace loading message with actual response
        this.messages[loadingIndex] = { text: response.response, isUser: false };
        // Ensure smooth scrolling after content is updated
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        this.resetInactivityTimer();
        // Replace loading message with error
        this.messages[loadingIndex] = { text: 'Sorry, I encountered an error. Please try again.', isUser: false };
        console.error('Chat error:', error);
        // Ensure smooth scrolling after error message
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });

    this.chatService.sendMessage(userMessage).subscribe((response: ChatResponse) => {
      this.messages.push({ text: response.response, isUser: false });
    });
  }
}
