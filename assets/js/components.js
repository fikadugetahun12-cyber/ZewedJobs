// ============================================
// UI COMPONENTS
// Reusable web components
// ============================================

'use strict';

// Toast Component
class ToastComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.duration = 5000;
    this.autoClose = true;
  }

  static get observedAttributes() {
    return ['type', 'message', 'duration'];
  }

  connectedCallback() {
    this.render();
    if (this.autoClose) {
      this.startAutoClose();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const type = this.getAttribute('type') || 'info';
    const message = this.getAttribute('message') || '';
    const duration = this.getAttribute('duration') || this.duration;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .toast {
          background: white;
          border-radius: 8px;
          padding: 16px 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideIn 0.3s ease;
          max-width: 350px;
        }
        
        .toast-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          padding: 0;
          margin-left: auto;
        }
        
        .toast-close:hover {
          color: #333;
        }
        
        .toast-icon {
          font-size: 20px;
        }
        
        .toast-info { border-left: 4px solid #4361ee; }
        .toast-success { border-left: 4px solid #4cc9f0; }
        .toast-warning { border-left: 4px solid #f8961e; }
        .toast-error { border-left: 4px solid #f94144; }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
      
      <div class="toast toast-${type}">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.host.remove()">&times;</button>
      </div>
    `;
  }

  getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type] || icons.info;
  }

  startAutoClose() {
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }
}

// Modal Component
class ModalComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
        }
        
        :host([open]) {
          display: block;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 4px 8px;
        }
        
        .modal-close:hover {
          color: #333;
        }
        
        .modal-body {
          margin-bottom: 24px;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
      
      <div class="modal-overlay" onclick="this.parentElement.host.close()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              <slot name="title">Modal Title</slot>
            </h3>
            <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.host.close()">&times;</button>
          </div>
          
          <div class="modal-body">
            <slot name="body">Modal content goes here...</slot>
          </div>
          
          <div class="modal-footer">
            <slot name="footer">
              <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.host.close()">Cancel</button>
              <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.host.close()">Confirm</button>
            </slot>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.setAttribute('open', '');
  }

  close() {
    this.isOpen = false;
    this.removeAttribute('open');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

// Tabs Component
class TabsComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.activeTab = 0;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const tabs = Array.from(this.querySelectorAll('tab-item'));
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 20px;
        }
        
        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          color: #6c757d;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;
        }
        
        .tab-button:hover {
          color: #4361ee;
        }
        
        .tab-button.active {
          color: #4361ee;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #4361ee;
        }
        
        .tabs-content {
          position: relative;
        }
        
        .tab-panel {
          display: none;
          animation: fadeIn 0.3s ease;
        }
        
        .tab-panel.active {
          display: block;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
      
      <div class="tabs">
        <div class="tabs-header">
          ${tabs.map((tab, index) => `
            <button class="tab-button ${index === this.activeTab ? 'active' : ''}" 
                    data-index="${index}">
              ${tab.getAttribute('label') || `Tab ${index + 1}`}
            </button>
          `).join('')}
        </div>
        
        <div class="tabs-content">
          ${tabs.map((tab, index) => `
            <div class="tab-panel ${index === this.activeTab ? 'active' : ''}">
              ${tab.innerHTML}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    this.shadowRoot.addEventListener('click', (event) => {
      const button = event.target.closest('.tab-button');
      if (button) {
        const index = parseInt(button.dataset.index);
        this.switchTab(index);
      }
    });
  }

  switchTab(index) {
    this.activeTab = index;
    this.render();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { index },
      bubbles: true
    }));
  }
}

// Custom element for tab items
class TabItem extends HTMLElement {
  constructor() {
    super();
  }
}

