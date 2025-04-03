import React from 'react';
import { UserWithId } from '../user-form/types';
import { Button } from '../ui/button';

interface UserListProps {
  userList: UserWithId[];
  selectedUserId: string | null;
  handleSelectUser: (userId: string) => void;
  handleDelete: (userId: string) => void;
}

const UserList = ({ userList, selectedUserId, handleSelectUser, handleDelete }: UserListProps) => {
  return (
    <div>
      <h1 className="text-2xl ml-4 mt-4 font-bold text-left">User List</h1>

      <div className="flex flex-wrap gap-2 p-4">
        {userList.map((user) => (
          <div
            className={`cursor-pointer w-[300px] flex flex-col gap-2 p-4 mb-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 ${
              selectedUserId === user.id ? ' border-2 border-green-500' : ''
            }`}
            key={user.id}
            onClick={() => {
              handleSelectUser(user.id);
            }}
          >
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">{user.name}</h3>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 mb-2">
              <p className="text-gray-600 font-medium">Age:</p>
              <p className="text-gray-800">{user.age}</p>
              <p className="text-gray-600 font-medium">Email:</p>
              <p className="text-gray-800 break-all">{user.email}</p>
              <p className="text-gray-600 font-medium">Status:</p>
              <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>{user.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-gray-600 font-medium">Last Edit:</p>
              <p className="text-gray-800">{user.lastEdit ? new Date(user.lastEdit).toLocaleDateString() : 'Never'}</p>
            </div>
              <Button
                className="mt-auto"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(user.id);
                }}
              >
                Delete
              </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
