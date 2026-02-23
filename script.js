const MAX_ITEMS = 5;
let webhookConfigs = [];

window.onload = () => {
    const cachedData = localStorage.getItem('webhook_configs_v2');
    if (cachedData) {
        try {
            webhookConfigs = JSON.parse(cachedData);
        } catch(e) {
            initEmptyConfigs();
        }
    } else {
        initEmptyConfigs();
    }
    renderList();
};

function initEmptyConfigs() {
    webhookConfigs = [];
    for (let i = 0; i < MAX_ITEMS; i++) {
        webhookConfigs.push({ name: '', url: '' });
    }
}

function renderList() {
    const container = document.getElementById('webhook-list');
    container.innerHTML = '';

    webhookConfigs.forEach((config, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <span class="badge">項目 ${index + 1}</span>
            <div class="input-group">
                <label>項目名</label>
                <input type="text" id="name-${index}" placeholder="例: Slack通知" value="${config.name || ''}">
            </div>
            <div class="input-group">
                <label>Webhook URL</label>
                <input type="url" id="url-${index}" placeholder="https://hooks.example.com/..." value="${config.url || ''}">
            </div>
            <button class="btn btn-send" onclick="sendWebhook(${index})">このWebhookを起動</button>
        `;
        container.appendChild(div);
    });
}

function saveAllSettings() {
    for (let i = 0; i < MAX_ITEMS; i++) {
        webhookConfigs[i] = {
            name: document.getElementById(`name-${i}`).value,
            url: document.getElementById(`url-${i}`).value
        };
    }
    localStorage.setItem('webhook_configs_v2', JSON.stringify(webhookConfigs));
    alert('保存しました');
}

async function sendWebhook(index) {
    const url = document.getElementById(`url-${index}`).value;
    const name = document.getElementById(`name-${index}`).value || `項目 ${index + 1}`;

    if (!url) return alert('URLを入力してください');

    try {
        // スマホ環境でのエラー確認のためtry-catchを強化
        const response = await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: name, date: new Date().toISOString() })
        });
        alert('送信リクエスト完了');
    } catch (error) {
        alert('送信失敗: ' + error.message);
    }
}

function exportSettings() {
    saveAllSettings();
    const data = JSON.stringify(webhookConfigs, null, 2);
    const blob = new Blob([data], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'webhook_settings.txt';
    link.click();
}

function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                webhookConfigs = imported.slice(0, MAX_ITEMS);
                // 足りない分を補完
                while(webhookConfigs.length < MAX_ITEMS) {
                    webhookConfigs.push({name: '', url: ''});
                }
                renderList();
                localStorage.setItem('webhook_configs_v2', JSON.stringify(webhookConfigs));
                alert('読み込み完了');
            }
        } catch (err) {
            alert('ファイルの形式が正しくありません');
        }
    };
    reader.readAsText(file);
}