// Accordion Component
class AccordionComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const items = Array.from(this.querySelectorAll('accordion-item'));
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .accordion-item {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        
        .accordion-item:last-child {
          margin-bottom: 0;
        }
        
        .accordion-header {
          padding: 16px 20px;
          background: #f8f9fa;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 1rem;
          font-weight: 600;
          color: #212529;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s ease;
        }
        
        .accordion-header:hover {
          background: #e9ecef;
        }
        
        .accordion-icon {
          transition: transform 0.3s ease;
        }
        
        .accordion-icon.open {
          transform: rotate(180deg);
        }
        
        .accordion-content {
          padding: 0;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .accordion-content.open {
          padding: 20px;
          max-height: 1000px;
        }
        
        .accordion-content-inner {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .accordion-content.open .accordion-content-inner {
          opacity: 1;
        }
      </style>
      
      <div class="accordion">
        ${items.map((item, index) => `
          <div class="accordion-item">
            <button class="accordion-header" data-index="${index}">
              <span>${item.getAttribute('title') || `Item ${index + 1}`}</span>
              <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
              <div class="accordion-content-inner">
                ${item.innerHTML}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  setupEventListeners() {
    this.shadowRoot.addEventListener('click', (event) => {
      const header = event.target.closest('.accordion-header');
      if (header) {
        const index = parseInt(header.dataset.index);
        this.toggleItem(index);
      }
    });
  }

  toggleItem(index) {
    const content = this.shadowRoot.querySelectorAll('.accordion-content')[index];
    const icon = this.shadowRoot.querySelectorAll('.accordion-icon')[index];
    
    content.classList.toggle('open');
    icon.classList.toggle('open');
  }
}

// Custom element for accordion items
class AccordionItem extends HTMLElement {
  constructor() {
    super();
  }
}

// Progress Bar Component
class ProgressBarComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['value', 'max', 'show-percentage', 'animated'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const value = parseInt(this.getAttribute('value')) || 0;
    const max = parseInt(this.getAttribute('max')) || 100;
    const showPercentage = this.hasAttribute('show-percentage');
    const animated = this.hasAttribute('animated');
    
    const percentage = Math.min(100, (value / max) * 100);
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .progress-container {
          width: 100%;
          background: #e9ecef;
          border-radius: 8px;
          overflow: hidden;
          height: 12px;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4361ee, #7209b7);
          border-radius: 8px;
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar.animated::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.875rem;
          color: #6c757d;
        }
        
        .progress-percentage {
          font-weight: 600;
          color: #4361ee;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      </style>
      
      ${showPercentage ? `
        <div class="progress-info">
          <span class="progress-label"><slot></slot></span>
          <span class="progress-percentage">${Math.round(percentage)}%</span>
        </div>
      ` : ''}
      
      <div class="progress-container">
        <div class="progress-bar ${animated ? 'animated' : ''}" 
             style="width: ${percentage}%"></div>
      </div>
    `;
  }
}

// Rating Component
class RatingComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.rating = 0;
    this.maxRating = 5;
    this.readonly = false;
  }

  static get observedAttributes() {
    return ['value', 'max', 'readonly'];
  }

  connectedCallback() {
    this.rating = parseFloat(this.getAttribute('value')) || 0;
    this.maxRating = parseInt(this.getAttribute('max')) || 5;
    this.readonly = this.hasAttribute('readonly');
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this.rating = parseFloat(newValue);
      } else if (name === 'max') {
        this.maxRating = parseInt(newValue);
      } else if (name === 'readonly') {
        this.readonly = newValue !== null;
      }
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .rating-container {
          display: inline-flex;
          gap: 4px;
        }
        
        .rating-star {
          font-size: 24px;
          cursor: ${this.readonly ? 'default' : 'pointer'};
          color: #e9ecef;
          transition: color 0.2s ease;
          user-select: none;
        }
        
        .rating-star.filled {
          color: #ffd700;
        }
        
        .rating-star.half-filled::before {
          content: '★';
          position: absolute;
          width: 50%;
          overflow: hidden;
          color: #ffd700;
        }
        
        .rating-value {
          margin-left: 8px;
          font-weight: 600;
          color: #6c757d;
        }
      </style>
      
      <div class="rating-container">
        ${Array.from({ length: this.maxRating }, (_, i) => {
          const starValue = i + 1;
          let starClass = 'rating-star';
          
          if (this.rating >= starValue) {
            starClass += ' filled';
          } else if (this.rating >= starValue - 0.5) {
            starClass += ' half-filled';
          }
          
          return `<span class="${starClass}" data-value="${starValue}">★</span>`;
        }).join('')}
        <span class="rating-value">${this.rating.toFixed(1)}</span>
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.readonly) {
      this.shadowRoot.addEventListener('click', (event) => {
        const star = event.target.closest('.rating-star');
        if (star) {
          const value = parseInt(star.dataset.value);
          this.setRating(value);
        }
      });
      
      this.shadowRoot.addEventListener('mouseover', (event) => {
        if (!this.readonly) {
          const star = event.target.closest('.rating-star');
          if (star) {
            const value = parseInt(star.dataset.value);
            this.highlightStars(value);
          }
        }
      });
      
      this.shadowRoot.addEventListener('mouseout', () => {
        if (!this.readonly) {
          this.highlightStars(this.rating);
        }
      });
    }
  }

  setRating(value) {
    this.rating = value;
    this.setAttribute('value', value);
    this.render();
    
    // Dispatch change event
    this.dispatchEvent(new CustomEvent('rating-change', {
      detail: { rating: value },
      bubbles: true
    }));
  }

  highlightStars(value) {
    const stars = this.shadowRoot.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      const starValue = index + 1;
      if (starValue <= value) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }
}

