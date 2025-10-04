class TicketSummarizer {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.ticketInput = document.getElementById("ticketInput");
    this.summaryType = document.getElementById("summaryType");
    this.priority = document.getElementById("priority");
    this.summarizeBtn = document.getElementById("summarizeBtn");
    this.outputSection = document.querySelector(".output-section");
    this.summaryOutput = document.getElementById("summaryOutput");
    this.detectedPriority = document.getElementById("detectedPriority");
    this.category = document.getElementById("category");
    this.sentiment = document.getElementById("sentiment");
    this.copyBtn = document.getElementById("copyBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.toast = document.getElementById("toast");
    this.spinner = document.querySelector(".spinner");
    this.btnText = document.querySelector(".btn-text");
  }

  bindEvents() {
    this.summarizeBtn.addEventListener("click", () => this.summarizeTicket());
    this.copyBtn.addEventListener("click", () => this.copySummary());
    this.clearBtn.addEventListener("click", () => this.clearAll());
  }

  async summarizeTicket() {
    const ticketText = this.ticketInput.value.trim();

    if (!ticketText) {
      this.showToast("Please enter ticket content to summarize", "error");
      return;
    }
    this.setLoading(true);

    try {
      const summary = await this.getSummary(ticketText);
      this.displayResults(summary);
      this.showToast("Ticket summarized successfully!", "success");
    } catch (error) {
      this.showToast("Error processing ticket. Please try again.", "error");
      console.error("Summarization error:", error);
    } finally {
      this.setLoading(false);
    }
  }

  async getSummary(ticketText) {
    const data = {
      content: ticketText,
      summary_type: this.summaryType.value.trim(),
      priority: this.priority.value.trim(),
    };
    const req = await fetch("/api/summarize", {
      method: "POSt",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const res = await req.json();
    return res;
  }

  displayResults(result) {
    this.summaryOutput.innerHTML = result.summary.replace(/\n/g, "<br>");
    this.detectedPriority.textContent = result.priority;
    this.detectedPriority.className = `value priority-badge priority-${result.priority}`;
    this.category.textContent = result.category;
    this.sentiment.textContent = result.sentiment;

    this.outputSection.style.display = "block";
    this.outputSection.scrollIntoView({ behavior: "smooth" });
  }

  async copySummary() {
    try {
      const summaryText = this.summaryOutput.textContent;
      await navigator.clipboard.writeText(summaryText);
      this.showToast("Summary copied to clipboard!", "success");
    } catch (error) {
      this.showToast("Failed to copy to clipboard", "error");
    }
  }

  clearAll() {
    this.ticketInput.value = "";
    this.outputSection.style.display = "none";
    this.summaryType.selectedIndex = 0;
    this.priority.selectedIndex = 0;
    this.showToast("Form cleared", "info");
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.spinner.style.display = "inline-block";
      this.btnText.textContent = "Processing...";
      this.summarizeBtn.disabled = true;
    } else {
      this.spinner.style.display = "none";
      this.btnText.textContent = "Summarize Ticket";
      this.summarizeBtn.disabled = false;
    }
  }

  showToast(message, type = "info") {
    this.toast.textContent = message;
    this.toast.className = `toast toast-${type}`;
    this.toast.style.display = "block";

    setTimeout(() => {
      this.toast.style.display = "none";
    }, 3000);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new TicketSummarizer();
});