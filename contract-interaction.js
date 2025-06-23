// Contract Interaction Page Logic
class ContractInteractionUI {
    constructor() {
        this.contractAddress = null;
        this.contractInfo = null;
        this.currentTab = 'read';
        this.selectedFunction = null;
        this.contractManager = null;
        
        this.init();
    }

    async init() {
        // Get contract address from URL params
        const urlParams = new URLSearchParams(window.location.search);
        this.contractAddress = urlParams.get('address');
        
        if (!this.contractAddress) {
            this.showError('No contract address provided');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Load contract info from background
        await this.loadContractInfo();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.function-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Back button
        document.getElementById('back-button').addEventListener('click', () => {
            window.close();
        });
    }

    async loadContractInfo() {
        try {
            // Request contract info from background script
            const response = await chrome.runtime.sendMessage({
                action: 'GET_CONTRACT_INFO',
                address: this.contractAddress
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to load contract info');
            }

            this.contractInfo = response.contract;
            this.displayContractInfo();
            this.displayFunctions();
        } catch (error) {
            console.error('Error loading contract:', error);
            this.showError('Failed to load contract information');
        }
    }

    displayContractInfo() {
        document.getElementById('contract-name').textContent = this.contractInfo.name;
        document.getElementById('contract-address').textContent = this.contractInfo.address;
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab UI
        document.querySelectorAll('.function-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        this.displayFunctions();
    }

    displayFunctions() {
        const functionList = document.getElementById('function-list');
        functionList.innerHTML = '';

        // Get functions for current tab
        const functions = this.getFunctionsForTab();
        
        if (functions.length === 0) {
            functionList.innerHTML = '<p style="text-align: center; color: #666;">No functions found</p>';
            return;
        }

        functions.forEach(func => {
            const item = this.createFunctionItem(func);
            functionList.appendChild(item);
        });
    }

    getFunctionsForTab() {
        if (!this.contractInfo || !this.contractInfo.abi) return [];

        const functions = [];
        
        this.contractInfo.abi.forEach(item => {
            if (item.type === 'function') {
                const stateMutability = item.stateMutability || 'nonpayable';
                
                if (this.currentTab === 'read' && (stateMutability === 'view' || stateMutability === 'pure')) {
                    functions.push(item);
                } else if (this.currentTab === 'write' && stateMutability === 'nonpayable') {
                    functions.push(item);
                } else if (this.currentTab === 'payable' && stateMutability === 'payable') {
                    functions.push(item);
                }
            }
        });

        return functions;
    }

    createFunctionItem(func) {
        const div = document.createElement('div');
        div.className = 'function-item';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'function-name';
        nameDiv.textContent = func.name;
        
        const inputsDiv = document.createElement('div');
        inputsDiv.className = 'function-inputs';
        
        if (func.inputs && func.inputs.length > 0) {
            const inputTypes = func.inputs.map(input => 
                `${input.name || 'param'}: ${input.type}`
            ).join(', ');
            inputsDiv.textContent = `(${inputTypes})`;
        } else {
            inputsDiv.textContent = '(no parameters)';
        }
        
        div.appendChild(nameDiv);
        div.appendChild(inputsDiv);
        
        div.addEventListener('click', () => this.selectFunction(func));
        
        return div;
    }

    selectFunction(func) {
        this.selectedFunction = func;
        
        // Update UI
        document.querySelectorAll('.function-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        this.displayFunctionForm();
    }

    displayFunctionForm() {
        const container = document.getElementById('function-form-container');
        container.innerHTML = '';

        if (!this.selectedFunction) return;

        const form = document.createElement('div');
        form.className = 'function-form';
        
        const title = document.createElement('h3');
        title.textContent = this.selectedFunction.name;
        form.appendChild(title);

        // Add input fields
        if (this.selectedFunction.inputs && this.selectedFunction.inputs.length > 0) {
            this.selectedFunction.inputs.forEach((input, index) => {
                const inputGroup = this.createInputField(input, index);
                form.appendChild(inputGroup);
            });
        }

        // Add payable amount field if needed
        if (this.selectedFunction.stateMutability === 'payable') {
            const payableDiv = document.createElement('div');
            payableDiv.className = 'payable-amount';
            
            const label = document.createElement('label');
            label.className = 'input-label';
            label.textContent = 'Amount to Send (PLS)';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'payable-amount';
            input.className = 'function-input';
            input.placeholder = '0.0';
            input.step = '0.000001';
            
            payableDiv.appendChild(label);
            payableDiv.appendChild(input);
            form.appendChild(payableDiv);
        }

        // Add execute button
        const button = document.createElement('button');
        button.className = 'execute-button';
        button.innerHTML = '<i class="fas fa-play"></i> Execute Function';
        button.addEventListener('click', () => this.executeFunction());
        
        form.appendChild(button);
        container.appendChild(form);
    }

    createInputField(input, index) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.className = 'input-label';
        label.innerHTML = `${input.name || `param${index}`} <span class="input-type">(${input.type})</span>`;
        
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.id = `input-${index}`;
        inputField.className = 'function-input';
        inputField.placeholder = this.getPlaceholderForType(input.type);
        inputField.dataset.type = input.type;
        
        group.appendChild(label);
        group.appendChild(inputField);
        
        return group;
    }

    getPlaceholderForType(type) {
        if (type.startsWith('uint') || type.startsWith('int')) {
            return '0';
        } else if (type === 'address') {
            return '0x...';
        } else if (type === 'bool') {
            return 'true or false';
        } else if (type.startsWith('bytes')) {
            return '0x...';
        } else if (type === 'string') {
            return 'Enter text...';
        }
        return 'Enter value...';
    }

    async executeFunction() {
        try {
            this.hideResult();
            this.hideError();
            
            // Gather input values
            const params = this.gatherInputValues();
            
            // Get payable amount if needed
            const value = this.selectedFunction.stateMutability === 'payable' 
                ? document.getElementById('payable-amount')?.value || '0'
                : '0';

            // Determine if it's a read or write function
            const isReadOnly = this.selectedFunction.stateMutability === 'view' || 
                               this.selectedFunction.stateMutability === 'pure';

            const message = {
                action: isReadOnly ? 'CONTRACT_READ' : 'CONTRACT_WRITE',
                contractAddress: this.contractAddress,
                functionName: this.selectedFunction.name,
                params: params,
                value: value,
                abi: this.contractInfo.abi
            };

            // Disable button
            const button = document.querySelector('.execute-button');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';

            // Send message to background
            const response = await chrome.runtime.sendMessage(message);

            if (!response || !response.success) {
                throw new Error(response?.error || 'Function execution failed');
            }

            // Display result
            if (isReadOnly) {
                this.showResult(response.result);
            } else {
                this.showTransactionResult(response.hash);
            }

        } catch (error) {
            console.error('Error executing function:', error);
            this.showError(error.message);
        } finally {
            // Re-enable button
            const button = document.querySelector('.execute-button');
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play"></i> Execute Function';
            }
        }
    }

    gatherInputValues() {
        const params = [];
        
        if (this.selectedFunction.inputs) {
            this.selectedFunction.inputs.forEach((input, index) => {
                const inputField = document.getElementById(`input-${index}`);
                const value = inputField.value;
                const type = inputField.dataset.type;
                
                // Convert value based on type
                params.push(this.convertInputValue(value, type));
            });
        }
        
        return params;
    }

    convertInputValue(value, type) {
        if (type.startsWith('uint') || type.startsWith('int')) {
            return value;
        } else if (type === 'bool') {
            return value.toLowerCase() === 'true';
        } else if (type.endsWith('[]')) {
            // Handle array types
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map(v => v.trim());
            }
        }
        return value;
    }

    showResult(result) {
        const container = document.getElementById('result-container');
        container.style.display = 'block';
        container.className = 'result-container';
        
        let formattedResult;
        if (typeof result === 'object') {
            formattedResult = JSON.stringify(result, null, 2);
        } else {
            formattedResult = result.toString();
        }
        
        container.innerHTML = `
            <div class="result-title">Result:</div>
            <div class="result-content">${SecurityUtils.escapeHtml(formattedResult)}</div>
        `;
    }

    showTransactionResult(hash) {
        const container = document.getElementById('result-container');
        container.style.display = 'block';
        container.className = 'result-container';
        
        container.innerHTML = `
            <div class="result-title">Transaction Submitted!</div>
            <div class="result-content">
                Transaction Hash: ${SecurityUtils.escapeHtml(hash)}<br><br>
                <a href="#" id="view-explorer" style="color: #4169e1;">View on Block Explorer</a>
            </div>
        `;
        
        // Add explorer link handler
        document.getElementById('view-explorer').addEventListener('click', async (e) => {
            e.preventDefault();
            const response = await chrome.runtime.sendMessage({ action: 'GET_EXPLORER_URL' });
            if (response && response.url) {
                window.open(`${response.url}/tx/${hash}`, '_blank');
            }
        });
    }

    showError(message) {
        const container = document.getElementById('result-container');
        container.style.display = 'block';
        container.className = 'error-container';
        container.innerHTML = `<strong>Error:</strong> ${SecurityUtils.escapeHtml(message)}`;
    }

    hideResult() {
        const container = document.getElementById('result-container');
        container.style.display = 'none';
        container.innerHTML = '';
    }

    hideError() {
        this.hideResult();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContractInteractionUI();
});