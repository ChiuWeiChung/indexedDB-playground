---
title: "IndexedDB 筆記：簡單實作紀錄"
description: "紀錄在專案中使用 IndexedDB 的基礎實作與心得"
createdAt: "2025-04-03"
---

# IndexedDB 筆記：簡單實作紀錄

最近在工作上碰到一些需要 **離線存取**、**網頁應用** 或 **資料備份** 的需求，剛好讓我有機會深入玩玩 IndexedDB。  
它是瀏覽器內建的 API，專門用來在本機儲存大量結構化資料，支援索引查詢、交易管理等進階功能。雖然名字聽起來有點嚴肅，但實際使用後會發現它不僅靈活，而且能處理相當複雜的資料需求。  

在過去，我可能會選擇用 `localStorage` 或 `sessionStorage` 來快速解決問題，但這些方案在儲存空間大小、資料型別支援、查詢效率上都有一定的限制。IndexedDB 則更像是一個迷你資料庫，讓我們在前端就能擁有接近後端資料庫的操作體驗。  

這份筆記主要是基於專案中 `app/example-transaction_request/page.tsx` 的實作整理而成，記錄了從初始化資料庫、建立索引，到交易與請求的處理方式。希望未來在面對類似需求時，能快速翻回來查閱，少踩一些坑，也讓開發過程更順暢。  

> NOTE： 這篇只是簡單的實作紀錄，不是完整的 IndexedDB 深入教學，主要方便自己之後快速回顧。


## 1. 建立資料庫與版本控制

每個 IndexedDB 資料庫都有自己的名稱和版本號。**版本號**的用途是在資料庫結構（如 objectStore 或索引）需要變更時觸發 `upgradeneeded` 事件，讓我們可以安全地修改資料庫結構。如果版本號比現有資料庫的版本高，就會進入升級流程；如果相同，就直接開啟資料庫。

```javascript
// 開啟名為 'pwa-demo' 的資料庫，版本為 3（版本號用來觸發結構升級）
const DBOpenReq = indexedDB.open('pwa-demo', 3);

// 成功開啟
DBOpenReq.addEventListener('success', (event) => {
  const db = (event.target as IDBRequest).result as IDBDatabase;
  console.log('DB 開啟成功', db);
  dbRef.current = db; // 記下來方便之後用
});

// 開啟失敗
DBOpenReq.addEventListener('error', (event) => {
  console.warn('DB 開啟失敗', event);
});

// 版本更新（或第一次建立資料庫）
DBOpenReq.addEventListener('upgradeneeded', (event) => {
  const db = (event.target as IDBRequest).result as IDBDatabase;
  console.log(`版本從 ${event.oldVersion} 升級到 ${event.newVersion || db.version}`);

  if (db.objectStoreNames.contains('user')) {
    db.deleteObjectStore('user');
  }

  const objectStore = db.createObjectStore('user', { keyPath: 'id' });
  objectStore.createIndex('ageIDX', 'age');
  objectStore.createIndex('nameIDX', 'name');
  objectStore.createIndex('emailIDX', 'email');
  objectStore.createIndex('lastEditIDX', 'lastEdit');
});
```

💡 **小提醒**：版本更新是唯一可以修改資料庫結構（新增/刪除 objectStore 或索引）的時機。

---

## 2. 交易（Transactions）與請求（Requests）

IndexedDB 的操作都必須包在「交易」裡，交易可以是：

* **readonly**（唯讀）
* **readwrite**（可讀可寫）

交易指的是在一個邏輯操作範圍內，對資料庫進行 新增 / 刪除 / 修改 / 查詢 等操作。會使用到的 methods（如 add、put、delete、get、getAll）概念上與 SQL 的 transactions 很相似：都是為了確保資料操作的完整性與一致性。不同之處在於，IndexedDB 的交易會自動在完成或發生錯誤時結束，並且在交易作用範圍外不能再使用同一個 objectStore 進行操作。

```javascript
const createTransaction = (storeName: string, mode: 'readonly' | 'readwrite') => {
  if (!dbRef.current) return;
  const db = dbRef.current;

  if (!db.objectStoreNames.contains(storeName)) return null;

  const tx = db.transaction(storeName, mode);
  tx.onerror = () => console.warn('交易發生錯誤');

  return tx;
};
```

流程：

1. 建立交易
2. 取得 objectStore
3. 執行操作（會回傳 request 物件）
4. 綁定 `onsuccess` / `onerror`

---

## 3. 資料讀取：`get` 與 `getAll`

