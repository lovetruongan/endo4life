import { v4 } from 'uuid';

export function localUuid() {
  return '_' + v4();
}

export function isLocalUuid(uuid: string) {
  return uuid.startsWith('_');
}
