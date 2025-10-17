import { KeycloakProfile } from 'keycloak-js';
import { useMemo } from 'react';

export function useNameInitial(userProfile?: KeycloakProfile) {
  const nameInitial = useMemo(() => {
    if (userProfile?.firstName) {
      return userProfile.firstName[0];
    } else if (userProfile?.lastName) {
      return userProfile.lastName[0];
    } else {
      return '';
    }
  }, [userProfile]);

  return nameInitial;
}
