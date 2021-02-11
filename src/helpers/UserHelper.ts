import { v4 as uuidv4 } from 'uuid';

import {
  // eslint-disable-next-line no-unused-vars
  UserModel,
} from '../types/Types';

// eslint-disable-next-line import/prefer-default-export
export function createDefaultUser(): UserModel {
  const uid = uuidv4();
  return {
    _uiId: uid,
    firstname: '',
    name: '',
    email: '',
    password: '',
    imageFolder: '',
    imageFolderSizeInByte: 0,
    imageFolderSizeLimitInByte: 0,
    forbidUploadingImage: false,
    forbidCreatingAsset: false,
    token: '',
    privacyPolicyAccepted: false,
  };
}