### `get` — 拿單筆資料

```javascript
const handleSelectUser = (userId: string) => {
  const tx = createTransaction('user', 'readwrite');
  if (!tx) return;
  const userStore = tx.objectStore('user');
  const request = userStore.get(userId);

  request.onsuccess = () => {
    const data = request.result;
    setUserState({ ...data, lastEdit: Date.now() });
    setSelectedUserId(userId);
  };
};
```

### `getAll` — 全部抓回來

```javascript
const request = userStore.getAll();
request.onsuccess = (event) => {
  if ((event.target as IDBRequest).result.length === 0) {
    console.log('資料庫是空的，來加一些初始資料吧');
  }
};
```

---

## 4. 新增、更新、刪除

### 新增 — `add`

```javascript
const handleAdd = () => {
  const tx = createTransaction('user', 'readwrite');
  if (!tx) return;

  tx.oncomplete = refreshList;

  const user = { id: uuidv4(), ...userState };
  tx.objectStore('user').add(user).onsuccess = () => {
    console.log('新增成功');
  };
};
```

### 更新 — `put`

```javascript
const handleUpdate = () => {
  if (!selectedUserId) return;
  const tx = createTransaction('user', 'readwrite');
  if (!tx) return;

  tx.oncomplete = refreshList;
  tx.objectStore('user')
    .put({ id: selectedUserId, ...userState, lastEdit: Date.now() })
    .onsuccess = () => console.log('更新成功');
};
```

### 刪除 — `delete`

```javascript
const handleDelete = (id: string) => {
  const tx = createTransaction('user', 'readwrite');
  if (!tx) return;

  tx.oncomplete = refreshList;
  tx.objectStore('user').delete(id).onsuccess = () => {
    console.log('刪除成功');
  };
};
```

---

## 5. 索引（Index）

索引就像是資料庫的目錄，讓我們可以用非主鍵的欄位來查資料。

```javascript
objectStore.createIndex('ageIDX', 'age', { unique: false });
objectStore.createIndex('nameIDX', 'name', { unique: false });
objectStore.createIndex('emailIDX', 'email', { unique: true });
objectStore.createIndex('lastEditIDX', 'lastEdit', { unique: false });
```

索引三要素：

1. 索引名稱（`ageIDX`）
2. 對應的屬性（`age`）
3. 設定（是否 unique）

---

## 6. 索引 + 鍵範圍（KeyRange）

鍵範圍讓我們可以做條件查詢。

```javascript
const range = IDBKeyRange.bound(20, 30);
const idx = userStore.index('ageIDX');
const request = idx.getAll(range);
```

常用方法：

* `bound(lower, upper)`
* `lowerBound(value)`
* `upperBound(value)`
* `only(value)`

---

## 7. 分頁功能（原游標 Cursor）

分頁功能就像翻書，一頁頁讀資料，很適合大量資料的情境。

```javascript
const idx = userStore.index('nameIDX');
const range = IDBKeyRange.bound('J', 'M');
idx.openCursor(range, 'prev').onsuccess = (event) => {
  const cursor = (event.target as IDBRequest).result;
  if (cursor) {
    console.log(cursor.key, cursor.value);
    cursor.continue();
  } else {
    console.log('分頁結束');
  }
};
```

分頁優勢：

* 記憶體友好
* 可排序 + 篩選
* 動態操作（可更新、刪除）
* 可隨時停止

---

## 8. IndexedDB 的「不保證永遠在」

雖然它能放很多資料，但不是永久儲存：

* 使用者清除瀏覽資料
* 磁碟空間不足
* 隱私模式下關閉就沒了
* 長時間沒訪問，瀏覽器自動清除

**最佳實踐**：

1. **資料備份機制**：定期將重要資料同步到伺服器。
2. **優雅的錯誤處理**：當開啟 IndexedDB 失敗時，要有適當的錯誤處理邏輯。
3. **資料恢復方案**：檢測到資料庫為空時（可能被清除），能夠從伺服器或其他來源重新載入資料。
4. **儲存配額管理**：監控儲存用量，接近限制時通知使用者或清理不必要的資料。

```javascript
// 檢查資料庫是否為空，如果為空則重新載入初始資料
const request = userStore.getAll();
request.onsuccess = (event) => {
  const target = event.target as IDBRequest;
  if(target.result.length === 0){
    console.log('資料庫可能已被清除，正在重新載入初始資料...');
    loadInitialData(); // 從伺服器或本地載入初始資料
  }
};
```