// Counter Component
class CounterComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.count = 0;
    this.min = 0;
    this.max = Infinity;
    this.step = 1;
  }

  static get observedAttributes() {
    return ['value', 'min', 'max', 'step'];
  }

  connectedCallback() {
    this.count = parseInt(this.getAttribute('value')) || 0;
    this.min = parseInt(this.getAttribute('min')) || 0;
    this.max = parseInt(this.getAttribute('max')) || Infinity;
    this.step = parseInt(this.getAttribute('step')) || 1;
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this.count = parseInt(newValue) || 0;
      } else if (name === 'min') {
        this.min = parseInt(newValue) || 0;
      } else if (name === 'max') {
        this.max = parseInt(newValue) || Infinity;
      } else if (name === 'step') {
        this.step = parseInt(newValue) || 1;
      }
      this.updateDisplay();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .counter-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #4361ee;
          background: white;
          color: #4361ee;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .counter-button:hover:not(:disabled) {
          background: #4361ee;
          color: white;
        }
        
        .counter-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .counter-value {
          min-width: 40px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #212529;
        }
        
        .counter-input {
          width: 60px;
          padding: 4px 8px;
          border: 2px solid #dee2e6;
          border-radius: 4px;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
        }
        
        .counter-input:focus {
          outline: none;
          border-color: #4361ee;
        }
      </style>
      
      <button class="counter-button minus" ${this.count <= this.min ? 'disabled' : ''}>-</button>
      <span class="counter-value">${this.count}</span>
      <button class="counter-button plus" ${this.count >= this.max ? 'disabled' : ''}>+</button>
    `;
  }

  setupEventListeners() {
    const minusButton = this.shadowRoot.querySelector('.minus');
    const plusButton = this.shadowRoot.querySelector('.plus');
    const valueDisplay = this.shadowRoot.querySelector('.counter-value');
    
    minusButton.addEventListener('click', () => this.decrement());
    plusButton.addEventListener('click', () => this.increment());
    
    // Allow direct editing
    valueDisplay.addEventListener('click', () => this.showInput());
  }

  decrement() {
    const newValue = Math.max(this.min, this.count - this.step);
    if (newValue !== this.count) {
      this.count = newValue;
      this.updateDisplay();
      this.dispatchChangeEvent();
    }
  }

  increment() {
    const newValue = Math.min(this.max, this.count + this.step);
    if (newValue !== this.count) {
      this.count = newValue;
      this.updateDisplay();
      this.dispatchChangeEvent();
    }
  }

  updateDisplay() {
    const valueDisplay = this.shadowRoot.querySelector('.counter-value');
    const minusButton = this.shadowRoot.querySelector('.minus');
    const plusButton = this.shadowRoot.querySelector('.plus');
    
    if (valueDisplay) {
      valueDisplay.textContent = this.count;
    }
    
    if (minusButton) {
      minusButton.disabled = this.count <= this.min;
    }
    
    if (plusButton) {
      plusButton.disabled = this.count >= this.max;
    }
  }

  showInput() {
    const valueDisplay = this.shadowRoot.querySelector('.counter-value');
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'counter-input';
    input.value = this.count;
    input.min = this.min;
    input.max = this.max;
    input.step = this.step;
    
    valueDisplay.replaceWith(input);
    input.focus();
    input.select();
    
    const handleInput = () => {
      let value = parseInt(input.value);
      if (isNaN(value)) value = this.count;
      value = Math.max(this.min, Math.min(this.max, value));
      
      if (value !== this.count) {
        this.count = value;
        this.dispatchChangeEvent();
      }
      
      this.updateDisplay();
      input.replaceWith(valueDisplay);
    };
    
    input.addEventListener('blur', handleInput);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleInput();
      } else if (event.key === 'Escape') {
        input.replaceWith(valueDisplay);
      }
    });
  }

  dispatchChangeEvent() {
    this.setAttribute('value', this.count);
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.count },
      bubbles: true
    }));
  }
}

// Register all custom elements
function registerComponents() {
  customElements.define('app-toast', ToastComponent);
  customElements.define('app-modal', ModalComponent);
  customElements.define('app-tabs', TabsComponent);
  customElements.define('tab-item', TabItem);
  customElements.define('app-accordion', AccordionComponent);
  customElements.define('accordion-item', AccordionItem);
  customElements.define('app-progress', ProgressBarComponent);
  customElements.define('app-rating', RatingComponent);
  customElements.define('app-counter', CounterComponent);
  
  console.log('Web Components registered successfully');
}

// Export components
window.Components = {
  Toast: ToastComponent,
  Modal: ModalComponent,
  Tabs: TabsComponent,
  Accordion: AccordionComponent,
  ProgressBar: ProgressBarComponent,
  Rating: RatingComponent,
  Counter: CounterComponent,
  register: registerComponents
};

// Auto-register on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerComponents);
} else {
  registerComponents();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Components;
}
