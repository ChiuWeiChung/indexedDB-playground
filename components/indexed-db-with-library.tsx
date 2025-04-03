'use client';
import { useEffect } from 'react';
import { createStore, del, entries, get, keys, set, update, values } from 'idb-keyval';
// import React from 'react'

const IndexedDBComponent = () => {
  const initDB = async () => {
    //Note: set will override the old value
    await set('user_id', Date.now());

    const sampleObj = {
      id: 1,
      name: 'John',
      age: 20,
    };
    await set('sampleObj', sampleObj);

    const getSampleObjResult = await get('sampleObj');
    console.log('getSampleObjResult', getSampleObjResult);

    await update('user_id', (value) => {
      console.log('old value', value);
      return 'meow';
    });

    set('nope', 567);
    del('nope'); //Note: del will not throw an error if the key does not exist

    const idbKeys = await keys();
    console.log('idbKeys', idbKeys);
    const idbValues = await values();
    console.log('idbValues', idbValues);
    const idbEntries = await entries();
    console.log('idbEntries', idbEntries);

    // create a store
    const store = createStore('MyDB', 'myStore');
    set('something', 'haha', store);

    // create blob
    const arr = [{ name: 'Barry' }, { name: 'John' }, { name: 'Jane' }];
    const blob = new Blob([JSON.stringify(arr)], { type: 'application/json' });
    set('blob', blob, store);

    const blobResult = await get('blob', store);
    console.log('blobResult', blobResult);
    const text = await blobResult.text();
    console.log('text', text);
    const array = JSON.parse(text);
    console.log('array', array);
  };

  useEffect(() => {
    initDB();
  }, []);
  return null;
};

export default IndexedDBComponent;
