
import { describe, it, expect, vi } from 'vitest';

import { userHasPermission } from '../../src/services/permissionService';

import { db } from '../../src/database/db';


describe('userHasPermission', () => {

  it('returns true when the user has the permission', async () => {
    vi.spyOn(db, 'query').mockResolvedValue({
      rows: [{ '?column?': 1 }]
    } as any);

    const result = await userHasPermission(
      4,
      'create_user'
    );


    expect(result).toBe(true);

  });


  it('returns false when the user does not have the permission', async () => {

    vi.spyOn(db, 'query').mockResolvedValue({
      rows: []
    } as any);


    const result = await userHasPermission(
      4,
      'delete_user'
    );


    expect(result).toBe(false);

  });

});
