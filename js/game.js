        // ========== データ定義 ==========
        const TILE_TYPES = {
            NORMAL: { id: 'normal', name: '通常', color: 'tile-normal', effect: null },
            FORWARD: { id: 'forward', name: '進む', color: 'tile-forward', effect: { type: 'move', value: 3 } },
            BACKWARD: { id: 'backward', name: '戻る', color: 'tile-backward', effect: { type: 'move', value: -3 } },
            ITEM: { id: 'item', name: 'アイテム', color: 'tile-item', effect: { type: 'item' } },
            EVENT: { id: 'event', name: 'イベント', color: 'tile-event', effect: { type: 'event' } },
            START: { id: 'start', name: 'スタート', color: 'tile-start', effect: null },
            GOAL: { id: 'goal', name: 'ゴール', color: 'tile-goal', effect: null },
            REST: { id: 'rest', name: '休み', color: 'tile-rest', effect: { type: 'rest', value: 1 } }
        };
        
        const ITEMS = [
            { id: 'boots',      name: '魔法の靴',         icon: '👟', effect: '次のターン移動量+2' },
            { id: 'shield',     name: '盾',               icon: '🛡️', effect: '戻るマスの効果を1回無効化' },
            { id: 'binoculars', name: '双眼鏡',           icon: '🔭', effect: 'サイコロを2回振り好きな目を選べる' },
            { id: 'timestop',   name: 'タイムストップ',   icon: '⏸️', effect: '自分以外の全プレイヤーが1ターン休み' },
            { id: 'koshindo',   name: 'コシンドスプレー', icon: '💨', effect: '止まったマスの効果を1度だけ無効化（着地後使用）' },
            { id: 'sakasama',   name: '逆さまスプレー',   icon: '🔄', effect: 'サイコロの目だけ逆方向に移動（サイコロ後使用）' },
            { id: 'star',       name: 'スター',           icon: '⭐', effect: 'リザルトに記録される（効果なし）' },
            { id: 'curseddoll', name: '呪われた人形',     icon: '🧸', effect: '他プレイヤーのマス効果を代わりに受けることがある（受動）' },
            { id: 'babel',      name: 'バベル',           icon: '🌀', effect: 'ゲーム終了後、選択したプレイヤーと順位を入れ替える' },
            { id: 'snatcher',   name: 'スナッチャー',     icon: '🎣', effect: '他プレイヤーのアイテムを1つ奪う' },
            { id: 'nail',       name: '釘',               icon: '📌', effect: 'マスに設置。他プレイヤーが通過時に強制停止させそのマスの効果を受けさせる' },
            { id: 'hammer',     name: 'トンカチ',         icon: '🔨', effect: '同じマスにいる他プレイヤー1人を1回休みにする' },
            { id: 'katashiro',  name: '形代',             icon: '🪆', effect: '他プレイヤーから自分への攻撃アイテム効果を選択したプレイヤーに押し付ける。使用後1〜3マス戻る' },
            { id: 'gekokujo',   name: '下剋上',           icon: '⚔️', effect: 'アイテムを全て失う代わりにトップのプレイヤーと場所を交換する' },
            { id: 'kagemaiha',  name: '影舞葉',           icon: '🍃', effect: '1つ上の順位のプレイヤーのマスに移動。サイコロは振れず、そのマスの効果を受ける' }
        ];
        
        // アイテム表示ラベル（アイコン + 名前）
        function itemLabel(itemId) {
            const displayId = itemId === 'babel' ? 'star' : itemId;
            const item = ITEMS.find(i => i.id === displayId);
            if (!item) return itemId;
            return `${item.icon} ${item.name}`;
        }

        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        const EVENTS = [
            { id: 'merchant', title: '怪しい商人', text: '怪しい商人に出会った。', effect: 'merchant' },
            { id: 'wind', title: '突風', text: '突風が吹いた！2マス戻される...', effect: -2 },
            { id: 'goddess', title: '幸運の女神', text: '幸運の女神が微笑んだ！もう一度サイコロを振れる！', effect: 'extraTurn' },
            { id: 'pit', title: '落とし穴', text: '落とし穴に落ちた！1回休み...', effect: 'skip' },
            { id: 'tailwind', title: '追い風', text: '追い風に乗った！3マス前進する', effect: 3 },
            { id: 'storm', title: '嵐', text: '嵐が来た！自分以外の全プレイヤーが1マス後退する', effect: 'storm' },
            { id: 'blackhole', title: 'ブラックホール', text: 'ブラックホールだ！気をつけろ！', effect: 'blackhole' },
            { id: 'whitehole', title: 'ホワイトホール', text: 'ホワイトホールから吐き出された！', effect: 'whitehole' },
            { id: 'mask', title: '覆面', text: '覆面に包まれた！別の覆面マスへワープ！', effect: 'mask' },
            { id: 'average', title: '平均', text: '平均の力が働いた！', effect: 'average' },
            { id: 'forceend', title: 'ゲームをやめろ！', text: 'ゲームを強制終了！！', effect: 'forceend' },
            { id: 'nameback', title: '自分の名前の数だけ戻る', text: '名前の文字数分だけ戻ってしまった！', effect: 'nameback' },
            { id: 'ganbare', title: 'がんばれ！', text: 'がんばれ！', effect: 'ganbare' },
            { id: 'resetall', title: '仕切り直し', text: '仕切り直し！全員スタートに戻る！', effect: 'resetall' },
            { id: 'newstart', title: 'ここをスタートとする！', text: 'ここからが本当のスタートだ！', effect: 'newstart' },
            { id: 'angry', title: '怒らせたら10進む', text: 'ランダムなプレイヤーを怒らせることができるか？', effect: 'angry' },
            { id: 'self_appeal', title: '自分をアピールして！', text: '30秒で自己アピールして他プレイヤーの採用を勝ち取れ！', effect: 'self_appeal' },
            { id: 'freemove', title: '好きなだけ進んでいいよ', text: '好きなだけ進んでいいよ！何マス進む？', effect: 'freemove' },
            { id: 'luckynumber', title: '今日のラッキーナンバーは？', text: 'ラッキーナンバーを入力してください！', effect: 'luckynumber' }
        ];
        
        // ========== ゲーム状態 ==========
        let gameState = {
            mode: 'editor',
            gridSize: { rows: 5, cols: 5 },
            board: [],
            selectedTileType: TILE_TYPES.NORMAL,
            enabledItems: {},
            selectedEventForTile: null,
            editingTileIndex: null,
            
            // プレイ関連
            playMode: null, // 'single', 'local', 'online'
            players: [],
            currentPlayerIndex: 0,
            diceValue: 1,
            isRolling: false,
            
            // Firebase関連
            firebaseConfig: null,
            firebaseInitialized: false,
            roomId: null,
            playerId: null,
            isHost: false,
            firebaseRefs: {},

            // アイテム効果フラグ
            bootsActive: false,
            binocularsActive: false,
            koshindoActive: false,
            sakasamaActive: false,
            winShown: false,
            nailTraps: {}     // { [tileIndex]: placingPlayerIndex }
        };
        
        // ========== 初期化 ==========
        function init() {
            loadFirebaseConfig();
            setFirebaseConfigCollapsed(!!gameState.firebaseConfig);
            loadEnabledItems();
            initializeBoard();
            renderPalette();
            renderItemList();
            renderEventList();
            renderBoard();
            updatePlayerInputs();
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && document.getElementById('modal').classList.contains('show')) {
                    handleModalOk();
                }
            });
        }
        
        // ========== Firebase設定 ==========
        function setFirebaseConfigCollapsed(isCollapsed) {
            const body = document.querySelector('.firebase-config-body');
            const icon = document.getElementById('firebaseToggleIcon');
            if (!body) return;
            body.classList.toggle('hidden', isCollapsed);
            if (icon) icon.textContent = isCollapsed ? '▼' : '▲';
        }

        function loadFirebaseConfig() {
            const saved = localStorage.getItem('firebaseConfig');
            if (!saved) return;
            let config;
            try {
                config = JSON.parse(saved);
            } catch (e) {
                localStorage.removeItem('firebaseConfig');
                return;
            }
            // 旧バージョン (projectIdなし) は再設定を促す
            if (!config.projectId) {
                localStorage.removeItem('firebaseConfig');
                return;
            }
            gameState.firebaseConfig = config;
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('projectId').value = config.projectId || '';
            document.getElementById('databaseURL').value = config.databaseURL || '';
            document.getElementById('firebaseConfigForm').classList.add('hidden');
            document.getElementById('firebaseConfigured').classList.remove('hidden');
            document.getElementById('firebaseConfigSection').classList.add('configured');
            setFirebaseConfigCollapsed(true);
            initializeFirebase();
        }

        function saveFirebaseConfig() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const projectId = document.getElementById('projectId').value.trim();
            const databaseURL = document.getElementById('databaseURL').value.trim();

            if (!apiKey || !projectId || !databaseURL) {
                showModal('info', 'API Key・Project ID・Database URLの\n3項目すべてを入力してください');
                return;
            }

            const config = { apiKey, projectId, databaseURL };
            localStorage.setItem('firebaseConfig', JSON.stringify(config));
            gameState.firebaseConfig = config;

            document.getElementById('firebaseConfigForm').classList.add('hidden');
            document.getElementById('firebaseConfigured').classList.remove('hidden');
            document.getElementById('firebaseConfigSection').classList.add('configured');
            setFirebaseConfigCollapsed(true);

            initializeFirebase();
            showModal('info', 'Firebase設定を保存しました！\nオンラインマルチプレイが利用可能です。');
        }

        function clearFirebaseConfig() {
            if (!confirm('Firebase設定をクリアしますか？')) return;

            localStorage.removeItem('firebaseConfig');
            gameState.firebaseConfig = null;
            gameState.firebaseInitialized = false;

            document.getElementById('apiKey').value = '';
            document.getElementById('projectId').value = '';
            document.getElementById('databaseURL').value = '';
            document.getElementById('firebaseConfigForm').classList.remove('hidden');
            document.getElementById('firebaseConfigured').classList.add('hidden');
            document.getElementById('firebaseConfigSection').classList.remove('configured');
            setFirebaseConfigCollapsed(false);

            showModal('info', 'Firebase設定をクリアしました');
        }
        
        function initializeFirebase() {
            if (!gameState.firebaseConfig || gameState.firebaseInitialized) return;
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp({
                        apiKey: gameState.firebaseConfig.apiKey,
                        authDomain: gameState.firebaseConfig.projectId + '.firebaseapp.com',
                        databaseURL: gameState.firebaseConfig.databaseURL,
                        projectId: gameState.firebaseConfig.projectId
                    });
                }
                gameState.firebaseInitialized = true;
                console.log('Firebase初期化完了');
            } catch (e) {
                console.error('Firebase初期化エラー:', e);
                showModal('info', 'Firebase初期化に失敗しました。\n設定値を確認してください。\nエラー: ' + e.message);
            }
        }

        // Anonymous Auth でサインインし、auth.uid を playerId として取得する
        function ensureFirebaseAuth() {
            return new Promise((resolve, reject) => {
                if (!gameState.firebaseConfig) {
                    reject(new Error('Firebase設定が必要です。\n画面上部の設定セクションから設定してください。'));
                    return;
                }
                if (!gameState.firebaseInitialized) {
                    initializeFirebase();
                    if (!gameState.firebaseInitialized) {
                        reject(new Error('Firebase初期化に失敗しました。設定を確認してください。'));
                        return;
                    }
                }
                const currentUser = firebase.auth().currentUser;
                if (currentUser) {
                    gameState.playerId = currentUser.uid;
                    resolve(currentUser);
                    return;
                }
                firebase.auth().signInAnonymously()
                    .then(cred => {
                        gameState.playerId = cred.user.uid;
                        resolve(cred.user);
                    })
                    .catch(e => {
                        if (e.code === 'auth/operation-not-allowed') {
                            reject(new Error('Anonymous認証が無効です。\nFirebase Console → Authentication → ログイン方法 → 匿名\nを有効にしてください。'));
                        } else {
                            reject(e);
                        }
                    });
            });
        }
        
        // ========== ボード管理 ==========
        function initializeBoard() {
            const totalTiles = gameState.gridSize.rows * gameState.gridSize.cols;
            gameState.board = Array(totalTiles).fill(null).map((_, index) => {
                if (index === 0) return { ...TILE_TYPES.START };
                if (index === totalTiles - 1) return { ...TILE_TYPES.GOAL };
                return { ...TILE_TYPES.NORMAL };
            });
        }
        
        function updateGridSize() {
            gameState.gridSize.rows = parseInt(document.getElementById('rowsInput').value) || 3;
            gameState.gridSize.cols = parseInt(document.getElementById('colsInput').value) || 3;
            initializeBoard();
            renderBoard();
        }
        
        function resetBoard() {
            if (!confirm('ボードをリセットしますか？')) return;
            initializeBoard();
            renderBoard();
        }
        
        function generateRandomStage() {
            if (!confirm('ランダムなステージを生成しますか？\n現在のステージは失われます。')) return;
            
            const totalTiles = gameState.gridSize.rows * gameState.gridSize.cols;
            const editableTiles = totalTiles - 2; // スタートとゴールを除く
            
            // 初期化
            initializeBoard();
            
            // 各マスタイプの出現確率を設定
            const tileDistribution = [
                { type: TILE_TYPES.NORMAL, weight: 30 },      // 30%
                { type: TILE_TYPES.ITEM, weight: 30 },        // 30%
                { type: TILE_TYPES.EVENT, weight: 40 }        // 40%
            ];

            // 重み付きランダム選択のための累積配列を作成
            const cumulativeWeights = [];
            let sum = 0;
            tileDistribution.forEach(item => {
                sum += item.weight;
                cumulativeWeights.push({ type: item.type, cumulative: sum });
            });

            // スタートとゴールを除く各マスをランダムに設定
            for (let i = 1; i < totalTiles - 1; i++) {
                const random = Math.random() * sum;
                const selected = cumulativeWeights.find(item => random < item.cumulative);
                const tileType = selected.type;

                if (tileType.id === 'event') {
                    // イベントマス: ランダムにイベントを割り当て
                    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
                    gameState.board[i] = {
                        ...tileType,
                        effect: {
                            type: 'event',
                            eventId: randomEvent.id,
                            eventTitle: randomEvent.title,
                            eventText: randomEvent.text,
                            eventEffect: randomEvent.effect
                        }
                    };
                } else {
                    // その他のマス: そのまま配置
                    gameState.board[i] = { ...tileType };
                }
            }

            renderBoard();
            showModal('info', `ランダムステージを生成しました！\n\nマス構成:\n- 通常: 約30%\n- アイテム: 約30%\n- イベント: 約40%`);
        }
        
        function renderBoard() {
            const board = document.getElementById('board');
            board.style.gridTemplateColumns = `repeat(${gameState.gridSize.cols}, 1fr)`;
            board.innerHTML = '';
            
            gameState.board.forEach((tile, index) => {
                const div = document.createElement('div');
                div.className = `tile ${tile.color}`;
                
                let label = tile.name;
                if (tile.id === 'normal') {
                    label = '';
                } else if (tile.effect?.type === 'move' && tile.effect.value) {
                    label = tile.effect.value > 0 ? `+${tile.effect.value}` : `${tile.effect.value}`;
                } else if (tile.effect?.type === 'rest' && tile.effect.value) {
                    label = `休み×${tile.effect.value}`;
                } else if (tile.effect?.type === 'item') {
                    label = '<i class="fa-solid fa-gift tile-icon"></i>';
                } else if (tile.effect?.eventId === 'blackhole') {
                    div.classList.add('tile-blackhole');
                    label = '<i class="fa-solid fa-circle-notch fa-spin tile-icon tile-icon-blackhole"></i>';
                } else if (tile.effect?.eventId === 'whitehole') {
                    div.classList.add('tile-whitehole');
                    label = '<i class="fa-solid fa-sun fa-spin tile-icon tile-icon-whitehole"></i>';
                } else if (tile.effect?.eventId === 'mask') {
                    div.classList.add('tile-mask');
                    label = '<i class="fa-solid fa-masks-theater tile-icon tile-icon-mask"></i>';
                } else if (tile.effect?.eventId === 'average') {
                    div.classList.add('tile-average');
                    label = '<i class="fa-solid fa-scale-balanced tile-icon tile-icon-average"></i>';
                } else if (tile.effect?.eventTitle) {
                    label = tile.effect.eventTitle;
                }
                
                div.innerHTML = `
                    <div class="tile-number">${index + 1}</div>
                    <div class="tile-label">${label}</div>
                `;
                
                // プレイヤーマーカー表示
                if (gameState.mode === 'play') {
                    gameState.players.forEach((player, pIndex) => {
                        if (player.position === index) {
                            const marker = document.createElement('div');
                            marker.className = `player-marker p${pIndex + 1}`;
                            div.appendChild(marker);
                        }
                    });
                }
                
                // 釘トラップ表示
                if (gameState.nailTraps && gameState.nailTraps[index] !== undefined) {
                    const nailIcon = document.createElement('span');
                    nailIcon.style.cssText = 'position:absolute;top:2px;left:2px;font-size:10px;line-height:1;';
                    nailIcon.textContent = '📌';
                    div.appendChild(nailIcon);
                }

                if (gameState.mode === 'editor') {
                    div.onclick = () => handleTileClick(index);
                }

                board.appendChild(div);
            });
        }
        
        function handleTileClick(index) {
            if (index === 0 || index === gameState.board.length - 1) return;
            
            const selectedType = gameState.selectedTileType;
            
            if (selectedType.id === 'forward' || selectedType.id === 'backward') {
                showMoveValueDialog(index, selectedType);
            } else if (selectedType.id === 'rest') {
                showRestValueDialog(index);
            } else if (selectedType.id === 'event') {
                gameState.editingTileIndex = index;
                switchMode('events');
            } else {
                gameState.board[index] = { ...selectedType };
                renderBoard();
            }
        }
        
        function showMoveValueDialog(index, tileType) {
            const value = prompt(`移動量を入力してください (1-10マス):`, '3');
            if (value === null) return;
            
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 10) {
                alert('1から10の数値を入力してください');
                return;
            }
            
            gameState.board[index] = {
                ...tileType,
                effect: {
                    type: 'move',
                    value: tileType.id === 'forward' ? num : -num
                }
            };
            renderBoard();
        }

        function showRestValueDialog(index) {
            const value = prompt('休む回数を入力してください (1-5):', '1');
            if (value === null) return;
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 5) {
                alert('1から5の数値を入力してください');
                return;
            }
            gameState.board[index] = {
                ...TILE_TYPES.REST,
                name: `休み×${num}`,
                effect: { type: 'rest', value: num }
            };
            renderBoard();
        }

        // ========== パレット ==========
        function renderPalette() {
            const palette = document.getElementById('palette');
            palette.innerHTML = '';
            
            Object.values(TILE_TYPES).filter(t => t.id !== 'start' && t.id !== 'goal').forEach(tileType => {
                const div = document.createElement('div');
                div.className = `palette-tile ${tileType.color} ${tileType.id === gameState.selectedTileType.id ? 'selected' : ''}`;
                div.textContent = tileType.name;
                div.onclick = () => {
                    gameState.selectedTileType = tileType;
                    renderPalette();
                };
                palette.appendChild(div);
            });
        }
        
        // ========== アイテム管理 ==========
        function loadEnabledItems() {
            const saved = localStorage.getItem('enabledItems');
            if (saved) {
                let parsed;
                try {
                    parsed = JSON.parse(saved);
                } catch (e) {
                    localStorage.removeItem('enabledItems');
                    parsed = null;
                }
                if (parsed && typeof parsed === 'object') {
                    gameState.enabledItems = parsed;
                    ITEMS.forEach(item => {
                        if (gameState.enabledItems[item.id] === undefined) {
                            gameState.enabledItems[item.id] = true;
                        }
                    });
                } else {
                    ITEMS.forEach(item => {
                        gameState.enabledItems[item.id] = true;
                    });
                }
            } else {
                ITEMS.forEach(item => {
                    gameState.enabledItems[item.id] = true;
                });
            }
        }

        function findTopOpponentIndex(playerIndex) {
            const current = gameState.players[playerIndex];
            if (!current) return -1;
            let topIndex = -1;
            gameState.players.forEach((p, i) => {
                if (i === playerIndex) return;
                if (p.position <= current.position) return;
                if (topIndex === -1 || p.position > gameState.players[topIndex].position) {
                    topIndex = i;
                }
            });
            return topIndex;
        }
        
        function saveEnabledItems() {
            localStorage.setItem('enabledItems', JSON.stringify(gameState.enabledItems));
        }
        
        function renderItemList() {
            const list = document.getElementById('itemList');
            list.innerHTML = '';
            
            ITEMS.forEach(item => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <input type="checkbox" id="item-${item.id}" ${gameState.enabledItems[item.id] ? 'checked' : ''} onchange="toggleItem('${item.id}')">
                    <div class="list-item-content">
                        <div class="list-item-title">${item.icon} ${item.name}</div>
                        <div class="list-item-desc">${item.effect}</div>
                    </div>
                `;
                list.appendChild(div);
            });
        }
        
        function toggleItem(itemId) {
            gameState.enabledItems[itemId] = document.getElementById(`item-${itemId}`).checked;
            saveEnabledItems();
        }
        
        // ========== イベント管理 ==========
        function renderEventList() {
            const list = document.getElementById('eventList');
            list.innerHTML = '';
            
            EVENTS.forEach(event => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.innerHTML = `
                    <input type="radio" name="eventSelect" id="event-${event.id}" value="${event.id}">
                    <div class="list-item-content">
                        <div class="list-item-title">${event.title}</div>
                        <div class="list-item-desc">${event.text}</div>
                    </div>
                `;
                list.appendChild(div);
            });
        }
        
        function confirmEventSelection() {
            const selected = document.querySelector('input[name="eventSelect"]:checked');
            if (!selected) {
                alert('イベントを選択してください');
                return;
            }
            
            const event = EVENTS.find(e => e.id === selected.value);
            const index = gameState.editingTileIndex;
            
            gameState.board[index] = {
                ...TILE_TYPES.EVENT,
                effect: {
                    type: 'event',
                    eventId: event.id,
                    eventTitle: event.title,
                    eventText: event.text,
                    eventEffect: event.effect
                }
            };
            
            gameState.editingTileIndex = null;
            switchMode('editor');
            renderBoard();
        }
        
        function cancelEventSelection() {
            gameState.editingTileIndex = null;
            switchMode('editor');
        }
        
        // ========== ステージ保存/読み込み ==========
        function saveStage() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const slotBtns = [1, 2, 3].map(slot => {
                const saved = localStorage.getItem(`stageData_${slot}`);
                let info = '（空）';
                if (saved) {
                    try {
                        const d = JSON.parse(saved);
                        info = `${d.gridSize.rows}×${d.gridSize.cols}`;
                    } catch(e) {}
                }
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="saveStageToSlot" data-slot="${slot}">スロット ${slot}：${info}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">ステージを保存</div>
                <div class="modal-text">保存先を選んでください：</div>
                ${slotBtns}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModal">キャンセル</button>
            `;
            modal.classList.add('show');
        }

        function saveStageToSlot(slot) {
            const stageData = {
                gridSize: gameState.gridSize,
                board: gameState.board
            };
            localStorage.setItem(`stageData_${slot}`, JSON.stringify(stageData));
            closeModal();
            showModal('info', `スロット ${slot} に保存しました！`);
        }

        function loadStage() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            let hasAny = false;
            const slotBtns = [1, 2, 3].map(slot => {
                const saved = localStorage.getItem(`stageData_${slot}`);
                if (!saved) {
                    return `<button class="btn btn-secondary" style="margin:4px;width:100%;" disabled>スロット ${slot}：（空）</button>`;
                }
                hasAny = true;
                let info = '';
                try {
                    const d = JSON.parse(saved);
                    info = `${d.gridSize.rows}×${d.gridSize.cols}`;
                } catch(e) {}
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="loadStageFromSlot" data-slot="${slot}">スロット ${slot}：${info}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">ステージを読み込み</div>
                <div class="modal-text">${hasAny ? '読み込むスロットを選んでください：' : '保存されたステージがありません'}</div>
                ${slotBtns}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModal">キャンセル</button>
            `;
            modal.classList.add('show');
        }

        function loadStageFromSlot(slot) {
            const saved = localStorage.getItem(`stageData_${slot}`);
            if (!saved) {
                closeModal();
                showModal('info', `スロット ${slot} にデータがありません`);
                return;
            }
            let stageData;
            try {
                stageData = JSON.parse(saved);
            } catch (e) {
                localStorage.removeItem(`stageData_${slot}`);
                closeModal();
                showModal('info', `スロット ${slot} のデータが破損していたため削除しました。`);
                return;
            }
            if (!stageData || !stageData.gridSize || !stageData.board) {
                localStorage.removeItem(`stageData_${slot}`);
                closeModal();
                showModal('info', `スロット ${slot} のデータが破損していたため削除しました。`);
                return;
            }
            gameState.gridSize = stageData.gridSize;
            gameState.board = stageData.board;
            document.getElementById('rowsInput').value = gameState.gridSize.rows;
            document.getElementById('colsInput').value = gameState.gridSize.cols;
            renderBoard();
            closeModal();
            showModal('info', `スロット ${slot} を読み込みました！`);
        }
        
        // ========== モード切り替え ==========
        const ALL_MODES = [
            'editorMode', 'itemsMode', 'eventsMode',
            'playModeSelect', 'localMultiSetup', 'onlineMultiSelect',
            'roomWaiting', 'joinRoom', 'playScreen'
        ];

        function switchMode(mode) {
            // ルーム参加中の制限
            if (gameState.roomId) {
                if (mode === 'editor' || mode === 'items' || mode === 'events') {
                    if (!gameState.isHost) {
                        showModal('info', 'エディターの操作はホストのみ可能です。');
                        return;
                    }
                }
                if (mode === 'playMode') {
                    // ルームを退出するまではルーム待機画面に戻る
                    mode = 'roomWaiting';
                }
            }

            gameState.mode = mode;

            // プレイ中はモードボタンを非表示
            const modeSelector = document.querySelector('.mode-selector');
            modeSelector.classList.toggle('hidden', mode === 'play');

            // モードボタンの状態更新
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));

            // 全セクションを非表示
            ALL_MODES.forEach(id => document.getElementById(id)?.classList.add('hidden'));
            
            // 選択されたモードを表示
            if (mode === 'editor') {
                document.getElementById('editorBtn').classList.add('active');
                document.getElementById('editorMode').classList.remove('hidden');
            } else if (mode === 'items') {
                document.getElementById('itemsBtn').classList.add('active');
                document.getElementById('itemsMode').classList.remove('hidden');
            } else if (mode === 'events') {
                document.getElementById('eventsBtn').classList.add('active');
                document.getElementById('eventsMode').classList.remove('hidden');
            } else if (mode === 'playMode') {
                document.getElementById('playBtn').classList.add('active');
                document.getElementById('playModeSelect').classList.remove('hidden');
            } else if (mode === 'localMultiSetup') {
                document.getElementById('localMultiSetup').classList.remove('hidden');
            } else if (mode === 'onlineMultiSelect') {
                document.getElementById('onlineMultiSelect').classList.remove('hidden');
            } else if (mode === 'roomWaiting') {
                document.getElementById('roomWaiting').classList.remove('hidden');
            } else if (mode === 'joinRoom') {
                document.getElementById('joinRoom').classList.remove('hidden');
            } else if (mode === 'play') {
                document.getElementById('playScreen').classList.remove('hidden');
            }

            // Firebase設定はエディターモードのみ表示
            const firebaseSection = document.getElementById('firebaseConfigSection');
            if (firebaseSection) firebaseSection.classList.toggle('hidden', mode !== 'editor');

            // ゲームを終了ボタンはプレイ中のみ表示
            document.getElementById('exitGameBtn').classList.toggle('hidden', mode !== 'play');

            // プレイ以外のモードではプレイ用UI要素を非表示（バナー残留バグ修正）
            if (mode !== 'play') {
                const banner = document.getElementById('currentPlayerBanner');
                if (banner) banner.classList.add('hidden');
                document.getElementById('playScreen').classList.remove('with-banner');
                const panel = document.getElementById('playerListPanel');
                if (panel) {
                    panel.classList.add('hidden');
                    panel.classList.remove('open');
                }
                const overlay = document.getElementById('playerListOverlay');
                if (overlay) overlay.classList.add('hidden');
                const toggle = document.getElementById('playerListToggle');
                if (toggle) toggle.classList.add('hidden');
            } else {
                const panel = document.getElementById('playerListPanel');
                const toggle = document.getElementById('playerListToggle');
                if (gameState.playMode !== 'single') {
                    if (panel) panel.classList.remove('hidden');
                    if (toggle) toggle.classList.remove('hidden');
                } else {
                    if (panel) {
                        panel.classList.add('hidden');
                        panel.classList.remove('open');
                    }
                    if (toggle) toggle.classList.add('hidden');
                    const overlay = document.getElementById('playerListOverlay');
                    if (overlay) overlay.classList.add('hidden');
                }
            }

            renderBoard();
        }
        
        // ========== プレイヤー設定 ==========
        function updatePlayerInputs() {
            const count = parseInt(document.getElementById('playerCount').value);
            const container = document.getElementById('playerInputs');
            container.innerHTML = '';
            
            for (let i = 0; i < count; i++) {
                const div = document.createElement('div');
                div.className = 'player-input';
                div.innerHTML = `
                    <label>プレイヤー${i + 1}の名前</label>
                    <input type="text" id="playerName${i}" placeholder="プレイヤー${i + 1}" value="プレイヤー${i + 1}">
                `;
                container.appendChild(div);
            }
        }
        
        // ========== ゲーム開始 ==========
        function startSinglePlay() {
            gameState.playMode = 'single';
            gameState.winShown = false;
            gameState.nailTraps = {};
            gameState.players = [{
                name: 'プレイヤー',
                position: 0,
                items: [],
                skipTurns: 0,
                babelTarget: null,
                immuneTurns: 0
            }];
            gameState.currentPlayerIndex = 0;
            switchMode('play');
            document.getElementById('playerListToggle').classList.add('hidden');
            document.getElementById('playerListOverlay').classList.add('hidden');
            document.getElementById('playerListPanel').classList.remove('open');
            updateStatus();
        }
        
        function startLocalMulti() {
            const count = parseInt(document.getElementById('playerCount').value);
            gameState.playMode = 'local';
            gameState.winShown = false;
            gameState.nailTraps = {};
            gameState.players = [];

            for (let i = 0; i < count; i++) {
                const name = document.getElementById(`playerName${i}`).value || `プレイヤー${i + 1}`;
                gameState.players.push({
                    name,
                    position: 0,
                    items: [],
                    skipTurns: 0,
                    babelTarget: null,
                    immuneTurns: 0
                });
            }

            // プレイヤー順をランダム化
            for (let i = gameState.players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gameState.players[i], gameState.players[j]] = [gameState.players[j], gameState.players[i]];
            }

            gameState.currentPlayerIndex = 0;
            switchMode('play');
            document.getElementById('playerListToggle').classList.remove('hidden');
            document.getElementById('playerListPanel').classList.remove('open');
            document.getElementById('playerListOverlay').classList.add('hidden');
            updateStatus();
        }
        
        // ========== オンラインマルチ (Firebase実装) ==========
        async function createOnlineRoom() {
            const hostName = document.getElementById('hostPlayerName').value.trim() || 'ホスト';
            try {
                await ensureFirebaseAuth();
            } catch (e) {
                showModal('info', e.message);
                return;
            }

            gameState.isHost = true;
            gameState.roomId = generateRoomId();
            // gameState.playerId は ensureFirebaseAuth() が auth.uid をセット済み

            const db = firebase.database();
            const roomRef = db.ref('rooms/' + gameState.roomId);
            gameState.firebaseRefs.roomRef = roomRef;

            try {
                await roomRef.set({
                    hostId: gameState.playerId,
                    status: 'waiting',
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });

                const myPlayerRef = roomRef.child('players/' + gameState.playerId);
                await myPlayerRef.set({ name: hostName, connected: true });
                // 切断時: 自分のプレイヤーエントリを削除、ルームを abandoned に
                myPlayerRef.onDisconnect().remove();
                roomRef.onDisconnect().update({ status: 'abandoned' });
                gameState.firebaseRefs.playerRef = myPlayerRef;
            } catch (e) {
                showModal('info', 'ルーム作成エラー: ' + e.message + '\n\n「📋 セットアップ手順を確認」ボタンで\nDatabase RulesとAnonymous認証の設定を確認してください。');
                return;
            }

            roomRef.child('players').on('value', snap => {
                const data = snap.val() || {};
                const list = Object.entries(data).map(([id, p]) => ({ id, name: p.name, connected: p.connected }));
                updateWaitingPlayers(list);
            });

            roomRef.child('status').on('value', snap => {
                const status = snap.val();
                if (status === 'started' && gameState.mode === 'roomWaiting') {
                    loadOnlineGameState();
                }
            });

            document.getElementById('displayRoomId').textContent = gameState.roomId;
            switchMode('roomWaiting');
            showModal('info', 'ルームを作成しました！\nルームID: ' + gameState.roomId + '\n\n他のプレイヤーにルームIDを共有してください。');
        }

        async function joinOnlineRoom() {
            const roomId = document.getElementById('joinRoomId').value.trim();
            const playerName = document.getElementById('joinPlayerName').value.trim();

            if (!roomId || !playerName) {
                alert('ルームIDとプレイヤー名を入力してください');
                return;
            }

            try {
                await ensureFirebaseAuth();
            } catch (e) {
                showModal('info', e.message);
                return;
            }

            const db = firebase.database();
            const roomRef = db.ref('rooms/' + roomId);

            let snap;
            try {
                snap = await roomRef.once('value');
            } catch (e) {
                showModal('info', 'Firebase読み込みエラー: ' + e.message);
                return;
            }

            if (!snap.exists()) {
                showModal('info', 'ルームが見つかりません。\nルームIDを確認してください。');
                return;
            }
            const roomData = snap.val();
            if (roomData.status === 'started') {
                showModal('info', 'このルームはすでにゲームが開始されています。');
                return;
            }
            if (roomData.status === 'abandoned') {
                showModal('info', 'このルームは無効です（ホストが切断済み）。');
                return;
            }

            gameState.roomId = roomId;
            gameState.isHost = false;
            gameState.firebaseRefs.roomRef = roomRef;

            const myPlayerRef = roomRef.child('players/' + gameState.playerId);
            try {
                await myPlayerRef.set({ name: playerName, connected: true });
            } catch (e) {
                showModal('info', '参加エラー: ' + e.message + '\n\nDatabase Rulesを確認してください。');
                return;
            }
            myPlayerRef.onDisconnect().remove();
            gameState.firebaseRefs.playerRef = myPlayerRef;

            roomRef.child('players').on('value', s => {
                const data = s.val() || {};
                const list = Object.entries(data).map(([id, p]) => ({ id, name: p.name, connected: p.connected }));
                updateWaitingPlayers(list);
            });

            roomRef.child('status').on('value', s => {
                const status = s.val();
                if (status === 'started' && gameState.mode === 'roomWaiting') {
                    loadOnlineGameState();
                } else if (status === 'abandoned' && gameState.mode === 'roomWaiting') {
                    showModal('info', 'ホストが切断しました。\nルームを退出します。');
                    setTimeout(() => { if (gameState.mode === 'roomWaiting') leaveRoom(true); }, 2000);
                }
            });

            document.getElementById('displayRoomId').textContent = roomId;
            switchMode('roomWaiting');
        }

        function updateWaitingPlayers(players) {
            const list = document.getElementById('waitingPlayersList');
            list.innerHTML = '';

            players.forEach(player => {
                const div = document.createElement('div');
                div.className = 'waiting-player';
                div.innerHTML = `
                    ${escapeHtml(player.name)}
                    <span class="connection-status ${player.connected ? 'connected' : 'disconnected'}">
                        ${player.connected ? '接続中' : '切断'}
                    </span>
                `;
                list.appendChild(div);
            });

            const startBtn = document.getElementById('startOnlineGameBtn');
            if (gameState.isHost) {
                startBtn.classList.remove('hidden');
                startBtn.disabled = players.length < 2;
            } else {
                startBtn.classList.add('hidden');
            }
        }

        function startOnlineGame() {
            if (!gameState.isHost) return;
            const roomRef = gameState.firebaseRefs.roomRef;
            if (!roomRef) return;

            roomRef.child('players').once('value').then(snap => {
                const data = snap.val() || {};
                const playersForGame = Object.entries(data).map(([id, p]) => ({
                    id, name: p.name, position: 0, items: [], skipTurns: 0, babelTarget: null, immuneTurns: 0
                }));
                gameState.nailTraps = {};

                if (playersForGame.length < 2) {
                    showModal('info', '2人以上のプレイヤーが必要です。');
                    return;
                }

                const initialSnap = { players: playersForGame, currentPlayerIndex: 0 };
                roomRef.update({
                    status: 'started',
                    boardData: JSON.stringify(gameState.board),
                    gridSize: JSON.stringify(gameState.gridSize),
                    gameSnapshot: JSON.stringify(initialSnap)
                });
            });
        }

        function leaveRoom(silent = false) {
            if (!silent && !confirm('ルームを退出しますか？')) return;
            const roomRef = gameState.firebaseRefs.roomRef;
            if (roomRef) {
                roomRef.child('players').off();
                roomRef.child('status').off();
                roomRef.child('gameSnapshot').off();
                if (gameState.firebaseRefs.playerRef) gameState.firebaseRefs.playerRef.remove();
            }
            gameState.roomId = null;
            gameState.isHost = false;
            gameState.firebaseRefs = {};
            switchMode('onlineMultiSelect');
        }
        
        function showSecurityRules() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const rules = `{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('hostId').val() === auth.uid || data.child('players').child(auth.uid).exists())",
        "status":       { ".write": "auth != null && (data.parent().child('hostId').val() === auth.uid || !data.parent().exists())" },
        "winner":       { ".write": "auth != null && data.parent().child('hostId').val() === auth.uid" },
        "gameSnapshot": { ".write": "auth != null && data.parent().child('hostId').val() === auth.uid" },
        "boardData":    { ".write": "auth != null && data.parent().child('hostId').val() === auth.uid" },
        "gridSize":     { ".write": "auth != null && data.parent().child('hostId').val() === auth.uid" },
        "players": {
          "$playerId": {
            ".write": "auth != null && $playerId === auth.uid"
          }
        }
      }
    }
  }
}`;
            content.innerHTML = `
                <div class="modal-title">Firebase セットアップ手順</div>
                <div class="modal-text" style="text-align:left; font-size:13px;">
