import { Injectable } from '@angular/core';
import { ProfileResponse } from '../../../energy-management/infrastructure/response/profile.response';
import { ProfileResource } from '../../../energy-management/infrastructure/resources/profile.resource';

@Injectable({
  providedIn: 'root'
})
export class ProfileAssembler {
  toResource(dto: ProfileResponse): ProfileResource {
    return {
      id: dto.id?.toString() ?? '',
      email: dto.email ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      role: dto.role,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      profilePhotoUrl: dto.profilePhotoUrl,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      fullName: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim()
    };
  }

  toRequest(resource: ProfileResource) {
    return {
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email,
      address: resource.address,
      phoneNumber: resource.phoneNumber,
      profilePhotoUrl: resource.profilePhotoUrl
    };
  }
}
