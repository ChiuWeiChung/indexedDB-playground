import React from 'react';
import { UserState } from './types';
import { Button } from '../ui/button';

interface UserFormProps {
  userState: UserState;
  setUserState: (userState: UserState) => void;
  selectedUserId: string | null;
  setSelectedUserId: (selectedUserId: string | null) => void;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAdd: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleUpdate: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabledAdd: boolean;
}

export const defaultUserState: UserState = {
  name: '',
  age: '',
  email: '',
  isActive: false,
};

const UserForm = ({ userState, setUserState, selectedUserId, setSelectedUserId, onChangeHandler, handleAdd, handleUpdate, disabledAdd }: UserFormProps) => {
  return (
    <div>
      <h1 className="text-2xl m-4 font-bold text-left">User form</h1>
      <form className="flex flex-col gap-2 px-4 w-1/3">
        <section className="flex flex-col gap-2">
          <label htmlFor="name">Name</label>
          <input className="border-2 border-gray-300 rounded-md p-2" type="text" id="name" name="name" value={userState.name} onChange={onChangeHandler} />
        </section>

        <section className="flex flex-col gap-2">
          <label htmlFor="age">Age</label>
          <input className="border-2 border-gray-300 rounded-md p-2" type="number" id="age" name="age" value={userState.age} onChange={onChangeHandler} />
        </section>

        <section className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input className="border-2 border-gray-300 rounded-md p-2" type="email" id="email" name="email" value={userState.email} onChange={onChangeHandler} />
        </section>

        <section className="flex gap-2 ">
          {/* checked to record if the user is active */}
          <label htmlFor="isActive">Is Active</label>
          <input className="border-2 border-gray-300 rounded-md p-2" type="checkbox" id="isActive" name="isActive" checked={userState.isActive} onChange={onChangeHandler} />
        </section>

        <div className="flex justify-end gap-2">
          {selectedUserId ? (
            <>
              <Button
                // className="bg-gray-500 text-white p-2 rounded-md"
                variant="outline"
                type="button"
                onClick={() => {
                  setSelectedUserId(null);
                  setUserState(defaultUserState);
                }}
              >
                Cancel
              </Button>

              <Button variant="secondary" type="button" onClick={handleUpdate}>
                Update
              </Button>
            </>
          ) : (
            <Button variant="default" color="primary" type="button" onClick={handleAdd} disabled={disabledAdd}>
              Add User
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
