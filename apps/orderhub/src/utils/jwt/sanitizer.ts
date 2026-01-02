import { Owner, PublicOwner } from '@spaceorder/db';

export const getSanitizeOwner = (owner: Owner): PublicOwner => {
  return {
    publicId: owner.publicId,
    email: owner.email,
    name: owner.name,
    phone: owner.phone,
    businessNumber: owner.businessNumber,
    isActive: owner.isActive,
    lastLoginAt: owner.lastLoginAt,
    createdAt: owner.createdAt,
    updatedAt: owner.updatedAt,
  };
};
