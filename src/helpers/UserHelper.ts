import uuidv1 from 'uuid/v1';

import {
  // eslint-disable-next-line no-unused-vars
  UserModel,
} from '../types/Types';

// eslint-disable-next-line import/prefer-default-export
export function createDefaultUser(): UserModel {
  const uid = uuidv1();
  return {
    _uiId: uid,
    firstname: '',
    name: '',
    email: '',
    password: '',
    imageFolder: '',
    imageFolderSizeInByte: 0,
    imageFolderSizeLimitInByte: 0,
    token: '',
  };
}
