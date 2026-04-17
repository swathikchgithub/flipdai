import { Message, InterviewContext, DialogueState } from "./types";

export class DialogueManager {
  private state: DialogueState = {
    messages: [],
    isLoading: false,
    error: null,
    phase: "loading"
  };

  private onStateChange: (state: DialogueState) => void;

  constructor(onStateChange: (state: DialogueState) => void) {
    this.onStateChange = onStateChange;
  }

  private updateState(patch: Partial<DialogueState>) {
    this.state = { ...this.state, ...patch };
    this.onStateChange(this.state);
  }

  public async sendMessage(text: string, context: InterviewContext, displayText?: string) {
    if (this.state.isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: displayText || text };
    const messages = [...this.state.messages, userMsg];
    
    // The history for the API should have the RAW text (with nudges), but UI shows clean text
    const apiHistory = [
      ...this.state.messages.map(m => ({ role: m.role, content: m.id.includes("temp") ? m.content : m.content })), // history
      { role: "user", content: text } // the new message with raw content
    ];

    console.log(`📡 [DIALOGUE] Sending turn ${messages.length}. AI receives ${text.length} chars, UI shows ${userMsg.content.length} chars.`);
    
    this.updateState({ 
      messages, 
      isLoading: true, 
      error: null 
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: apiHistory.map(m => ({ role: m.role, content: m.content })),
          topic: context.topic,
          subcategory: context.subcategory,
          model: context.model
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Communication failure with Alex.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Recruiter stream disconnected.");

      const decoder = new TextDecoder();
      let aiContent = "";
      const aiMsgId = (Date.now() + 1).toString();
      
      // Initial placeholder for stream
      this.updateState({ 
        messages: [...messages, { id: aiMsgId, role: "assistant", content: "" }]
      });

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) {
              console.error("❌ [API ERROR]:", parsed.error);
              this.updateState({ error: parsed.error, isLoading: false });
              return null;
            }
            if (parsed.delta) {
              aiContent += parsed.delta;
              // CRITICAL: We update this.state directly to ensure the NEXT turn has the history
              const updatedMessages: Message[] = this.state.messages.map(m => 
                m.id === aiMsgId ? { ...m, content: aiContent } : m
              );
              this.updateState({ messages: updatedMessages });
            }
          } catch {}
        }
      }

      console.log(`✅ [DIALOGUE] Turn ${messages.length + 1} complete. Alex said: "${aiContent.slice(0, 30)}..."`);
      return aiContent;

    } catch (e: any) {
      console.error("❌ [DIALOGUE] Error:", e);
      this.updateState({ error: e.message });
      throw e;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  public setPhase(phase: DialogueState["phase"]) {
    this.updateState({ phase });
  }

  public initialize(messages: Message[]) {
    this.updateState({ messages, phase: "intro" });
  }
}