<strong>① Realtime Database を作成</strong>
Firebase Console → Realtime Database → データベースを作成

<strong>② Database Rules を設定</strong>
Firebase Console → Realtime Database → ルール に以下を貼り付け:
<pre style="background:#f3f4f6;padding:10px;border-radius:6px;font-size:11px;overflow-x:auto;white-space:pre;">${rules}</pre>
<strong>③ Anonymous 認証を有効化</strong>
Firebase Console → Authentication → ログイン方法 → 匿名 → 有効

<strong>④ このアプリに設定を入力</strong>
Firebase Console → プロジェクトの設定 から
API Key / Project ID / Database URL を取得して入力
                </div>
                <button class="btn btn-primary" data-action="closeModal">閉じる</button>
            `;
            modal.classList.add('show');
        }

        function generateRoomId() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let id = '';
            for (let i = 0; i < 9; i++) {
                id += chars[Math.floor(Math.random() * chars.length)];
            }
            return id;
        }

        function loadOnlineGameState() {
            const roomRef = gameState.firebaseRefs.roomRef;
            if (!roomRef) return;

            roomRef.once('value').then(snap => {
                const data = snap.val();
                if (!data || data.status !== 'started') return;

                let boardData;
                let gridSize;
                let saved;
                try {
                    boardData = JSON.parse(data.boardData);
                    gridSize = JSON.parse(data.gridSize);
                    saved = JSON.parse(data.gameSnapshot);
                } catch (e) {
                    return;
                }
                if (!saved || !Array.isArray(saved.players)) return;
                gameState.board = boardData;
                gameState.gridSize = gridSize;
                gameState.players = saved.players;
                gameState.currentPlayerIndex = saved.currentPlayerIndex;
                gameState.playMode = 'online';
                gameState.localPlayerIndex = gameState.players.findIndex(p => p.id === gameState.playerId);
                gameState.winShown = false;

                switchMode('play');
                updateStatus();
                updateDiceInteractivity();
                listenForGameStateChanges();
            });
        }

        function listenForGameStateChanges() {
            const roomRef = gameState.firebaseRefs.roomRef;
            if (!roomRef) return;

            roomRef.child('gameSnapshot').on('value', snap => {
                if (!snap.exists() || gameState.mode !== 'play' || gameState.isRolling) return;

                let saved;
                try {
                    saved = JSON.parse(snap.val());
                } catch (e) {
                    return;
                }
                if (!saved || !Array.isArray(saved.players)) return;
                // 常にリモートの状態を適用する（isRollingがロール中の上書きを防ぐ）
                gameState.players = saved.players;
                gameState.currentPlayerIndex = saved.currentPlayerIndex;
                renderBoard();
                updateStatus();
                updateDiceInteractivity();
            });

            // ゲーム終了検知
            roomRef.child('winner').on('value', snap => {
                if (!snap.exists() || gameState.mode !== 'play' || gameState.winShown) return;
                const w = snap.val();
                if (w && w.name) {
                    gameState.winShown = true;
                    showModal('win', buildResultText(w.name));
                }
            });

            // ホストによるゲーム強制終了を検知
            roomRef.child('status').on('value', snap => {
                if (snap.val() === 'abandoned' && gameState.mode === 'play' && !gameState.isHost) {
                    showModal('info', 'ホストがゲームを終了しました。\nルームへの参加画面に戻ります。', () => {
                        gameState.playMode = null;
                        gameState.roomId = null;
                        gameState.isHost = false;
                        gameState.firebaseRefs = {};
                        switchMode('joinRoom');
                    });
                }
            });
        }

        function syncGameStateToFirebase() {
            if (gameState.playMode !== 'online') return;
            const roomRef = gameState.firebaseRefs.roomRef;
            if (!roomRef) return;
            const snap = { players: gameState.players, currentPlayerIndex: gameState.currentPlayerIndex };
            roomRef.child('gameSnapshot').set(JSON.stringify(snap));
        }

        function updateDiceInteractivity() {
            if (gameState.playMode !== 'online') return;
            const dice = document.getElementById('dice');
            const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === gameState.playerId;
            dice.style.opacity = isMyTurn ? '1' : '0.4';
            dice.style.pointerEvents = isMyTurn ? 'auto' : 'none';
            const diceHint = dice.nextElementSibling;
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            if (diceHint) {
                if (!isMyTurn) {
                    diceHint.textContent = '他のプレイヤーのターンです...';
                } else if (currentPlayer && currentPlayer.skipTurns > 0) {
                    diceHint.textContent = 'タップしてターン終了';
                } else {
                    diceHint.textContent = 'タップしてサイコロを振る';
                }
            }
        }
        
        // ========== ゲームプレイ ==========
        function rollDice() {
            if (gameState.isRolling) return;

            // オンラインモード: 自分のターンでなければ無視
            if (gameState.playMode === 'online') {
                const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === gameState.playerId;
                if (!isMyTurn) return;
            }

            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            if (currentPlayer.skipTurns > 0) {
                currentPlayer.skipTurns--;
                const skipMsg = currentPlayer.skipTurns > 0
                    ? `あと${currentPlayer.skipTurns}回休みが残っています`
                    : '休みが終わりました';
                nextTurn();
                showModal('info', skipMsg);
                return;
            }

            // サイコロ前に使えるアイテムがある場合のみ確認を出す
            const PRE_ROLL_ITEMS = ['boots', 'binoculars', 'timestop', 'snatcher', 'babel', 'hammer', 'gekokujo', 'kagemaiha'];
            const hasPreRollItems = currentPlayer.items.some(id => {
                if (!PRE_ROLL_ITEMS.includes(id)) return false;
                if (id === 'hammer') {
                    return gameState.players.some((p, i) => i !== gameState.currentPlayerIndex && p.position === currentPlayer.position);
                }
                if (id === 'snatcher') {
                    return gameState.players.some((p, i) => i !== gameState.currentPlayerIndex && p.items.length > 0);
                }
                if (id === 'gekokujo') {
                    return findTopOpponentIndex(gameState.currentPlayerIndex) !== -1;
                }
                return true;
            });
            if (hasPreRollItems) {
                promptItemUsage();
            } else {
                doRollDice();
            }
        }

        function promptItemUsage() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');

            const PRE_ROLL_ITEMS = ['boots', 'binoculars', 'timestop', 'snatcher', 'babel', 'hammer', 'gekokujo', 'kagemaiha'];
            const usableEntries = player.items
                .map((itemId, index) => ({ itemId, index }))
                .filter(({ itemId }) => {
                    if (!PRE_ROLL_ITEMS.includes(itemId)) return false;
                    if (itemId === 'hammer') {
                        return gameState.players.some((p, i) => i !== gameState.currentPlayerIndex && p.position === player.position);
                    }
                    if (itemId === 'snatcher') {
                        return gameState.players.some((p, i) => i !== gameState.currentPlayerIndex && p.items.length > 0);
                    }
                    if (itemId === 'gekokujo') {
                        return findTopOpponentIndex(gameState.currentPlayerIndex) !== -1;
                    }
                    return true;
                });

            const itemsHtml = usableEntries.map(({ itemId, index }) => {
                const itemData = ITEMS.find(i => i.id === itemId);
                if (!itemData) return '';
                return `
                    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px;margin:6px 0;text-align:left;display:flex;flex-direction:column;">
                        <div style="font-weight:bold;margin-bottom:4px;">${itemData.icon} ${itemData.name}</div>
                        <div style="font-size:12px;color:#666;margin-bottom:8px;">${itemData.effect}</div>
                        <div style="text-align:right;margin-top:8px;">
                            <button class="btn btn-primary" style="font-size:13px;padding:6px 14px;" data-action="useItem" data-idx="${index}">使う</button>
                        </div>
                    </div>
                `;
            }).join('');

            const hasNail = player.items.includes('nail');
            const hasHammer = player.items.includes('hammer');
            const comboHtml = (hasNail && hasHammer) ? `
                <div style="border:2px solid #667eea;border-radius:8px;padding:10px;margin:6px 0;text-align:left;background:#f0f0ff;">
                    <div style="font-weight:bold;margin-bottom:4px;">⚡ 釘＋トンカチ コンボ</div>
                    <div style="font-size:12px;color:#666;margin-bottom:8px;">釘とトンカチを消費して呪われた人形を破壊＆3ターン免疫を得る</div>
                    <button class="btn btn-danger" style="font-size:13px;padding:6px 14px;" data-action="useNailHammerCombo">コンボ発動</button>
                </div>
            ` : '';

            content.innerHTML = `
                <div class="modal-title">アイテムを使いますか？</div>
                ${comboHtml}
                ${itemsHtml}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenRollDice">使わない</button>
            `;

            modal.classList.add('show');
        }

        function useItem(itemIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const itemId = player.items[itemIndex];
            const itemData = ITEMS.find(i => i.id === itemId);
            if (!itemData) { closeModal(); doRollDice(); return; }

            player.items.splice(itemIndex, 1);
            updateStatus();
            closeModal();

            switch (itemId) {
                case 'boots':
                    gameState.bootsActive = true;
                    showModal('info', `${itemLabel('boots')} を使った！\n移動量に+2される！`, () => doRollDice());
                    break;
                case 'binoculars':
                    gameState.binocularsActive = true;
                    showModal('info', `${itemLabel('binoculars')} を使った！\nサイコロを2回振り、好きな目を選べる！`, () => doRollDice());
                    break;
                case 'timestop': {
                    const affected = [];
                    gameState.players.forEach((p, i) => {
                        if (i !== gameState.currentPlayerIndex && p.immuneTurns <= 0) {
                            p.skipTurns = 1;
                            affected.push(p.name);
                        }
                    });
                    const affectedText = affected.length > 0 ? affected.join('、') : '対象なし（全員免疫中）';
                    showModal('info', `${itemLabel('timestop')} を使った！\n${affectedText}が1ターン休みになった！`, () => doRollDice());
                    break;
                }
                case 'snatcher':
                    promptSnatcherTargetPlayer();
                    break;
                case 'babel':
                    promptBabelTarget(() => doRollDice());
                    break;
                case 'hammer': {
                    const samePos = gameState.players.filter((p, i) =>
                        i !== gameState.currentPlayerIndex && p.position === player.position
                    );
                    if (samePos.length === 0) {
                        showModal('info', '同じマスにいるプレイヤーがいません！', () => doRollDice());
                        break;
                    }
                    if (samePos.length === 1) {
                        samePos[0].skipTurns = 1;
                        showModal('info', `${itemLabel('hammer')} を使った！\n${samePos[0].name}が1回休みになった！`, () => doRollDice());
                        break;
                    }
                    promptHammerTarget();
                    break;
                }
                case 'katashiro':
                    // 形代は受動アイテム（アイテム選択画面には表示しない）
                    doRollDice();
                    break;
                case 'gekokujo':
                    useGekokujo();
                    break;
                case 'kagemaiha':
                    useKagemaiha();
                    break;
                default:
                    doRollDice();
            }
        }

        function useKagemaiha() {
            const player = gameState.players[gameState.currentPlayerIndex];
            if (gameState.players.length < 2) {
                showModal('info', '（1人プレイのため影舞葉の効果は発動しません）', () => doRollDice());
                return;
            }
            // 降順ソート: index 0 = 1位（最も進んでいる）
            const ranked = gameState.players
                .map((p, i) => ({ player: p, index: i }))
                .sort((a, b) => b.player.position - a.player.position);
            const myRankIdx = ranked.findIndex(r => r.index === gameState.currentPlayerIndex);
            if (myRankIdx === 0) {
                showModal('info', `${player.name}はすでに1位のため、影舞葉の効果が発動しなかった...`, () => doRollDice());
                return;
            }
            const target = ranked[myRankIdx - 1]; // 1つ上の順位
            const destPos = target.player.position;
            const targetName = target.player.name;
            updateStatus();
            showModal('info', `影舞葉！${targetName}のマス（${destPos + 1}マス目）へ移動！\nサイコロは振れず、そのマスの効果を受ける。`, () => {
                player.position = destPos;
                renderBoard();
                updateStatus();
                promptNailThenEffect(destPos);
            });
        }

        function doRollDice() {
            if (gameState.binocularsActive) {
                gameState.binocularsActive = false;
                gameState.isRolling = true;
                const dice = document.getElementById('dice');
                dice.classList.add('rolling');
                setTimeout(() => {
                    const r1 = Math.floor(Math.random() * 6) + 1;
                    const r2 = Math.floor(Math.random() * 6) + 1;
                    dice.textContent = '?';
                    dice.classList.remove('rolling');
                    gameState.isRolling = false;
                    showBinocularsChoice(r1, r2);
                }, 500);
                return;
            }

            gameState.isRolling = true;
            const dice = document.getElementById('dice');
            dice.classList.add('rolling');

            setTimeout(() => {
                let result = Math.floor(Math.random() * 6) + 1;
                if (gameState.bootsActive) {
                    result += 2;
                    gameState.bootsActive = false;
                }
                gameState.diceValue = result;
                dice.textContent = result;
                dice.classList.remove('rolling');
                gameState.isRolling = false;
                promptSakasamaOrMove(result);
            }, 500);
        }

        function showBinocularsChoice(r1, r2) {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">どちらの目を使いますか？</div>
                <div style="display:flex;gap:16px;justify-content:center;margin:16px 0;">
                    <div style="text-align:center;">
                        <div style="font-size:48px;font-weight:bold;background:#f3f4f6;border-radius:12px;padding:16px 24px;">${r1}</div>
                        <button class="btn btn-primary" style="margin-top:8px;" data-action="closeModalThenChooseDice" data-result="${r1}">${r1}を選ぶ</button>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:48px;font-weight:bold;background:#f3f4f6;border-radius:12px;padding:16px 24px;">${r2}</div>
                        <button class="btn btn-primary" style="margin-top:8px;" data-action="closeModalThenChooseDice" data-result="${r2}">${r2}を選ぶ</button>
                    </div>
                </div>
            `;
            modal.classList.add('show');
        }

        function chooseDiceResult(value) {
            gameState.diceValue = value;
            document.getElementById('dice').textContent = value;
            promptSakasamaOrMove(value);
        }
        
        function movePlayer(steps) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const maxPos = gameState.board.length - 1;
            let stepsLeft = steps;
            let currentPos = player.position;
            let direction = 1; // 1: 前進, -1: 折り返し（後退）

            function animateNextStep() {
                currentPos += direction;
                // ゴールで折り返し
                if (currentPos >= maxPos) {
                    currentPos = maxPos;
                    direction = -1;
                } else if (currentPos < 0) {
                    currentPos = 0;
                }
                stepsLeft--;
                player.position = currentPos;
                renderBoard();
                updateStatus();

                if (stepsLeft > 0) {
                    // 通過マス: 前進中のみ釘のチェック
                    if (direction === 1) {
                        const nailOwner = gameState.nailTraps && gameState.nailTraps[currentPos];
                        if (nailOwner !== undefined && nailOwner !== gameState.currentPlayerIndex) {
                            delete gameState.nailTraps[currentPos];
                            renderBoard();
                            const trapperName = gameState.players[nailOwner]?.name || '誰か';
                            showModal('info', `${trapperName}が設置した釘にひっかかった！\nここで強制停止！`, () => {
                                promptNailThenEffect(currentPos);
                            });
                            return;
                        }
                    }
                    setTimeout(animateNextStep, 250);
                } else {
                    // 最終マスへの着地
                    if (currentPos === maxPos) {
                        // ゴールにぴったり着地
                        setTimeout(() => triggerWin(), 500);
                    } else {
                        // 折り返しまたは通常着地
                        setTimeout(() => {
                            if (!checkBlackholeAdjacency(currentPos) && !checkWhiteholeAdjacency(currentPos)) {
                                promptNailThenEffect(currentPos);
                            }
                        }, 300);
                    }
                }
            }

            animateNextStep();
        }

        function triggerWin() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const winnerIdx = gameState.currentPlayerIndex;
            let announced = player;
            let babelNote = '';
            if (player.babelTarget !== null && gameState.players[player.babelTarget]) {
                const target = gameState.players[player.babelTarget];
                babelNote = `\n\n🌀 バベルの効果！\n${player.name}と${target.name}の順位が入れ替わった！`;
                announced = target;
            }
            gameState.players.forEach((p, i) => {
                if (i !== winnerIdx && p.babelTarget === winnerIdx) {
                    babelNote = `\n\n🌀 バベルの効果！\n${p.name}が${player.name}と順位を入れ替えた！`;
                    announced = p;
                }
            });
            if (gameState.playMode === 'online' && gameState.firebaseRefs.roomRef) {
                syncGameStateToFirebase();
                gameState.firebaseRefs.roomRef.child('winner').set({ name: announced.name });
                gameState.firebaseRefs.roomRef.child('status').set('finished');
            }
            if (!gameState.winShown) {
                gameState.winShown = true;
                showModal('win', buildResultText(announced.name), babelNote);
            }
        }

        function checkBlackholeAdjacency(position) {
            // 現在のマス自体がブラックホールなら隣接チェックはしない
            const currentTile = gameState.board[position];
            if (currentTile.effect && currentTile.effect.eventId === 'blackhole') return false;

            // ブラックホールマスのインデックスを収集
            const blackholeIndices = [];
            gameState.board.forEach((tile, idx) => {
                if (tile.effect && tile.effect.type === 'event' && tile.effect.eventId === 'blackhole') {
                    blackholeIndices.push(idx);
                }
            });

            // 隣接するブラックホールを探す
            const adjacentBHIndex = blackholeIndices.find(idx => Math.abs(idx - position) === 1);
            if (adjacentBHIndex === undefined) return false;

            // 50%の確率で吸い込まれる
            if (Math.random() < 0.5) {
                const player = gameState.players[gameState.currentPlayerIndex];
                showModal('info', `隣のブラックホールに吸い込まれた！`, () => {
                    player.position = adjacentBHIndex;
                    renderBoard();
                    updateStatus();
                    setTimeout(() => {
                        showModal('info', 'ブラックホールだ！気をつけろ！', () => {
                            triggerBlackholeEffect();
                        });
                    }, 300);
                });
                return true;
            }

            return false;
        }

        function checkWhiteholeAdjacency(position) {
            // 現在のマス自体がホワイトホールなら判定しない
            const currentTile = gameState.board[position];
            if (currentTile.effect && currentTile.effect.eventId === 'whitehole') return false;

            // ホワイトホールマスのインデックスを収集
            const whiteholeIndices = [];
            gameState.board.forEach((tile, idx) => {
                if (tile.effect && tile.effect.type === 'event' && tile.effect.eventId === 'whitehole') {
                    whiteholeIndices.push(idx);
                }
            });

            // 隣接するホワイトホールを探す
            const adjacentWHIndex = whiteholeIndices.find(idx => Math.abs(idx - position) === 1);
            if (adjacentWHIndex === undefined) return false;

            // 50%の確率で弾き出される
            if (Math.random() < 0.5) {
                const player = gameState.players[gameState.currentPlayerIndex];
                // 前のマスなら1戻る、後ろのマスなら1進む
                const direction = position < adjacentWHIndex ? -1 : 1;
                let newPos = position + direction;
                if (newPos < 0) newPos = 0;
                if (newPos >= gameState.board.length) newPos = gameState.board.length - 1;

                showModal('info', `隣のホワイトホールに弾き出された！`, () => {
                    player.position = newPos;
                    renderBoard();
                    updateStatus();
                    setTimeout(() => {
                        executeTileEffect(gameState.board[newPos]);
                    }, 300);
                });
                return true;
            }

            return false;
        }

        function triggerBlackholeEffect() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const roll = Math.random();

            if (roll < 0.80) {
                // 80%: ホワイトホールマスに移動（存在する場合）
                const whiteholeTileIndex = gameState.board.findIndex(tile =>
                    tile.effect && tile.effect.type === 'event' && tile.effect.eventId === 'whitehole'
                );
                if (whiteholeTileIndex !== -1) {
                    player.position = whiteholeTileIndex;
                    renderBoard();
                    updateStatus();
                    showModal('info', `ホワイトホールから吐き出された！`, () => nextTurn());
                } else {
                    showModal('info', `ブラックホールに吸い込まれたが、ホワイトホールが存在しない...何も起きなかった。`, () => nextTurn());
                }
            } else if (roll < 0.85) {
                // 5%: プレイヤーが退場
                const playerName = player.name;
                showModal('info', `${playerName}がブラックホールに消えてしまった！`, () => {
                    eliminatePlayer();
                });
            } else {
                // 15%: 何も起きない
                showModal('info', `ブラックホールに近づいたが、何も起きなかった...`, () => nextTurn());
            }
        }

        function eliminatePlayer() {
            const eliminated = gameState.players[gameState.currentPlayerIndex];
            gameState.players.splice(gameState.currentPlayerIndex, 1);

            if (gameState.players.length === 0) {
                showModal('vanished', `${eliminated.name}がブラックホールに消えた...\nもう誰もいない。`);
                return;
            }

            // インデックスが範囲外になった場合は先頭に戻す
            if (gameState.currentPlayerIndex >= gameState.players.length) {
                gameState.currentPlayerIndex = 0;
            }

            renderBoard();
            updateStatus();
        }

        // ========== アイテム取得共通処理 ==========
        function onItemAcquired(itemData, afterCallback) {
            if (itemData.id === 'babel') {
                showModal('info', `スター...いや、これはバベルだ！バベルを手に入れた！（スターと表示される）`, () => {
                    updateStatus();
                    if (afterCallback) afterCallback();
                }, 'アイテムゲット！');
            } else {
                showModal('info', `${itemData.icon} ${itemData.name} を手に入れた！`, () => {
                    updateStatus();
                    if (afterCallback) afterCallback();
                }, 'アイテムゲット！');
            }
        }

        // ========== 逆さまスプレー ==========
        function promptSakasamaOrMove(result) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const sakasamaIndex = player.items.indexOf('sakasama');
            if (sakasamaIndex === -1) {
                movePlayer(result);
                return;
            }
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">逆さまスプレー</div>
                <div class="modal-text">サイコロの目: <strong>${result}</strong><br>誰かを${result}マス逆方向に移動させますか？</div>
                <button class="btn btn-primary" data-action="promptSakasamaTarget" data-result="${result}" data-sakasama-index="${sakasamaIndex}">使う — ターゲットを選ぶ</button>
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenMovePlayer" data-steps="${result}">使わない（${result}マス進む）</button>
            `;
            modal.classList.add('show');
        }

        function promptSakasamaTarget(result, itemIndex) {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const currentIdx = gameState.currentPlayerIndex;
            const playersHtml = gameState.players.map((p, i) => {
                const label = i === currentIdx
                    ? `自分（${p.name}）— ${result}マス戻る`
                    : `${p.name} — ${result}マス戻る`;
                return `<button class="btn btn-primary" style="margin:4px 0;width:100%;" data-action="useSakasama" data-result="${result}" data-item-index="${itemIndex}" data-target-index="${i}">${label}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">逆さまスプレー — ターゲット選択</div>
                <div class="modal-text">誰を${result}マス逆方向に移動させますか？</div>
                ${playersHtml}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenMovePlayer" data-steps="${result}">キャンセル（${result}マス進む）</button>
            `;
            modal.classList.add('show');
        }

        function useSakasama(result, itemIndex, targetPlayerIndex) {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.items.splice(itemIndex, 1);
            updateStatus();
            closeModal();

            const targetPlayer = gameState.players[targetPlayerIndex];
            if (targetPlayerIndex === gameState.currentPlayerIndex) {
                // 自分に使う: 自分が逆方向に移動
                showModal('info', `逆さまスプレーを使った！\n${result}マス逆方向に進む！`, () => movePlayer(-result));
            } else {
                if (targetPlayer.items.includes('katashiro')) {
                    promptKatashiroChoice({
                        kind: 'sakasama',
                        holderIndex: targetPlayerIndex,
                        attackerIndex: gameState.currentPlayerIndex,
                        result: result
                    });
                    return;
                }
                // 他プレイヤーに使う: そのプレイヤーを後退させ、自分は通常移動
                const newPos = Math.max(0, targetPlayer.position - result);
                targetPlayer.position = newPos;
                renderBoard();
                if (gameState.playMode === 'online') syncGameStateToFirebase();
                showModal('info', `逆さまスプレーを使った！\n${targetPlayer.name}が${result}マス逆方向に移動！`, () => nextTurn());
            }
        }

        // ========== コシンドスプレー ==========
        function promptNailThenEffect(position) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const nailIdx = player.items.indexOf('nail');
            const tile = gameState.board[position];
            const canPlace = nailIdx !== -1
                && tile && tile.id !== 'start' && tile.id !== 'goal'
                && !(gameState.nailTraps && gameState.nailTraps[position] !== undefined);
            if (canPlace) {
                promptNailPlacement(nailIdx, position, () => promptKoshindoOrEffect(position));
            } else {
                promptKoshindoOrEffect(position);
            }
        }

        function promptKoshindoOrEffect(position) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const tile = gameState.board[position];
            const koshindoIndex = player.items.indexOf('koshindo');
            if (koshindoIndex === -1 || !tile.effect) {
                executeTileEffect(tile);
                return;
            }
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">コシンドスプレー</div>
                <div class="modal-text">このマスの効果を無効化しますか？</div>
                <button class="btn btn-primary" data-action="useKoshindo" data-idx="${koshindoIndex}">使う（効果を無効化）</button>
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenExecuteTile" data-pos="${position}">使わない</button>
            `;
            modal.classList.add('show');
        }

        function useKoshindo(itemIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            player.items.splice(itemIndex, 1);
            updateStatus();
            closeModal();
            showModal('info', 'コシンドスプレーを使った！\nマスの効果を無効化した！', () => nextTurn());
        }

        function applyMoveEffect(moveValue) {
            const player = gameState.players[gameState.currentPlayerIndex];
            showModal('info',
                moveValue > 0 ? `${Math.abs(moveValue)}マス進む！` : `${Math.abs(moveValue)}マス戻る...`,
                () => {
                    let newPos = player.position + moveValue;
                    if (newPos < 0) newPos = 0;
                    if (newPos >= gameState.board.length) newPos = gameState.board.length - 1;
                    player.position = newPos;
                    renderBoard();
                    updateStatus();
                    if (newPos >= gameState.board.length - 1) {
                        triggerWin();
                        return;
                    }
                    nextTurn();
                }
            );
        }

        function useShield(itemIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            player.items.splice(itemIndex, 1);
            updateStatus();
            closeModal();
            showModal('info', '🛡️ 盾を使った！\n戻るマスの効果を無効化した！', () => nextTurn());
        }

        function shieldSkipAndMove(moveValue) {
            closeModal();
            applyMoveEffect(moveValue);
        }

        // ========== バベル ==========
        function promptBabelTarget(afterCallback) {
            const otherPlayers = gameState.players.filter((_, i) => i !== gameState.currentPlayerIndex);
            if (otherPlayers.length === 0) {
                showModal('info', '（1人プレイのためバベルの効果は発動しません）', () => { if (afterCallback) afterCallback(); });
                return;
            }
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const playersHtml = gameState.players.map((p, i) => {
                if (i === gameState.currentPlayerIndex) return '';
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="setBabelTarget" data-idx="${i}">${escapeHtml(p.name)}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">バベル</div>
                <div class="modal-text">ゲーム終了後に順位を入れ替えるプレイヤーを選んでください。</div>
                ${playersHtml}
            `;
            modal.classList.add('show');
            window.modalCallback = afterCallback;
        }

        function setBabelTarget(targetIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            player.babelTarget = targetIndex;
            const cb = window.modalCallback;   // closeModal前に退避
            closeModal();
            showModal('info', `${gameState.players[targetIndex].name}を選択した。\nゲーム終了時に順位が入れ替わる...`, () => { if (cb) cb(); });
        }

        // ========== 呪われた人形 肩代わり処理 ==========
        function applyEffectToDollHolder(holderIndex, tile) {
            const holder = gameState.players[holderIndex];
            switch (tile.effect.type) {
                case 'move': {
                    let newPos = holder.position + tile.effect.value;
                    if (newPos < 0) newPos = 0;
                    if (newPos >= gameState.board.length) newPos = gameState.board.length - 1;
                    holder.position = newPos;
                    renderBoard();
                    updateStatus();
                    showModal('info',
                        tile.effect.value > 0
                            ? `${holder.name}が${Math.abs(tile.effect.value)}マス進んだ！`
                            : `${holder.name}が${Math.abs(tile.effect.value)}マス戻った...`,
                        () => nextTurn()
                    );
                    break;
                }
                case 'item': {
                    const enabledItemsList = ITEMS.filter(item => gameState.enabledItems[item.id]);
                    if (enabledItemsList.length > 0) {
                        const randomItem = enabledItemsList[Math.floor(Math.random() * enabledItemsList.length)];
                        holder.items.push(randomItem.id);
                        const dispName = randomItem.name;
                        showModal('info', `${holder.name}が「${dispName}」を受け取った！`, () => { updateStatus(); nextTurn(); });
                    } else {
                        nextTurn();
                    }
                    break;
                }
                default:
                    holder.skipTurns = 1;
                    showModal('info', `呪いの余波で${holder.name}が1ターン休みになった！`, () => { updateStatus(); nextTurn(); });
            }
        }

        // ========== スナッチャー ==========
        function promptSnatcherTargetPlayer() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const playersHtml = gameState.players.map((p, i) => {
                if (i === gameState.currentPlayerIndex) return '';
                if (p.items.length === 0) return `<button class="btn btn-secondary" style="margin:4px;width:100%;" disabled>${escapeHtml(p.name)}（アイテムなし）</button>`;
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="snatcherSelectPlayer" data-idx="${i}">${escapeHtml(p.name)}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">スナッチャー</div>
                <div class="modal-text">アイテムを奪う相手を選んでください</div>
                ${playersHtml}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenRollDice">キャンセル</button>
            `;
            modal.classList.add('show');
        }

        function snatcherSelectPlayer(targetPlayerIndex) {
            closeModal();
            const targetPlayer = gameState.players[targetPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const itemsHtml = targetPlayer.items.map((itemId, index) => {
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="snatcherStealItem" data-target="${targetPlayerIndex}" data-idx="${index}">${itemLabel(itemId)}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">スナッチャー</div>
                <div class="modal-text">${escapeHtml(targetPlayer.name)}のどのアイテムを奪いますか？</div>
                ${itemsHtml}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenRollDice">キャンセル</button>
            `;
            modal.classList.add('show');
        }

        function snatcherStealItem(targetPlayerIndex, targetItemIndex) {
            const targetPlayer = gameState.players[targetPlayerIndex];
            if (targetPlayer && targetPlayer.items.includes('katashiro')) {
                promptSnatcherKatashiro(targetPlayerIndex, targetItemIndex);
                return;
            }
            performSnatcherSteal(targetPlayerIndex, targetItemIndex);
        }

        function performSnatcherSteal(targetPlayerIndex, targetItemIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const targetPlayer = gameState.players[targetPlayerIndex];
            const stolenItemId = targetPlayer.items.splice(targetItemIndex, 1)[0];
            player.items.push(stolenItemId);
            closeModal();
            updateStatus();
            showModal('info', `スナッチャー発動！\n${escapeHtml(targetPlayer.name)}から「${itemLabel(stolenItemId)}」を奪った！`, () => doRollDice());
        }

        // ========== トンカチ ==========
        function promptHammerTarget() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const targets = gameState.players
                .map((p, i) => ({ p, i }))
                .filter(({ p, i }) => i !== gameState.currentPlayerIndex && p.position === player.position);
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const btns = targets.map(({ p, i }) =>
                `<button class="btn btn-secondary" style="margin:4px 0;width:100%;" data-action="useHammerOn" data-idx="${i}">${escapeHtml(p.name)}</button>`
            ).join('');
            content.innerHTML = `
                <div class="modal-title">トンカチ</div>
                <div class="modal-text">誰を1回休みにしますか？</div>
                ${btns}
            `;
            modal.classList.add('show');
        }

        function useHammerOn(targetIndex) {
            const target = gameState.players[targetIndex];
            if (target.items.includes('katashiro')) {
                closeModal();
                promptKatashiroChoice({
                    kind: 'hammer',
                    holderIndex: targetIndex,
                    attackerIndex: gameState.currentPlayerIndex
                });
                return;
            }
            target.skipTurns = 1;
            closeModal();
            updateStatus();
            showModal('info', `「トンカチ」を使った！\n${target.name}が1回休みになった！`, () => doRollDice());
        }

        function consumeKatashiro(holderIndex) {
            const holder = gameState.players[holderIndex];
            if (!holder) return;
            const katashiroIdx = holder.items.indexOf('katashiro');
            if (katashiroIdx !== -1) holder.items.splice(katashiroIdx, 1);
        }

        function applyKatashiroPenalty(holderIndex) {
            const holder = gameState.players[holderIndex];
            if (!holder) return 0;
            const backSteps = Math.floor(Math.random() * 3) + 1;
            holder.position = Math.max(0, holder.position - backSteps);
            return backSteps;
        }

        function promptKatashiroChoice(context) {
            window.katashiroContext = context;
            const holder = gameState.players[context.holderIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">形代</div>
                <div class="modal-text"><strong>${escapeHtml(holder.name)}</strong> は形代を使いますか？</div>
                <button class="btn btn-primary" style="margin-top:8px;width:100%;" data-action="katashiroUse">使う</button>
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="katashiroSkip">使わない</button>
            `;
            modal.classList.add('show');
        }

        function katashiroSkip() {
            const context = window.katashiroContext;
            window.katashiroContext = null;
            closeModal();
            if (!context) return;
            if (context.kind === 'sakasama') {
                const target = gameState.players[context.holderIndex];
                const newPos = Math.max(0, target.position - context.result);
                target.position = newPos;
                renderBoard();
                updateStatus();
                if (gameState.playMode === 'online') syncGameStateToFirebase();
                showModal('info', `逆さまスプレーを使った！\n${target.name}が${context.result}マス逆方向に移動！`, () => nextTurn());
                return;
            }
            if (context.kind === 'hammer') {
                const target = gameState.players[context.holderIndex];
                target.skipTurns = 1;
                updateStatus();
                showModal('info', `「トンカチ」を使った！\n${target.name}が1回休みになった！`, () => doRollDice());
                return;
            }
            if (context.kind === 'gekokujo') {
                applyGekokujoSwap(context.holderIndex, false, context.holderIndex);
            }
        }

        function katashiroUse() {
            const context = window.katashiroContext;
            if (!context) return;
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            let candidates = [];
            if (context.kind === 'gekokujo') {
                candidates = gameState.players
                    .map((p, i) => ({ p, i }))
                    .filter(({ i }) => i !== context.holderIndex);
            } else {
                candidates = gameState.players
                    .map((p, i) => ({ p, i }))
                    .filter(({ i }) => i !== context.holderIndex);
            }
            if (candidates.length === 0) {
                katashiroSkip();
                return;
            }
            const promptText = context.kind === 'gekokujo'
                ? '下剋上の対象を選んでください'
                : '効果を押し付ける相手を選んでください';
            const buttons = candidates.map(({ p, i }) =>
                `<button class="btn btn-primary" style="margin:4px 0;width:100%;" data-action="katashiroRedirectTarget" data-idx="${i}">${escapeHtml(p.name)}</button>`
            ).join('');
            content.innerHTML = `
                <div class="modal-title">形代</div>
                <div class="modal-text">${promptText}</div>
                ${buttons}
            `;
            modal.classList.add('show');
        }

        function katashiroRedirectTarget(targetIndex) {
            const context = window.katashiroContext;
            window.katashiroContext = null;
            closeModal();
            if (!context) return;
            consumeKatashiro(context.holderIndex);
            const holder = gameState.players[context.holderIndex];
            const backSteps = applyKatashiroPenalty(context.holderIndex);
            if (context.kind === 'sakasama') {
                const target = gameState.players[targetIndex];
                target.position = Math.max(0, target.position - context.result);
                renderBoard();
                updateStatus();
                if (gameState.playMode === 'online') syncGameStateToFirebase();
                showModal('info', `形代が発動！\n${holder.name}が${target.name}に効果を押し付けた！\n${target.name}が${context.result}マス逆方向に移動。\n${holder.name}は${backSteps}マス戻った。`, () => nextTurn());
                return;
            }
            if (context.kind === 'hammer') {
                const target = gameState.players[targetIndex];
                target.skipTurns = 1;
                renderBoard();
                updateStatus();
                showModal('info', `形代が発動！\n${holder.name}が${target.name}に効果を押し付けた！\n${target.name}が1回休みに。\n${holder.name}は${backSteps}マス戻った。`, () => doRollDice());
                return;
            }
            if (context.kind === 'gekokujo') {
                applyGekokujoSwap(targetIndex, true, context.holderIndex, backSteps);
            }
        }

        function promptSnatcherKatashiro(targetPlayerIndex, targetItemIndex) {
            window.snatcherKatashiroData = { targetPlayerIndex, targetItemIndex };
            const targetPlayer = gameState.players[targetPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">形代</div>
                <div class="modal-text"><strong>${escapeHtml(targetPlayer.name)}</strong> は形代を使いますか？</div>
                <button class="btn btn-primary" style="margin-top:8px;width:100%;" data-action="snatcherKatashiroUse">使う</button>
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="snatcherKatashiroSkip">使わない</button>
            `;
            modal.classList.add('show');
        }

        function snatcherKatashiroSkip() {
            const data = window.snatcherKatashiroData;
            window.snatcherKatashiroData = null;
            if (!data) return;
            performSnatcherSteal(data.targetPlayerIndex, data.targetItemIndex);
        }

        function snatcherKatashiroUse() {
            const data = window.snatcherKatashiroData;
            if (!data) return;
            const holderIndex = data.targetPlayerIndex;
            const attackerIndex = gameState.currentPlayerIndex;
            const candidates = gameState.players
                .map((p, i) => ({ p, i }))
                .filter(({ p, i }) => i !== holderIndex && i !== attackerIndex && p.items.length > 0);
            if (candidates.length === 0) {
                showModal('info', '形代を使える対象がいないため、通常どおり奪われる。', () => {
                    snatcherKatashiroSkip();
                });
                return;
            }
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const playersHtml = candidates.map(({ p, i }) =>
                `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="snatcherKatashiroSelectPlayer" data-idx="${i}">${escapeHtml(p.name)}</button>`
            ).join('');
            content.innerHTML = `
                <div class="modal-title">形代</div>
                <div class="modal-text">スナッチャーの対象を選んでください</div>
                ${playersHtml}
            `;
            modal.classList.add('show');
        }

        function snatcherKatashiroSelectPlayer(targetPlayerIndex) {
            const targetPlayer = gameState.players[targetPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const itemsHtml = targetPlayer.items.map((itemId, index) => {
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="snatcherKatashiroStealItem" data-target="${targetPlayerIndex}" data-idx="${index}">${itemLabel(itemId)}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">形代</div>
                <div class="modal-text">${escapeHtml(targetPlayer.name)}から奪うアイテムを選んでください</div>
                ${itemsHtml}
            `;
            modal.classList.add('show');
        }

        function snatcherKatashiroStealItem(targetPlayerIndex, targetItemIndex) {
            const data = window.snatcherKatashiroData;
            window.snatcherKatashiroData = null;
            if (!data) return;
            const holderIndex = data.targetPlayerIndex;
            consumeKatashiro(holderIndex);
            const holder = gameState.players[holderIndex];
            const backSteps = applyKatashiroPenalty(holderIndex);

            const player = gameState.players[gameState.currentPlayerIndex];
            const targetPlayer = gameState.players[targetPlayerIndex];
            const stolenItemId = targetPlayer.items.splice(targetItemIndex, 1)[0];
            player.items.push(stolenItemId);
            closeModal();
            updateStatus();
            showModal('info', `形代が発動！\n${holder.name}が対象をすり替えた！\n${escapeHtml(targetPlayer.name)}から「${itemLabel(stolenItemId)}」を奪った！\n${holder.name}は${backSteps}マス戻った。`, () => doRollDice());
        }

        function useGekokujo() {
            const currentIndex = gameState.currentPlayerIndex;
            const topIndex = findTopOpponentIndex(currentIndex);
            if (topIndex === -1) {
                showModal('info', 'すでにトップのため効果なし', () => doRollDice());
                return;
            }
            const topPlayer = gameState.players[topIndex];
            if (topPlayer.items.includes('katashiro')) {
                promptKatashiroChoice({
                    kind: 'gekokujo',
                    holderIndex: topIndex,
                    attackerIndex: currentIndex
                });
                return;
            }
            applyGekokujoSwap(topIndex, false, topIndex);
        }

        function applyGekokujoSwap(targetIndex, katashiroUsed, originalTopIndex, katashiroBackSteps) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const target = gameState.players[targetIndex];
            const pos = player.position;
            player.position = target.position;
            target.position = pos;
            player.items = [];
            renderBoard();
            updateStatus();
            const topName = gameState.players[originalTopIndex]?.name || target.name;
            const katashiroNote = katashiroUsed
                ? `\n形代が発動！${topName}が対象をすり替え、${topName}は${katashiroBackSteps}マス戻った。`
                : '';
            showModal('info', `下剋上発動！\n${target.name}と場所を交換した！\n${player.name}のアイテムはすべて失われた。${katashiroNote}`, () => doRollDice());
        }

        // ========== 釘＋トンカチ コンボ ==========
        function useNailHammerCombo() {
            const player = gameState.players[gameState.currentPlayerIndex];
            // 釘とトンカチを消費
            let nailIdx = player.items.indexOf('nail');
            if (nailIdx !== -1) player.items.splice(nailIdx, 1);
            let hammerIdx = player.items.indexOf('hammer');
            if (hammerIdx !== -1) player.items.splice(hammerIdx, 1);
            closeModal();

            // 呪われた人形を持つ他プレイヤーを探す
            const dollHolders = gameState.players
                .map((p, i) => ({ p, i }))
                .filter(({ p, i }) => i !== gameState.currentPlayerIndex && p.items.includes('curseddoll'));

            if (dollHolders.length === 0) {
                player.immuneTurns = 3;
                updateStatus();
                showModal('info', `コンボ発動！\n呪われた人形は見つからなかったが、\n${player.name}は3ターン間、不利な効果を無効化する！`, () => doRollDice());
                return;
            }
            if (dollHolders.length === 1) {
                const target = dollHolders[0].p;
                const dollIdx = target.items.indexOf('curseddoll');
                target.items.splice(dollIdx, 1);
                player.immuneTurns = 3;
                updateStatus();
                showModal('info', `コンボ発動！\n${target.name}の呪われた人形を破壊！\n${player.name}は3ターン間、不利な効果を無効化する！`, () => doRollDice());
                return;
            }
            // 複数いる場合は選択
            promptDollDestroyTarget(dollHolders, player);
        }

        function promptDollDestroyTarget(dollHolders, player) {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const btns = dollHolders.map(({ p, i }) =>
                `<button class="btn btn-danger" style="margin:4px 0;width:100%;" data-action="destroyDollOf" data-idx="${i}">${escapeHtml(p.name)}の人形を破壊</button>`
            ).join('');
            content.innerHTML = `
                <div class="modal-title">コンボ発動</div>
                <div class="modal-text">誰の呪われた人形を破壊しますか？</div>
                ${btns}
            `;
            modal.classList.add('show');
        }

        function destroyDollOf(targetIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const target = gameState.players[targetIndex];
            const dollIdx = target.items.indexOf('curseddoll');
            if (dollIdx !== -1) target.items.splice(dollIdx, 1);
            player.immuneTurns = 3;
            updateStatus();
            closeModal();
            showModal('info', `コンボ発動！\n${target.name}の呪われた人形を破壊！\n${player.name}は3ターン間、不利な効果を無効化する！`, () => doRollDice());
        }

        // ========== 釘の設置 ==========
        function promptNailPlacement(nailIdx, pos, callback) {
            window.nailCallback = callback;
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const tileName = gameState.board[pos]?.name || 'このマス';
            content.innerHTML = `
                <div class="modal-title">釘の設置</div>
                <div class="modal-text">「${tileName}」に釘を設置しますか？<br>他プレイヤーが通過時に強制停止します。</div>
                <button class="btn btn-primary" data-action="confirmNailPlacement" data-nail-idx="${nailIdx}" data-pos="${pos}">設置する</button>
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="closeModalThenNailCallback">設置しない</button>
            `;
            modal.classList.add('show');
        }

        function confirmNailPlacement(nailIdx, pos) {
            const player = gameState.players[gameState.currentPlayerIndex];
            player.items.splice(nailIdx, 1);
            if (!gameState.nailTraps) gameState.nailTraps = {};
            gameState.nailTraps[pos] = gameState.currentPlayerIndex;
            updateStatus();
            renderBoard();
            closeModal();
            window.nailCallback();
        }

        function executeTileEffect(tile) {
            const player = gameState.players[gameState.currentPlayerIndex];

            // ゴールマスに到達している場合は即ゲーム終了
            if (player && player.position >= gameState.board.length - 1) {
                triggerWin();
                return;
            }

            if (!tile.effect) {
                nextTurn();
                return;
            }

            // 免疫チェック: 不利なマス効果を無効化
            if (player && player.immuneTurns > 0) {
                const isNegative =
                    (tile.effect.type === 'move' && tile.effect.value < 0) ||
                    tile.effect.type === 'rest' ||
                    (tile.effect.type === 'event' && (
                        tile.effect.eventId === 'pit' ||
                        tile.effect.eventId === 'wind' ||
                        tile.effect.eventId === 'storm' ||
                        tile.effect.eventId === 'blackhole'
                    ));
                if (isNegative) {
                    showModal('info', `免疫効果で「${tile.name}」の効果が無効化された！`, () => nextTurn());
                    return;
                }
            }

            // 呪われた人形チェック（免疫なし & 他プレイヤーが持っていれば30%で肩代わり）
            if (!player || player.immuneTurns <= 0) {
                const dollHolderIndex = gameState.players.findIndex((p, i) =>
                    i !== gameState.currentPlayerIndex && p.items.includes('curseddoll')
                );
                if (dollHolderIndex !== -1 && Math.random() < 0.30) {
                    const dollHolder = gameState.players[dollHolderIndex];
                    showModal('info', `呪われた人形が反応した！\n${dollHolder.name}が代わりに効果を受ける！`, () => {
                        applyEffectToDollHolder(dollHolderIndex, tile);
                    });
                    return;
                }
            }
            
            switch (tile.effect.type) {
                case 'rest': {
                    const turns = tile.effect?.value || 1;
                    player.skipTurns = (player.skipTurns || 0) + turns;
                    const msg = turns === 1 ? '休みマス！1回休みます...' : `休みマス！${turns}回休みます...`;
                    showModal('info', msg, () => nextTurn());
                    break;
                }
                case 'move': {
                    const moveValue = tile.effect.value;
                    if (moveValue < 0) {
                        const shieldIndex = player.items.indexOf('shield');
                        if (shieldIndex !== -1) {
                            const modal = document.getElementById('modal');
                            const content = document.getElementById('modalContent');
                            content.innerHTML = `
                                <div class="modal-title">🛡️ 盾</div>
                                <div class="modal-text">${Math.abs(moveValue)}マス戻る効果を無効化しますか？</div>
                                <button class="btn btn-primary" data-action="useShield" data-idx="${shieldIndex}">使う（効果を無効化）</button>
                                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="shieldSkipAndMove" data-value="${moveValue}">使わない</button>
                            `;
                            modal.classList.add('show');
                            break;
                        }
                    }
                    applyMoveEffect(moveValue);
                    break;
                }
                    
                case 'item':
                    const enabledItemsList = ITEMS.filter(item => gameState.enabledItems[item.id]);
                    if (enabledItemsList.length === 0) {
                        showModal('info', 'アイテムなし', () => nextTurn());
                    } else {
                        const randomItem = enabledItemsList[Math.floor(Math.random() * enabledItemsList.length)];
                        player.items.push(randomItem.id);
                        onItemAcquired(randomItem, () => nextTurn());
                    }
                    break;
                    
                case 'event':
                    handleEvent(tile.effect);
                    break;
                    
                default:
                    nextTurn();
            }
        }
        
        function handleEvent(eventEffect) {
            const player = gameState.players[gameState.currentPlayerIndex];
            let callback = () => nextTurn();
            let eventText = eventEffect.eventText;

            // 商人：特殊UIなので早期リターン
            if (eventEffect.eventEffect === 'merchant') {
                showMerchantDialog();
                return;
            }

            // 怒らせたら10進む：ルーレット＋タイマーダイアログ
            if (eventEffect.eventEffect === 'angry') {
                showAngryRoulette();
                return;
            }

            // 自分をアピールして！：30秒アピール＋他プレイヤー投票
            if (eventEffect.eventEffect === 'self_appeal') {
                showSelfAppealEvent();
                return;
            }

            // 好きなだけ進んでいいよ：数値入力モーダル
            if (eventEffect.eventEffect === 'freemove') {
                showFreeMoveDialog();
                return;
            }

            // 今日のラッキーナンバーは？：数値入力→ランダム効果
            if (eventEffect.eventEffect === 'luckynumber') {
                showLuckyNumberDialog();
                return;
            }

            // がんばれ！：見出しのみ表示
            if (eventEffect.eventEffect === 'ganbare') {
                const modal = document.getElementById('modal');
                const content = document.getElementById('modalContent');
                content.innerHTML = `
                    <div class="modal-title">がんばれ！</div>
                    <button class="btn btn-primary" data-action="closeModalThenNextTurn">OK</button>
                `;
                modal.classList.add('show');
                updateStatus();
                return;
            }

            // ここをスタートとする！：盤面再構成
            if (eventEffect.eventEffect === 'newstart') {
                const newStartIdx = player.position;
                if (newStartIdx === 0) {
                    showModal('info', 'すでにスタートマスです。何も起きなかった。', () => nextTurn());
                    return;
                }
                showModal('info', eventText, () => {
                    gameState.board = gameState.board.slice(newStartIdx);
                    gameState.board[0] = { ...TILE_TYPES.START };
                    gameState.players.forEach(p => {
                        p.position = p.position < newStartIdx ? 0 : p.position - newStartIdx;
                    });
                    renderBoard();
                    updateStatus();
                    nextTurn();
                }, eventEffect.eventTitle);
                return;
            }

            // ゲームをやめろ！：強制リザルト
            if (eventEffect.eventEffect === 'forceend') {
                showModal('info', eventText, () => {
                    if (!gameState.winShown) {
                        gameState.winShown = true;
                        const ranked = gameState.players.slice().sort((a, b) => b.position - a.position);
                        showModal('win', buildResultText(ranked[0].name), '');
                    }
                }, eventEffect.eventTitle);
                updateStatus();
                return;
            }

            if (eventEffect.eventEffect === 'item') {
                const enabledItemsList = ITEMS.filter(item => gameState.enabledItems[item.id]);
                if (enabledItemsList.length > 0) {
                    const randomItem = enabledItemsList[Math.floor(Math.random() * enabledItemsList.length)];
                    player.items.push(randomItem.id);
                    eventText += `\n${randomItem.icon} ${randomItem.name} を手に入れた！`;
                    if (randomItem.id === 'babel') {
                        callback = () => { updateStatus(); promptBabelTarget(); };
                    }
                }
            } else if (eventEffect.eventEffect === 'extraTurn') {
                callback = () => {
                    showModal('info', 'もう一度サイコロを振れます！');
                };
            } else if (eventEffect.eventEffect === 'skip') {
                player.skipTurns = 1;
            } else if (typeof eventEffect.eventEffect === 'number') {
                callback = () => {
                    let newPos = player.position + eventEffect.eventEffect;
                    if (newPos < 0) newPos = 0;
                    if (newPos >= gameState.board.length) newPos = gameState.board.length - 1;
                    player.position = newPos;
                    renderBoard();
                    updateStatus();
                    if (newPos >= gameState.board.length - 1) {
                        triggerWin();
                        return;
                    }
                    executeTileEffect(gameState.board[newPos]);
                };
            } else if (eventEffect.eventEffect === 'storm' && gameState.players.length > 1) {
                callback = () => {
                    gameState.players.forEach((p, i) => {
                        if (i !== gameState.currentPlayerIndex) {
                            p.position = Math.max(0, p.position - 1);
                        }
                    });
                    renderBoard();
                    updateStatus();
                    nextTurn();
                };
            } else if (eventEffect.eventEffect === 'blackhole') {
                callback = () => triggerBlackholeEffect();
            } else if (eventEffect.eventEffect === 'whitehole') {
                // 通常着地では何も起きない
                callback = () => nextTurn();
            } else if (eventEffect.eventEffect === 'mask') {
                callback = () => {
                    const maskIndices = [];
                    gameState.board.forEach((tile, idx) => {
                        if (tile.effect && tile.effect.type === 'event' && tile.effect.eventId === 'mask') {
                            maskIndices.push(idx);
                        }
                    });
                    const otherMasks = maskIndices.filter(idx => idx !== player.position);
                    if (otherMasks.length === 0) {
                        showModal('info', '別の覆面マスが見つからない...何も起きなかった。', () => nextTurn());
                    } else {
                        const dest = otherMasks[Math.floor(Math.random() * otherMasks.length)];
                        player.position = dest;
                        renderBoard();
                        updateStatus();
                        showModal('info', `${dest + 1}マス目の覆面マスへワープした！`, () => nextTurn());
                    }
                };
            } else if (eventEffect.eventEffect === 'average') {
                callback = () => {
                    showAverageRoulette((selectedIndex) => {
                        const targetPlayer = gameState.players[selectedIndex];
                        const dest = targetPlayer.position;
                        gameState.players.forEach(p => { p.position = dest; });
                        renderBoard();
                        updateStatus();
                        showModal('info', `${targetPlayer.name}のマス（${dest + 1}マス目）に全員集合！`, () => nextTurn());
                    });
                };
            } else if (eventEffect.eventEffect === 'nameback') {
                callback = () => {
                    const steps = player.name.length;
                    const newPos = Math.max(0, player.position - steps);
                    player.position = newPos;
                    renderBoard();
                    updateStatus();
                    showModal('info', `${player.name}は${steps}文字！${steps}マス戻った...`, () => nextTurn());
                };
            } else if (eventEffect.eventEffect === 'resetall') {
                callback = () => {
                    gameState.players.forEach(p => { p.position = 0; });
                    renderBoard();
                    updateStatus();
                    nextTurn();
                };
            }

            showModal('info', eventText, callback, eventEffect.eventTitle);
            updateStatus();
        }

        // ========== 怪しい商人UI ==========
        function showMerchantDialog() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const enabledItemsList = ITEMS.filter(item => gameState.enabledItems[item.id]);
            if (enabledItemsList.length === 0) {
                showModal('info', '怪しい商人に出会ったが、商品が何もなかった...', () => nextTurn());
                return;
            }
            const shuffled = enabledItemsList.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const items3 = shuffled.slice(0, Math.min(3, shuffled.length));
            window.merchantItems3 = items3;

            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const itemButtons = items3.map(item =>
                `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="merchantPickItem" data-item-id="${item.id}">${item.icon} ${item.name}<br><small style="font-size:11px;opacity:0.8;">${item.effect}</small></button>`
            ).join('');
            const tradeBtn = player.items.length > 0
                ? `<button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="merchantOfferTrade">アイテムを1つ渡して2つ選ぶ</button>`
                : '';
            content.innerHTML = `
                <div class="modal-title">怪しい商人</div>
                <div class="modal-text">怪しい商人に出会った。1つ選んでください：</div>
                ${itemButtons}
                ${tradeBtn}
            `;
            modal.classList.add('show');
            updateStatus();
        }

        function merchantPickItem(itemId) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const itemData = ITEMS.find(i => i.id === itemId);
            closeModal();
            // 25%の確率で偽物
            if (Math.random() < 0.25) {
                updateStatus();
                showModal('info', '手に入れたアイテムは偽物だった！', () => nextTurn());
                return;
            }
            player.items.push(itemId);
            onItemAcquired(itemData, () => nextTurn());
        }

        function merchantOfferTrade() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const ownItemsHtml = player.items.map((itemId, index) => {
                return `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="merchantTradeGiveItem" data-idx="${index}">${itemLabel(itemId)}</button>`;
            }).join('');
            content.innerHTML = `
                <div class="modal-title">怪しい商人</div>
                <div class="modal-text">渡すアイテムを選んでください：</div>
                ${ownItemsHtml}
                <button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="merchantShowOptions3">キャンセル（1つ選ぶに戻る）</button>
            `;
            modal.classList.add('show');
        }

        function merchantTradeGiveItem(ownItemIndex) {
            const player = gameState.players[gameState.currentPlayerIndex];
            player.items.splice(ownItemIndex, 1);
            updateStatus();
            merchantPickFromRemaining(window.merchantItems3, []);
        }

        function merchantPickFromRemaining(remaining, picked) {
            window.merchantRemaining = remaining;
            window.merchantPicked = picked;
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const pickNum = picked.length + 1;
            const itemButtons = remaining.map(item =>
                `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="merchantSelectItem" data-item-id="${item.id}">${item.icon} ${item.name}<br><small style="font-size:11px;opacity:0.8;">${item.effect}</small></button>`
            ).join('');
            content.innerHTML = `
                <div class="modal-title">怪しい商人</div>
                <div class="modal-text">${pickNum}つ目を選んでください（残り${2 - picked.length}個選べます）：</div>
                ${itemButtons}
            `;
            modal.classList.add('show');
        }

        function merchantSelectItem(itemId) {
            const player = gameState.players[gameState.currentPlayerIndex];
            const remaining = window.merchantRemaining || [];
            const picked = window.merchantPicked || [];
            const newPicked = [...picked, itemId];
            const newRemaining = remaining.filter(i => i.id !== itemId);
            if (newPicked.length < 2 && newRemaining.length > 0) {
                player.items.push(itemId);
                updateStatus();
                merchantPickFromRemaining(newRemaining, newPicked);
            } else {
                closeModal();
                // 各アイテムに25%の確率で偽物チェック
                const realItems = [];
                let anyFake = false;
                newPicked.forEach(id => {
                    if (Math.random() < 0.25) {
                        anyFake = true;
                    } else {
                        player.items.push(id);
                        realItems.push(id);
                    }
                });
                updateStatus();
                if (anyFake && realItems.length === 0) {
                    showModal('info', '手に入れたアイテムは偽物だった！', () => nextTurn());
                } else if (anyFake) {
                    const realNames = realItems.map(id => itemLabel(id)).join('、');
                    showModal('info', `手に入れたアイテムは偽物だった！\n（${realNames} は本物）`, () => nextTurn());
                } else {
                    const acquiredNames = realItems.map(id => itemLabel(id)).join('、');
                    showModal('info', `商人との取引完了！\n「${acquiredNames}」を手に入れた！`, () => nextTurn());
                }
            }
        }

        function merchantShowOptions3() {
            const player = gameState.players[gameState.currentPlayerIndex];
            const items3 = window.merchantItems3;
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const itemButtons = items3.map(item =>
                `<button class="btn btn-primary" style="margin:4px;width:100%;" data-action="merchantPickItem" data-item-id="${item.id}">${item.icon} ${item.name}<br><small style="font-size:11px;opacity:0.8;">${item.effect}</small></button>`
            ).join('');
            const tradeBtn = player.items.length > 0
                ? `<button class="btn btn-secondary" style="margin-top:8px;width:100%;" data-action="merchantOfferTrade">アイテムを1つ渡して2つ選ぶ</button>`
                : '';
            content.innerHTML = `
                <div class="modal-title">怪しい商人</div>
                <div class="modal-text">怪しい商人に出会った。1つ選んでください：</div>
                ${itemButtons}
                ${tradeBtn}
            `;
            modal.classList.add('show');
        }

        function nextTurn() {
            if (gameState.playMode === 'single') return;

            // 免疫ターンのデクリメント（今終わったターンのプレイヤー）
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            if (currentPlayer && currentPlayer.immuneTurns > 0) {
                currentPlayer.immuneTurns--;
            }
            doNextTurn();
        }

        function doNextTurn() {
            gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            updateStatus();

            if (gameState.playMode === 'online') {
                syncGameStateToFirebase();
                updateDiceInteractivity();
            }

            // マルチプレイ: ターン開始をダイアログで通知
            if (gameState.playMode !== 'single') {
                const nextPlayer = gameState.players[gameState.currentPlayerIndex];
                if (nextPlayer) {
                    showModal('info', '', undefined, `${nextPlayer.name}のターン！`);
                }
            }
        }
        
        function updateStatus() {
            const player = gameState.players[gameState.currentPlayerIndex];

            // マルチプレイ: 現在プレイヤーのバナーとパネルを表示
            const banner = document.getElementById('currentPlayerBanner');
            if (gameState.playMode !== 'single') {
                banner.textContent = `${player.name}のターン`;
                banner.classList.remove('hidden');
                document.getElementById('playScreen').classList.add('with-banner');

                // プレイヤー一覧パネルを更新
                renderPlayerListPanel();
                document.getElementById('playerListPanel').classList.remove('hidden');
                document.getElementById('playerListToggle').classList.remove('hidden');

                // シングルプレイ用要素を隠す
                document.getElementById('status').classList.add('hidden');
                document.getElementById('inventoryContainer').classList.add('hidden');
            } else {
                // シングルプレイ: 従来のステータス表示
                banner.classList.add('hidden');
                document.getElementById('playerListPanel').classList.add('hidden');
                document.getElementById('playerListPanel').classList.remove('open');
                document.getElementById('playerListToggle').classList.add('hidden');
                document.getElementById('playerListOverlay').classList.add('hidden');

                const status = document.getElementById('status');
                status.classList.remove('hidden');
                status.innerHTML = `
                    <div class="status-item">
                        <span>現在位置:</span>
                        <strong>${player.position + 1} / ${gameState.board.length}</strong>
                    </div>
                    ${player.skipTurns > 0 ? `<div class="status-item" style="color: red;"><span>⚠️ 休み中（あと${player.skipTurns}回）</span></div>` : ''}
                `;

                const inventoryContainer = document.getElementById('inventoryContainer');
                const inventory = document.getElementById('inventory');
                if (player.items.length > 0) {
                    inventoryContainer.classList.remove('hidden');
                    inventory.innerHTML = player.items.map(itemId => {
                        return `<div class="inventory-item">${itemLabel(itemId)}</div>`;
                    }).join('');
                } else {
                    inventoryContainer.classList.add('hidden');
                }
            }

            // 休みターン時のサイコロUI
            if (gameState.mode === 'play' && !gameState.isRolling) {
                const diceEl = document.getElementById('dice');
                const diceHintEl = diceEl ? diceEl.nextElementSibling : null;
                const currentPlayer = gameState.players[gameState.currentPlayerIndex];
                if (diceEl && currentPlayer) {
                    if (currentPlayer.skipTurns > 0) {
                        diceEl.textContent = '休';
                        diceEl.style.color = '#ef4444';
                        diceEl.style.background = '#fee2e2';
                        if (diceHintEl && gameState.playMode !== 'online') {
                            diceHintEl.textContent = 'タップしてターン終了';
                        }
                    } else {
                        if (diceEl.textContent === '休') {
                            diceEl.textContent = '1';
                        }
                        diceEl.style.color = '';
                        diceEl.style.background = '';
                        if (diceHintEl && gameState.playMode !== 'online') {
                            diceHintEl.textContent = 'タップしてサイコロを振る';
                        }
                    }
                }
            }
        }

        function renderPlayerListPanel() {
            const panel = document.getElementById('playerListPanel');
            panel.innerHTML = gameState.players.map((p, i) => {
                const isCurrent = i === gameState.currentPlayerIndex;
                const itemChips = p.items.map(itemId => {
                    return `<span class="player-list-item-chip">${itemLabel(itemId)}</span>`;
                }).join('');

                return `
                    <div class="player-list-row${isCurrent ? ' current-turn' : ''}">
                        <div class="player-list-dot p${i + 1}"></div>
                        <div class="player-list-info">
                            <div class="player-list-name">
                                ${escapeHtml(p.name)}
                                ${isCurrent ? '<span class="player-list-badge" style="background:#667eea;">ターン中</span>' : ''}
                                ${p.skipTurns > 0 ? `<span class="player-list-badge" style="background:#ef4444;">休み×${p.skipTurns}</span>` : ''}
                            </div>
                            <div class="player-list-pos">${p.position + 1} / ${gameState.board.length} マス目</div>
                            ${p.items.length > 0 ? `<div class="player-list-items">${itemChips}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function togglePlayerList() {
            const panel = document.getElementById('playerListPanel');
            const overlay = document.getElementById('playerListOverlay');
            if (!panel || !overlay || gameState.playMode === 'single' || gameState.mode !== 'play') return;

            const isOpen = panel.classList.contains('open');
            panel.classList.toggle('open', !isOpen);
            overlay.classList.toggle('hidden', isOpen);
        }
        
        function exitGame() {
            if (!confirm('ゲームを終了しますか？')) return;
            const prevMode = gameState.playMode;
            // オンラインモード: リスナー解除 + ホストは参加者に通知
            if (prevMode === 'online' && gameState.firebaseRefs.roomRef) {
                if (gameState.isHost) {
                    gameState.firebaseRefs.roomRef.child('status').set('abandoned');
                }
                gameState.firebaseRefs.roomRef.child('gameSnapshot').off();
                gameState.firebaseRefs.roomRef.child('winner').off();
                gameState.firebaseRefs.roomRef.child('status').off();
                if (gameState.firebaseRefs.playerRef) gameState.firebaseRefs.playerRef.remove();
            }
            gameState.playMode = null;
            gameState.roomId = null;
            gameState.isHost = false;
            gameState.firebaseRefs = {};
            if (prevMode === 'single') {
                switchMode('editor');
            } else if (prevMode === 'local') {
                switchMode('localMultiSetup');
            } else {
                switchMode('onlineMultiSelect');
            }
        }
        
        // ========== モーダル ==========
        function buildResultText(announcedName) {
            const ranked = gameState.players.slice().sort((a, b) => b.position - a.position);
            const announcedIdx = ranked.findIndex(p => p.name === announcedName);
            if (announcedIdx !== -1) {
                const winner = ranked.splice(announcedIdx, 1)[0];
                ranked.unshift(winner);
            }
            return ranked.map((p, i) => {
                const stars = p.items.filter(id => id === 'star').length;
                const starStr = stars > 0 ? ` ⭐×${stars}` : '';
                const pos = i === 0 ? 'ゴール！' : `${p.position + 1}マス目`;
                return `${i + 1}位: ${escapeHtml(p.name)}（${pos}）${starStr}`;
            }).join('\n');
        }

        function restartOnlineGame() {
            if (gameState.playMode !== 'online' || !gameState.firebaseRefs.roomRef) return;
            gameState.players = gameState.players.map(p => ({
                ...p,
                position: 0,
                items: [],
                skipTurns: 0,
                babelTarget: null,
                immuneTurns: 0
            }));
            gameState.currentPlayerIndex = 0;
            gameState.winShown = false;
            gameState.nailTraps = {};
            gameState.bootsActive = false;
            gameState.binocularsActive = false;
            gameState.koshindoActive = false;
            gameState.sakasamaActive = false;
            renderBoard();
            updateStatus();

            const nextSnap = { players: gameState.players, currentPlayerIndex: gameState.currentPlayerIndex };
            gameState.firebaseRefs.roomRef.update({
                winner: null,
                status: 'started',
                gameSnapshot: JSON.stringify(nextSnap)
            });
            updateDiceInteractivity();
        }

        function showAverageRoulette(onComplete) {
            const players = gameState.players;

            // 順位計算（positionが高い＝上位）
            const sortedByPos = [...players].sort((a, b) => b.position - a.position);
            // 重み：順位が低い（下位）ほど高い
            const weights = players.map(player => {
                const rank = sortedByPos.indexOf(player) + 1; // 1=1位, N=最下位
                return players.length - rank + 1;
            });

            // 加重ランダム選択
            const totalWeight = weights.reduce((s, w) => s + w, 0);
            let rand = Math.random() * totalWeight;
            let selectedIndex = players.length - 1;
            for (let i = 0; i < weights.length; i++) {
                rand -= weights[i];
                if (rand <= 0) { selectedIndex = i; break; }
            }

            // モーダルにルーレットUIを表示
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">⚖️ 平均の力が働いた！</div>
                <div class="modal-text" style="margin-bottom:12px;">選ばれし者のマスに全員移動...</div>
                <div class="roulette-container" id="rouletteItems">
                    ${players.map((p, i) => `<div class="roulette-item" id="rouletteItem_${i}">${escapeHtml(p.name)}</div>`).join('')}
                </div>
                <div id="rouletteResult" style="margin-top:16px;font-size:18px;font-weight:bold;min-height:28px;color:#d97706;"></div>
            `;
            modal.classList.add('show');

            // スピンフレームを構築（最終的に selectedIndex で終わる）
            const frames = [];
            const minSteps = Math.max(20, 3 * players.length);
            for (let i = 0; i < minSteps; i++) {
                frames.push(i % players.length);
            }
            // selectedIndex に着地するまで追加
            let last = frames[frames.length - 1];
            while (last !== selectedIndex) {
                last = (last + 1) % players.length;
                frames.push(last);
            }

            const highlightItem = (idx) => {
                for (let i = 0; i < players.length; i++) {
                    const el = document.getElementById(`rouletteItem_${i}`);
                    if (el) el.className = 'roulette-item' + (i === idx ? ' roulette-active' : '');
                }
            };

            let frameIdx = 0;
            const animate = () => {
                if (frameIdx >= frames.length) {
                    // 着地
                    const el = document.getElementById(`rouletteItem_${selectedIndex}`);
                    if (el) el.className = 'roulette-item roulette-winner';
                    const resultDiv = document.getElementById('rouletteResult');
                    if (resultDiv) resultDiv.textContent = `${players[selectedIndex].name} に決定！`;
                    setTimeout(() => onComplete(selectedIndex), 1600);
                    return;
                }
                highlightItem(frames[frameIdx]);
                const progress = frameIdx / frames.length;
                const delay = progress < 0.6 ? 80 : 80 + Math.pow((progress - 0.6) / 0.4, 2) * 520;
                frameIdx++;
                setTimeout(animate, delay);
            };
            setTimeout(animate, 200);
        }

        // ========== 自分をアピールして！ ==========
        function showSelfAppealEvent() {
            const currentIdx = gameState.currentPlayerIndex;
            const currentPlayer = gameState.players[currentIdx];
            const otherIndices = gameState.players
                .map((_, i) => i)
                .filter(i => i !== currentIdx);

            if (otherIndices.length === 0) {
                showModal('info', '他のプレイヤーがいないため、何も起きなかった。', () => nextTurn());
                return;
            }

            window.selfAppealCurrentPlayer = currentIdx;
            window.selfAppealVoters = otherIndices;

            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            let timeLeft = 30;

            content.innerHTML = `
                <div class="modal-title">📣 自分をアピールして！</div>
                <div class="modal-text">
                    <strong>${escapeHtml(currentPlayer.name)}</strong> さんのアピールタイム！
                </div>
                <div style="font-size:36px;font-weight:bold;color:#667eea;margin:12px 0;">
                    残り <span id="selfAppealTimer">30</span> 秒
                </div>
            `;
            modal.classList.add('show');

            window.selfAppealTimerId = setInterval(() => {
                timeLeft--;
                const timerEl = document.getElementById('selfAppealTimer');
                if (timerEl) timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(window.selfAppealTimerId);
                    window.selfAppealTimerId = null;
                    startSelfAppealVoting(0, []);
                }
            }, 1000);
        }

        // ========== 好きなだけ進んでいいよ ==========
        function showFreeMoveDialog() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const player = gameState.players[gameState.currentPlayerIndex];

            content.innerHTML = `
                <div class="modal-title">🚶 好きなだけ進んでいいよ</div>
                <div class="modal-text"><strong>${escapeHtml(player.name)}</strong> さん、何マス進みますか？</div>
                <div style="margin:16px 0;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <input type="number" id="freeMoveInput" min="1" max="99" value="1"
                        style="font-size:28px;width:90px;padding:8px;text-align:center;border:2px solid #667eea;border-radius:8px;">
                    <span style="font-size:20px;">マス</span>
                </div>
                <button class="btn btn-primary" data-action="freeMoveSubmit">進む！</button>
            `;
            modal.classList.add('show');
        }

        function freeMoveSubmit() {
            const input = document.getElementById('freeMoveInput');
            const num = parseInt(input ? input.value : '0');
            if (isNaN(num) || num < 1) {
                alert('1以上の数値を入力してください');
                return;
            }
            const player = gameState.players[gameState.currentPlayerIndex];
            let newPos = player.position + num;
            const modal = document.getElementById('modal');
            const maxPos = gameState.board.length - 1;
            if (newPos >= maxPos) {
                // 強欲処理: 名前に(強欲)を付けてスタートへ
                player.name = player.name + '(強欲)';
                player.position = 0;
                renderBoard();
                updateStatus();
                modal.classList.remove('show');
                showModal('info',
                    `ゴールに到達！しかし欲張りすぎた！\n「${escapeHtml(player.name)}」としてスタートへ戻る！`,
                    () => nextTurn(),
                    '好きなだけ進んでいいよ'
                );
            } else {
                player.position = newPos;
                renderBoard();
                updateStatus();
                modal.classList.remove('show');
                showModal('info', `${num}マス進んだ！`, () => nextTurn(), '好きなだけ進んでいいよ');
            }
        }

        // ========== 今日のラッキーナンバーは？ ==========
        function showLuckyNumberDialog() {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            const player = gameState.players[gameState.currentPlayerIndex];

            content.innerHTML = `
                <div class="modal-title">🍀 今日のラッキーナンバーは？</div>
                <div class="modal-text"><strong>${escapeHtml(player.name)}</strong> さん、ラッキーナンバーを入力してください！</div>
                <div style="margin:16px 0;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <input type="number" id="luckyNumberInput" min="1" max="99" value="7"
                        style="font-size:28px;width:90px;padding:8px;text-align:center;border:2px solid #fbbf24;border-radius:8px;">
                </div>
                <button class="btn btn-primary" data-action="luckyNumberSubmit">決定！</button>
            `;
            modal.classList.add('show');
        }

        function luckyNumberSubmit() {
            const input = document.getElementById('luckyNumberInput');
            const num = parseInt(input ? input.value : '0');
            if (isNaN(num) || num < 1) {
                alert('1以上の数値を入力してください');
                return;
            }
            const player = gameState.players[gameState.currentPlayerIndex];
            const modal = document.getElementById('modal');
            modal.classList.remove('show');

            const roll = Math.floor(Math.random() * 4);
            if (roll === 0) {
                // 入力数値分 前進
                let newPos = player.position + num;
                if (newPos >= gameState.board.length) newPos = gameState.board.length - 1;
                player.position = newPos;
                renderBoard();
                updateStatus();
                showModal('info', `ラッキー！${num}マス前進した！`, () => nextTurn(), '今日のラッキーナンバーは？');
            } else if (roll === 1) {
                // 入力数値分 後退
                let newPos = player.position - num;
                if (newPos < 0) newPos = 0;
                player.position = newPos;
                renderBoard();
                updateStatus();
                showModal('info', `残念！${num}マス後退した...`, () => nextTurn(), '今日のラッキーナンバーは？');
            } else if (roll === 2) {
                // 自分以外が入力数値分後退
                gameState.players.forEach((p, i) => {
                    if (i !== gameState.currentPlayerIndex) {
                        p.position = Math.max(0, p.position - num);
                    }
                });
                renderBoard();
                updateStatus();
                showModal('info', `他の全員が${num}マス後退した！`, () => nextTurn(), '今日のラッキーナンバーは？');
            } else {
                // ふーん（何も起きない）
                showModal('info', 'ふーん', () => nextTurn(), '今日のラッキーナンバーは？');
            }
        }

        function startSelfAppealVoting(voterArrayIndex, votes) {
            const voterIndices = window.selfAppealVoters;

            if (voterArrayIndex >= voterIndices.length) {
                finishSelfAppealVoting(votes);
                return;
            }

            const voterIdx = voterIndices[voterArrayIndex];
            const voter = gameState.players[voterIdx];
            const currentPlayer = gameState.players[window.selfAppealCurrentPlayer];

            window.selfAppealVoterArrayIndex = voterArrayIndex;
            window.selfAppealCurrentVotes = votes;

            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">📋 採用審査</div>
                <div class="modal-text">
                    <strong>${escapeHtml(voter.name)}</strong> さん、<br>
                    ${escapeHtml(currentPlayer.name)} を採用しますか？
                </div>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
                    <button class="btn btn-primary" style="font-size:18px;padding:12px 24px;" data-action="selfAppealVoteYes">✅ 採用</button>
                    <button class="btn btn-secondary" style="font-size:18px;padding:12px 24px;" data-action="selfAppealVoteNo">❌ 不採用</button>
                </div>
            `;
            modal.classList.add('show');
        }

        function handleSelfAppealVote(isYes) {
            const newVotes = [...window.selfAppealCurrentVotes, isYes];
            startSelfAppealVoting(window.selfAppealVoterArrayIndex + 1, newVotes);
        }

        function finishSelfAppealVoting(votes) {
            const yesCount = votes.filter(v => v).length;
            const noCount = votes.filter(v => !v).length;
            const currentPlayer = gameState.players[window.selfAppealCurrentPlayer];

            // 既存の採用/不採用タグを除去
            currentPlayer.name = currentPlayer.name.replace(/\((採用|不採用)\)$/, '');

            let tag, resultText;
            if (yesCount > noCount) {
                tag = '(採用)';
                resultText = `採用${yesCount}票 vs 不採用${noCount}票\n${currentPlayer.name} は採用された！`;
            } else {
                tag = '(不採用)';
                resultText = `採用${yesCount}票 vs 不採用${noCount}票\n${currentPlayer.name} は不採用になった...`;
            }
            currentPlayer.name += tag;

            renderBoard();
            updateStatus();
            showModal('info', resultText, () => nextTurn(), '審査結果');
        }

        // ========== 怒らせたら10進む ==========
        function showAngryRoulette() {
            const currentIdx = gameState.currentPlayerIndex;
            const otherEntries = gameState.players
                .map((p, i) => ({ player: p, index: i }))
                .filter(({ index }) => index !== currentIdx);

            if (otherEntries.length === 0) {
                showModal('info', '他のプレイヤーがいないため、何も起きなかった。', () => nextTurn());
                return;
            }

            const finalEntry = otherEntries[Math.floor(Math.random() * otherEntries.length)];
            const selectedIndex = finalEntry.index;

            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">😡 怒らせたら10進む！</div>
                <div class="modal-text" style="margin-bottom:12px;">誰が選ばれる...？</div>
                <div class="roulette-container" id="angryRouletteItems">
                    ${otherEntries.map(({ player, index }) => `<div class="roulette-item" id="angryItem_${index}">${escapeHtml(player.name)}</div>`).join('')}
                </div>
                <div id="angryRouletteResult" style="margin-top:16px;font-size:18px;font-weight:bold;min-height:28px;color:#d97706;"></div>
            `;
            modal.classList.add('show');

            const finalIdx = otherEntries.findIndex(e => e.index === selectedIndex);
            const frames = [];
            const minSteps = Math.max(20, 3 * otherEntries.length);
            for (let i = 0; i < minSteps; i++) { frames.push(i % otherEntries.length); }
            let last = frames[frames.length - 1];
            while (last !== finalIdx) {
                last = (last + 1) % otherEntries.length;
                frames.push(last);
            }

            const highlightItem = (idx) => {
                otherEntries.forEach((e, i) => {
                    const el = document.getElementById(`angryItem_${e.index}`);
                    if (el) el.className = 'roulette-item' + (i === idx ? ' roulette-active' : '');
                });
            };

            let frameIdx = 0;
            const animate = () => {
                if (frameIdx >= frames.length) {
                    const el = document.getElementById(`angryItem_${selectedIndex}`);
                    if (el) el.className = 'roulette-item roulette-winner';
                    const resultDiv = document.getElementById('angryRouletteResult');
                    if (resultDiv) resultDiv.textContent = `${gameState.players[selectedIndex].name} に決定！`;
                    setTimeout(() => showAngryDialog(selectedIndex), 1600);
                    return;
                }
                highlightItem(frames[frameIdx]);
                const progress = frameIdx / frames.length;
                const delay = progress < 0.6 ? 80 : 80 + Math.pow((progress - 0.6) / 0.4, 2) * 520;
                frameIdx++;
                setTimeout(animate, delay);
            };
            setTimeout(animate, 200);
        }

        function showAngryDialog(selectedPlayerIndex) {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            const selectedPlayer = gameState.players[selectedPlayerIndex];
            window.angrySelectedPlayerIndex = selectedPlayerIndex;

            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            let timeLeft = 30;

            content.innerHTML = `
                <div class="modal-title">😡 あなたが選ばれました！</div>
                <div class="modal-text">
                    <strong>${escapeHtml(selectedPlayer.name)}</strong> さん！<br>
                    ${escapeHtml(currentPlayer.name)} があなたを怒らせようとしている！
                </div>
                <div style="font-size:36px;font-weight:bold;color:#ef4444;margin:12px 0;">
                    残り <span id="angryTimer">30</span> 秒
                </div>
                <div class="modal-text">怒りましたか？</div>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
                    <button class="btn btn-danger" style="font-size:18px;padding:12px 24px;" data-action="angryYes">😡 怒った！</button>
                    <button class="btn btn-secondary" style="font-size:18px;padding:12px 24px;" data-action="angryNo">😌 怒ってない</button>
                </div>
            `;
            modal.classList.add('show');

            window.angryTimerId = setInterval(() => {
                timeLeft--;
                const timerEl = document.getElementById('angryTimer');
                if (timerEl) timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(window.angryTimerId);
                    window.angryTimerId = null;
                    handleAngryNo();
                }
            }, 1000);
        }

        function handleAngryYes() {
            if (window.angryTimerId) {
                clearInterval(window.angryTimerId);
                window.angryTimerId = null;
            }
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.position = Math.min(gameState.board.length - 1, currentPlayer.position + 10);
            renderBoard();
            updateStatus();
            document.getElementById('modal').classList.remove('show');
            showModal('info', `${currentPlayer.name} は10マス進んだ！`, () => nextTurn(), '怒らせた！');
        }

        function handleAngryNo() {
            if (window.angryTimerId) {
                clearInterval(window.angryTimerId);
                window.angryTimerId = null;
            }
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            content.innerHTML = `
                <div class="modal-title">😌 怒ってない！</div>
                <div class="modal-text"><strong>${escapeHtml(currentPlayer.name)}</strong> さん、何マス戻りますか？（1〜10）</div>
                <input type="number" id="angryBackInput" min="1" max="10" value="3"
                    style="width:80px;font-size:24px;text-align:center;padding:8px;border:2px solid #d1d5db;border-radius:8px;margin:12px 0;">
                <div>
                    <button class="btn btn-primary" style="margin-top:8px;" data-action="angryNoConfirm">決定</button>
                </div>
            `;
            modal.classList.add('show');
        }

        function handleAngryNoConfirm() {
            const input = document.getElementById('angryBackInput');
            const steps = parseInt(input ? input.value : '3');
            if (isNaN(steps) || steps < 1 || steps > 10) {
                alert('1から10の数値を入力してください');
                return;
            }
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.position = Math.max(0, currentPlayer.position - steps);
            renderBoard();
            updateStatus();
            document.getElementById('modal').classList.remove('show');
            showModal('info', `${currentPlayer.name} は${steps}マス戻った...`, () => nextTurn(), '怒らなかった！');
        }

        function showModal(type, text, callback, titleOverride) {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');

            if (type === 'win') {
                const babelNote = typeof callback === 'string' ? callback : '';
                const onlineButtons = (gameState.playMode === 'online' && gameState.isHost) ? `
                    <button class="btn btn-secondary" style="margin-bottom:8px;" data-action="closeModalThenRestartOnline">再プレイ</button>
                    <button class="btn btn-secondary" style="margin-bottom:8px;" data-action="closeModalThenSwitchEditor">ステージ編集</button>
                ` : '';
                content.innerHTML = `
                    <div class="modal-title">🎉 ゲーム終了！</div>
                    <div class="modal-text" style="white-space:pre-line;">${escapeHtml(text)}</div>
                    ${babelNote ? `<div class="modal-text" style="white-space:pre-line;">${escapeHtml(babelNote)}</div>` : ''}
                    ${onlineButtons}
                    <button class="btn btn-primary" data-action="closeModalThenSwitchPlayMode">終了</button>
                `;
            } else if (type === 'vanished') {
                content.innerHTML = `
                    <div class="modal-title">🌀 消失...</div>
                    <div class="modal-text">${escapeHtml(text)}</div>
                    <button class="btn btn-secondary" data-action="closeModalThenSwitchPlayMode">タイトルへ戻る</button>
                `;
            } else {
                const modalTitle = titleOverride ? escapeHtml(titleOverride) : (type === 'info' ? 'お知らせ' : 'イベント発生！');
                content.innerHTML = `
                    <div class="modal-title">${modalTitle}</div>
                    ${text ? `<div class="modal-text">${escapeHtml(text)}</div>` : ''}
                    <button class="btn btn-primary" data-action="handleModalOk">OK</button>
                `;
                
                if (callback) {
                    window.modalCallback = callback;
                }
            }
            
            modal.classList.add('show');
        }
        
        function handleModalOk() {
            const cb = window.modalCallback;
            closeModal();
            if (cb) cb();
        }

        function closeModal() {
            document.getElementById('modal').classList.remove('show');
            window.modalCallback = null;
        }
        
        // ========== 起動 ==========

// ========== イベント委譲ディスパッチャー ==========
function closeModalThenRollDice() { closeModal(); doRollDice(); }
function closeModalThenNextTurn() { closeModal(); nextTurn(); }
function closeModalThenSwitchEditor() { closeModal(); switchMode('editor'); }
function closeModalThenSwitchPlayMode() { closeModal(); switchMode('playMode'); }
function closeModalThenRestartOnline() { closeModal(); restartOnlineGame(); }
function closeModalThenNailCallback() { closeModal(); window.nailCallback(); }

const ACTION_HANDLERS = {
    switchMode: (el) => switchMode(el.dataset.arg),
    saveFirebaseConfig: () => saveFirebaseConfig(),
    toggleFirebaseConfig: () => {
        const body = document.querySelector('.firebase-config-body');
        const icon = document.getElementById('firebaseToggleIcon');
        if (body) {
            body.classList.toggle('hidden');
            if (icon) icon.textContent = body.classList.contains('hidden') ? '▼' : '▲';
        }
    },
    showSecurityRules: () => showSecurityRules(),
    clearFirebaseConfig: () => clearFirebaseConfig(),
    generateRandomStage: () => generateRandomStage(),
    saveStage: () => saveStage(),
    loadStage: () => loadStage(),
    resetBoard: () => resetBoard(),
    confirmEventSelection: () => confirmEventSelection(),
    cancelEventSelection: () => cancelEventSelection(),
    startSinglePlay: () => startSinglePlay(),
    startLocalMulti: () => startLocalMulti(),
    createOnlineRoom: () => createOnlineRoom(),
    joinOnlineRoom: () => joinOnlineRoom(),
    startOnlineGame: () => startOnlineGame(),
    leaveRoom: () => leaveRoom(),
    togglePlayerList: () => togglePlayerList(),
    rollDice: () => rollDice(),
    exitGame: () => exitGame(),
    closeModal: () => closeModal(),
    handleModalOk: () => handleModalOk(),
    useNailHammerCombo: () => useNailHammerCombo(),
    merchantOfferTrade: () => merchantOfferTrade(),
    merchantShowOptions3: () => merchantShowOptions3(),
    closeModalThenRollDice: () => closeModalThenRollDice(),
    closeModalThenNextTurn: () => closeModalThenNextTurn(),
    closeModalThenSwitchEditor: () => closeModalThenSwitchEditor(),
    closeModalThenSwitchPlayMode: () => closeModalThenSwitchPlayMode(),
    closeModalThenRestartOnline: () => closeModalThenRestartOnline(),
    closeModalThenNailCallback: () => closeModalThenNailCallback(),
    closeModalThenChooseDice: (el) => { closeModal(); chooseDiceResult(Number(el.dataset.result)); },
    saveStageToSlot: (el) => saveStageToSlot(Number(el.dataset.slot)),
    loadStageFromSlot: (el) => loadStageFromSlot(Number(el.dataset.slot)),
    useItem: (el) => useItem(Number(el.dataset.idx)),
    chooseDiceResult: (el) => chooseDiceResult(Number(el.dataset.result)),
    promptSakasamaTarget: (el) => promptSakasamaTarget(Number(el.dataset.result), Number(el.dataset.sakasamaIndex)),
    closeModalThenMovePlayer: (el) => { closeModal(); movePlayer(Number(el.dataset.steps)); },
    useSakasama: (el) => useSakasama(Number(el.dataset.result), Number(el.dataset.itemIndex), Number(el.dataset.targetIndex)),
    useKoshindo: (el) => useKoshindo(Number(el.dataset.idx)),
    useShield: (el) => useShield(Number(el.dataset.idx)),
    shieldSkipAndMove: (el) => shieldSkipAndMove(Number(el.dataset.value)),
    closeModalThenExecuteTile: (el) => { closeModal(); executeTileEffect(gameState.board[Number(el.dataset.pos)]); },
    setBabelTarget: (el) => setBabelTarget(Number(el.dataset.idx)),
    snatcherSelectPlayer: (el) => snatcherSelectPlayer(Number(el.dataset.idx)),
    snatcherStealItem: (el) => snatcherStealItem(Number(el.dataset.target), Number(el.dataset.idx)),
    snatcherKatashiroUse: () => snatcherKatashiroUse(),
    snatcherKatashiroSkip: () => snatcherKatashiroSkip(),
    snatcherKatashiroSelectPlayer: (el) => snatcherKatashiroSelectPlayer(Number(el.dataset.idx)),
    snatcherKatashiroStealItem: (el) => snatcherKatashiroStealItem(Number(el.dataset.target), Number(el.dataset.idx)),
    useHammerOn: (el) => useHammerOn(Number(el.dataset.idx)),
    katashiroUse: () => katashiroUse(),
    katashiroSkip: () => katashiroSkip(),
    katashiroRedirectTarget: (el) => katashiroRedirectTarget(Number(el.dataset.idx)),
    destroyDollOf: (el) => destroyDollOf(Number(el.dataset.idx)),
    confirmNailPlacement: (el) => confirmNailPlacement(Number(el.dataset.nailIdx), Number(el.dataset.pos)),
    merchantPickItem: (el) => merchantPickItem(el.dataset.itemId),
    merchantTradeGiveItem: (el) => merchantTradeGiveItem(Number(el.dataset.idx)),
    merchantSelectItem: (el) => merchantSelectItem(el.dataset.itemId),
    angryYes: () => handleAngryYes(),
    angryNo: () => handleAngryNo(),
    angryNoConfirm: () => handleAngryNoConfirm(),
    selfAppealVoteYes: () => handleSelfAppealVote(true),
    selfAppealVoteNo: () => handleSelfAppealVote(false),
    freeMoveSubmit: () => freeMoveSubmit(),
    luckyNumberSubmit: () => luckyNumberSubmit(),
};

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (ACTION_HANDLERS[action]) ACTION_HANDLERS[action](btn);
});

        init();
    
