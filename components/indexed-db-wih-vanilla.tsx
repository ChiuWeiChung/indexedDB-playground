'use client';
import React, { useEffect } from 'react';

const IndexedDBWithVanilla = () => {
  //   const initDB = async () => {
  //     const DBOpenRequest = indexedDB.open('pwa-demo', 1);
  //     // initDB();
  // };

  useEffect(() => {
    const DBOpenReq = indexedDB.open('pwa-demo', 7);
    DBOpenReq.addEventListener('success', (event: Event) => {
      // 如果打開資料庫成功，則會觸發此事件
      const target = event.target as IDBRequest;
      console.log('DBOpenReq success', target.result);
    });
    DBOpenReq.addEventListener('error', (event) => {
      // 如果打開資料庫失敗，則會觸發此事件
      console.log('DBOpenReq error', event);
    });
    DBOpenReq.addEventListener('upgradeneeded', (event) => {
      // 如果打開資料庫的版本號與現在的版本號不同，則會觸發此事件 or 第一次打開資料庫時也會觸發此事件
      // NOTE: create & delete 只能在 upgradeneeded 事件中觸發
      console.log('DBOpenReq upgradeneeded', event);
      const target = event.target as IDBRequest;
      const db = target.result as IDBDatabase;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion || db.version;
      console.log(`DB updated from ${oldVersion} to ${newVersion}`);
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' }); // keyPath 是唯一索引
      }

      //   db.createObjectStore('should-be-deleted');

      if (db.objectStoreNames.contains('should-be-deleted')) {
        db.deleteObjectStore('should-be-deleted');
      }
    });
    // DBOpenReq.addEventListener('blocked', (event) => {
    //   console.log('DBOpenReq', event);
    // });
  }, []);

  return <div className="text-center">IndexedDBWithVanilla</div>;
};

export default IndexedDBWithVanilla;
