'use client';
import UserForm, { defaultUserState } from '@/components/user-form';
import { UserState, UserWithId } from '@/components/user-form/types';
import UserList from '@/components/user-list';
import { mockUsers } from '@/mockData';
import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TransactionAndRequest = () => {
  const [userState, setUserState] = useState<UserState>(defaultUserState);
  const [userList, setUserList] = useState<UserWithId[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const disabledAdd = !userState.name || !userState.age || !userState.email;
  const dbRef = useRef<IDBDatabase | null>(null);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if type is number, validate if it is a number
    if (e.target.type === 'number') {
      if (isNaN(parseInt(e.target.value))) return;
    }

    if (e.target.type === 'checkbox') {
      setUserState({ ...userState, [e.target.name]: e.target.checked });
      return;
    }
    const value = e.target.value.trim();
    setUserState({ ...userState, [e.target.name]: value });
  };

  const refreshList = () => {
    fetchList();
    setSelectedUserId(null);
    setUserState(defaultUserState);
  };

  const createTransaction = (storeName: string, mode: 'readonly' | 'readwrite') => {
    if (!dbRef.current) return;
    const db = dbRef.current;
    // check if the store exist or not 
    if(!db.objectStoreNames.contains(storeName)){
      return null;
    }
    const tx = db.transaction(storeName, mode);
    tx.onerror = () => {
      console.warn('tx.onerror');
    };
    return tx;
  };

  const fetchList = () => {
    const tx = createTransaction('user', 'readonly');
    if (tx) {
      const userStore = tx.objectStore('user');

      /** Version 1: 使用 getAll 取得全部資料 */
      const request = userStore.getAll();

      /** Version 2: 使用 range 取得特定範圍的資料 */
      // const range = IDBKeyRange.bound('20', '30', false, false); // 30 - 40 (include 30 and 40)
      // const idx = userStore.index('ageIDX');
      // const request = idx.getAll(range);

      request.onsuccess = (event) => {
        const target = event.target as IDBRequest; // Note request = event.target
        setUserList(target.result as UserWithId[]);
      };
      request.onerror = (event) => {
        console.warn('request.onerror', event);
      };

      /** Version 3: 使用 index 取得特定屬性的資料 */
      // const idx = userStore.index('nameIDX');
      // const range = IDBKeyRange.bound('J', 'M', false, false); // case sensitive A-Z a-z
      // // direction 有 prev, next, nextunique, prevunique，預設為 next
      // idx.openCursor(range,'prev').onsuccess = (event) => {
      //   const target = event.target as IDBRequest; // Note request = event.target
      //   const cursor = target.result;
      //   if (cursor) {
      //     console.log('===========================');
      //     console.log(cursor.source.objectStore.name, cursor.source.name, cursor.direction, cursor.key, cursor.primaryKey);
      //     setUserList((prev) => {
      //       // prevent same id user
      //       if(prev.find((user) => user.id === cursor.value.id)){
      //         return prev;
      //       }
      //       return [...prev, cursor.value];
      //     });
      //     cursor.continue(); // call onsuccess again
      //   } else {
      //     console.log('cursor end');
      //   }
      // };
    }
  };
  
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const user = {
      id: uuidv4(),
      name: userState.name,
      age: userState.age,
      email: userState.email,
      isActive: userState.isActive,
    };

    // 創建一個交易，指定操作的對象存儲（object store）是 'user'
    // 設定交易的模式為 'readwrite'（可讀可寫）
    const tx = createTransaction('user', 'readwrite');
    if (tx) {
      tx.oncomplete = refreshList;
      // 創建一個 對象存儲（object store）是 'user' 的實例
      const userStore = tx.objectStore('user');
      // 添加用戶數據到對象存儲中
      const request = userStore.add(user);

      request.onsuccess = () => {
        console.log('request.onsuccess');
      };

      // 當請求發生錯誤時，執行以下操作
      request.onerror = () => {
        console.warn('request.onerror');
      };
    }
  };

  const handleUpdate = () => {
    if (selectedUserId) {
      const tx = createTransaction('user', 'readwrite');
      if (tx) {
        tx.oncomplete = refreshList;
        const userStore = tx.objectStore('user');
        const request = userStore.put({ id: selectedUserId, ...userState, lastEdit: Date.now() });
        request.onsuccess = () => {
          console.log('successfully updated');
        };
        request.onerror = () => {
          console.warn('failed to update');
        };
      }
    }
  };

  const handleDelete = (id: string) => {
    const tx = createTransaction('user', 'readwrite');
    if (tx) {
      tx.oncomplete = refreshList;
      const userStore = tx.objectStore('user');
      const request = userStore.delete(id);
      request.onsuccess = () => {
        console.log('successfully deleted');
      };
      request.onerror = () => {
        console.warn('failed to delete');
      };
    }
  };

  const handleSelectUser = (userId: string) => {
    const tx = createTransaction('user', 'readwrite');
    if (tx) {
      const userStore = tx.objectStore('user');
      const request = userStore.get(userId);
      request.onsuccess = () => {
        const { name, age, email, isActive } = request.result as UserState;
        setUserState({ name, age, email, isActive, lastEdit: Date.now() });
        setSelectedUserId(userId);
      };
    }
  };

  useEffect(() => {
    const DBOpenReq = indexedDB.open('pwa-demo', 3);

    DBOpenReq.addEventListener('success', (event: Event) => {
      // 如果打開資料庫成功，則會觸發此事件
      const target = event.target as IDBRequest;
      const db = target.result as IDBDatabase;
      console.log('DBOpenReq success', target.result);
      dbRef.current = db;
      //
      if(typeof mockUsers !== 'undefined'){
        const tx = createTransaction('user', 'readwrite');
        if(tx){
          tx.oncomplete = refreshList;
          const userStore = tx.objectStore('user');
          /** getAll 取得全部資料  */
          const request = userStore.getAll(); 
          
          request.onsuccess = (event) => {
            const target = event.target as IDBRequest;
            if(target.result.length === 0){
              console.log('request', request);
              mockUsers.forEach((user) => {
                const addRequest = userStore.add(user);
                addRequest.onsuccess = () => {
                  console.log('successfully added');
                };
                addRequest.onerror = () => {
                  // we can do addRequest.abort() if we need to stop the request
                  console.warn('failed to add');
                };
              });
            }
          };
        }
      }
    });

    DBOpenReq.addEventListener('error', (event) => {
      // 如果打開資料庫失敗，則會觸發此事件
      console.log('DBOpenReq error', event);
    });

    DBOpenReq.addEventListener('upgradeneeded', (event) => {
      // 如果打開資料庫的版本號與現在的版本號不同，則會觸發此事件 or 第一次打開資料庫時也會觸發此事件
      console.log('DBOpenReq upgradeneeded', event);
      const target = event.target as IDBRequest;
      const db = target.result as IDBDatabase;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion || db.version;
      console.log(`DB updated from ${oldVersion} to ${newVersion}`);

      if (db.objectStoreNames.contains('user')) {
        // 刪除對象存儲，因為 upgradeneeded 事件只會在數據庫版本升級時觸發，
        db.deleteObjectStore('user');
      }
      const objectStore = db.createObjectStore('user', { keyPath: 'id' }); // keyPath 是唯一索引
      objectStore.createIndex('ageIDX', 'age', { unique: false });
      objectStore.createIndex('nameIDX', 'name', { unique: false });
      objectStore.createIndex('emailIDX', 'email', { unique: false });
      objectStore.createIndex('lastEditIDX', 'lastEdit', { unique: false });
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* User form */}
        <UserForm
          userState={userState}
          setUserState={setUserState}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          onChangeHandler={onChangeHandler}
          handleAdd={handleAdd}
          handleUpdate={handleUpdate}
          disabledAdd={disabledAdd}
        />

      {/* Divider */}
      <div className="h-1 bg-gray-200 w-full"></div>

      {/* User List */}
      <UserList userList={userList} selectedUserId={selectedUserId} handleSelectUser={handleSelectUser} handleDelete={handleDelete} />
    </div>
  );
};

export default TransactionAndRequest;
