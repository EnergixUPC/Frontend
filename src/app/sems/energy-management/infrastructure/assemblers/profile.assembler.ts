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

  toRequest(resource: ProfileResource): any {
    return {
      email: resource.email,
      firstName: resource.firstName,
      lastName: resource.lastName,
      phoneNumber: resource.phoneNumber,
      address: resource.address,
      profilePhotoUrl: resource.profilePhotoUrl
    };
  }

}
