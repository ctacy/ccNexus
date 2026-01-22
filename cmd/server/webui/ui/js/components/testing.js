import { api } from '../api.js';
import { notifications } from '../utils/notifications.js';
import { t } from '../i18n/index.js';

class Testing {
    constructor() {
        this.container = document.getElementById('view-container');
        this.endpoints = [];
    }

    async render() {
        this.container.innerHTML = `
            <div class="testing">
                <h1>${t('testing.title')}</h1>

                <div class="card mt-3">
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">${t('testing.selectEndpoint')}</label>
                            <select class="form-select" id="test-endpoint-select">
                                <option value="">${t('common.loading')}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <button class="btn btn-primary" id="test-btn">${t('testing.sendRequest')}</button>
                        </div>

                        <div id="test-result" class="mt-3" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('test-btn').addEventListener('click', () => this.runTest());

        await this.loadEndpoints();
    }

    async loadEndpoints() {
        try {
            const data = await api.getEndpoints();
            this.endpoints = data.endpoints || [];

            const select = document.getElementById('test-endpoint-select');
            const enabledEndpoints = this.endpoints.filter(ep => ep.enabled);

            if (enabledEndpoints.length === 0) {
                select.innerHTML = `<option value="">${t('testing.noEndpoints')}</option>`;
                return;
            }

            select.innerHTML = enabledEndpoints.map(ep =>
                `<option value="${this.escapeHtml(ep.name)}">${this.escapeHtml(ep.name)}</option>`
            ).join('');
        } catch (error) {
            notifications.error(t('stats.loadFailed') + ': ' + error.message);
        }
    }

    async runTest() {
        const select = document.getElementById('test-endpoint-select');
        const endpointName = select.value;

        if (!endpointName) {
            notifications.warning(t('testing.selectEndpointFirst'));
            return;
        }

        const resultDiv = document.getElementById('test-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div class="flex-center"><div class="spinner"></div></div>';

        try {
            const result = await api.testEndpoint(endpointName);

            if (result.success) {
                resultDiv.innerHTML = `
                    <div class="card" style="background-color: var(--bg-secondary);">
                        <div class="mb-2">
                            <span class="badge badge-success">${t('common.success')}</span>
                            <span class="text-muted ml-2">${t('test.latency')}: ${result.latency}ms</span>
                        </div>
                        <div>
                            <strong>${t('test.response')}:</strong>
                            <div class="code-block mt-1">${this.escapeHtml(result.response || t('test.noResponse'))}</div>
                        </div>
                    </div>
                `;
                notifications.success(t('test.testSuccess').replace('{latency}', result.latency));
            } else {
                resultDiv.innerHTML = `
                    <div class="card" style="background-color: var(--bg-secondary);">
                        <div class="mb-2">
                            <span class="badge badge-danger">${t('common.failed')}</span>
                        </div>
                        <div>
                            <strong>Error:</strong>
                            <div class="code-block mt-1">${this.escapeHtml(result.error || 'Unknown error')}</div>
                        </div>
                    </div>
                `;
                notifications.error(t('test.testFailed'));
            }
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="card" style="background-color: var(--bg-secondary);">
                    <div class="mb-2">
                        <span class="badge badge-danger">Error</span>
                    </div>
                    <div>
                        <strong>Error:</strong>
                        <div class="code-block mt-1">${this.escapeHtml(error.message)}</div>
                    </div>
                </div>
            `;
            notifications.error(t('testing.requestFailed') + ': ' + error.message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export const testing = new Testing();

