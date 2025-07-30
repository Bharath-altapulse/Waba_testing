// WhatsApp Chat Board Application
class WhatsAppChatBoard {
    constructor() {
        this.items = [
            {
                id: 1,
                recipientName: "John Smith",
                mobileNumber: "+1234567890",
                text: "Hello! This is a test message from our WhatsApp integration.",
                status: "Draft"
            },
            {
                id: 2, 
                recipientName: "Sarah Johnson",
                mobileNumber: "+9876543210",
                text: "Your order has been confirmed and will be delivered within 2-3 business days.",
                status: "Draft"
            }
        ];
        this.nextId = 3;
        this.init();
    }

    init() {
        this.tableBody = document.getElementById('tableBody');
        this.addItemBtn = document.getElementById('addItemBtn');
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        this.addItemBtn.addEventListener('click', () => this.addNewItem());
        this.renderTable();
    }

    // Render the entire table
    renderTable() {
        this.tableBody.innerHTML = '';
        this.items.forEach(item => {
            this.renderTableRow(item);
        });
    }

    // Render a single table row
    renderTableRow(item) {
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.setAttribute('data-item-id', item.id);

        row.innerHTML = `
            <td class="table-cell">
                <input 
                    type="text" 
                    class="cell-input" 
                    value="${this.escapeHtml(item.recipientName)}" 
                    placeholder="Enter recipient name"
                    data-field="recipientName"
                    required
                >
            </td>
            <td class="table-cell">
                <input 
                    type="tel" 
                    class="cell-input" 
                    value="${this.escapeHtml(item.mobileNumber)}" 
                    placeholder="+1234567890"
                    data-field="mobileNumber"
                    required
                >
            </td>
            <td class="table-cell">
                <textarea 
                    class="cell-input cell-textarea" 
                    placeholder="Enter your message"
                    data-field="text"
                    required
                >${this.escapeHtml(item.text)}</textarea>
            </td>
            <td class="table-cell">
                <select class="cell-select" data-field="status">
                    <option value="Draft" ${item.status === 'Draft' ? 'selected' : ''}>Draft</option>
                    <option value="Send" ${item.status === 'Send' ? 'selected' : ''}>Send</option>
                </select>
            </td>
            <td class="table-cell">
                <button class="delete-btn" title="Delete item">
                    ✕
                </button>
            </td>
        `;

        // Add event listeners
        this.addRowEventListeners(row, item.id);
        this.tableBody.appendChild(row);
    }

    // Add event listeners to a row
    addRowEventListeners(row, itemId) {
        const inputs = row.querySelectorAll('.cell-input, .cell-select');
        const deleteBtn = row.querySelector('.delete-btn');

        inputs.forEach(input => {
            if (input.dataset.field === 'status') {
                input.addEventListener('change', (e) => this.handleStatusChange(itemId, e.target.value, e.target));
            } else {
                input.addEventListener('blur', (e) => this.handleFieldChange(itemId, e.target.dataset.field, e.target.value));
                input.addEventListener('input', (e) => this.validateField(e.target));
            }
        });

        deleteBtn.addEventListener('click', () => this.deleteItem(itemId));
    }

    // Handle field changes
    handleFieldChange(itemId, field, value) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item[field] = value;
            
            // Validate phone number if it's the mobile number field
            if (field === 'mobileNumber') {
                const row = document.querySelector(`[data-item-id="${itemId}"]`);
                const input = row.querySelector('[data-field="mobileNumber"]');
                this.validatePhoneNumber(input);
            }
        }
    }

    // Handle status changes
    async handleStatusChange(itemId, status, selectElement) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        if (status === 'Send') {
            // Validate required fields before sending
            if (!this.validateItem(item)) {
                // Reset status back to Draft
                selectElement.value = 'Draft';
                this.showToast('Please fill in all required fields before sending', 'error');
                return;
            }

            // Simulate WhatsApp API call
            try {
                await this.sendWhatsAppMessage(item, selectElement);
            } catch (error) {
                // Reset status back to Draft on error
                selectElement.value = 'Draft';
                item.status = 'Draft';
            }
        } else {
            item.status = status;
        }
    }

    // Simulate WhatsApp API call
    async sendWhatsAppMessage(item, selectElement) {
        this.showLoading(true);
        
        try {
            // Simulate API delay
            await this.delay(2000);
            
            // Simulate random success/failure (90% success rate)
            const success = Math.random() > 0.1;
            
            if (success) {
                // Generate fake message ID
                const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                item.status = 'Draft'; // Reset to Draft after successful send
                selectElement.value = 'Draft';
                
                this.showToast(
                    `Message sent successfully to ${item.recipientName} (${item.mobileNumber}). Message ID: ${messageId}`,
                    'success'
                );
            } else {
                // Reset status back to Draft on failure
                item.status = 'Draft';
                selectElement.value = 'Draft';
                
                this.showToast(
                    `Failed to send message to ${item.recipientName}. Please try again.`,
                    'error'
                );
            }
        } catch (error) {
            item.status = 'Draft';
            selectElement.value = 'Draft';
            this.showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Helper function to create a delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Validate an entire item
    validateItem(item) {
        const isNameValid = item.recipientName && item.recipientName.trim().length > 0;
        const isPhoneValid = this.isValidPhoneNumber(item.mobileNumber);
        const isTextValid = item.text && item.text.trim().length > 0;
        
        return isNameValid && isPhoneValid && isTextValid;
    }

    // Validate individual field
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;

        switch (input.dataset.field) {
            case 'recipientName':
                isValid = value.length > 0;
                break;
            case 'mobileNumber':
                isValid = this.isValidPhoneNumber(value);
                break;
            case 'text':
                isValid = value.length > 0;
                break;
        }

        if (isValid) {
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
        }

        return isValid;
    }

    // Validate phone number
    validatePhoneNumber(input) {
        const isValid = this.isValidPhoneNumber(input.value);
        
        if (isValid) {
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
        }
        
        return isValid;
    }

    // Check if phone number is valid (E.164 format)
    isValidPhoneNumber(phoneNumber) {
        if (!phoneNumber) return false;
        
        // Basic E.164 format validation: +[country code][number]
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
    }

    // Add new item
    addNewItem() {
        const newItem = {
            id: this.nextId++,
            recipientName: '',
            mobileNumber: '',
            text: '',
            status: 'Draft'
        };
        
        this.items.push(newItem);
        this.renderTableRow(newItem);
        
        // Focus on the first input of the new row
        setTimeout(() => {
            const newRow = document.querySelector(`[data-item-id="${newItem.id}"]`);
            if (newRow) {
                const firstInput = newRow.querySelector('.cell-input');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }, 100);
    }

    // Delete item
    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.items = this.items.filter(item => item.id !== itemId);
            const row = document.querySelector(`[data-item-id="${itemId}"]`);
            if (row) {
                row.remove();
            }
            this.showToast('Item deleted successfully', 'success');
        }
    }

    // Show loading overlay
    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icon = type === 'success' ? '✓' : '✕';
        const iconClass = type === 'success' ? 'toast-icon--success' : 'toast-icon--error';
        
        toast.innerHTML = `
            <span class="toast-icon ${iconClass}">${icon}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close">✕</button>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);

        this.toastContainer.appendChild(toast);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppChatBoard();
});