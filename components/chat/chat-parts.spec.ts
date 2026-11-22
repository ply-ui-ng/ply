import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatBubbleComponent } from './chat-bubble.component';
import { ChatAttachmentComponent } from './chat-attachment.component';
import { ChatMarkerComponent } from './chat-marker.component';

describe('chat parts', () => {
  it('renders a user bubble, a file chip, and a day marker', async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBubbleComponent, ChatAttachmentComponent, ChatMarkerComponent],
    }).compileComponents();
    const bubble = TestBed.createComponent(ChatBubbleComponent);
    bubble.componentRef.setInput('role', 'user');
    bubble.componentRef.setInput('content', 'Hello');
    bubble.detectChanges();
    expect(bubble.nativeElement.textContent).toContain('Hello');

    const file = TestBed.createComponent(ChatAttachmentComponent);
    file.componentRef.setInput('name', 'brief.pdf');
    file.componentRef.setInput('detail', '24 KB');
    file.detectChanges();
    expect(file.nativeElement.textContent).toContain('brief.pdf');
    expect(file.nativeElement.textContent).toContain('24 KB');

    const marker: ComponentFixture<ChatMarkerComponent> = TestBed.createComponent(ChatMarkerComponent);
    marker.componentRef.setInput('label', 'Today');
    marker.detectChanges();
    expect(marker.nativeElement.textContent).toContain('Today');
  });
});
