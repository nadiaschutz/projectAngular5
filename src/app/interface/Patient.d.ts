export interface Patient {
  resourceType: string;
  id: string;
  identifier?: (IdentifierEntity)[] | null;
  active: boolean;
  name?: (NameEntity)[] | null;
  gender: string;
  contact?: (ContactEntity)[] | null;
  managingOrganization: OrganizationOrManagingOrganization;
  link?: (LinkEntity)[] | null;
}
export interface IdentifierEntity {
  use: string;
  type: TypeOrRelationshipEntity;
  system: string;
  value: string;
}
export interface TypeOrRelationshipEntity {
  coding?: (CodingEntity)[] | null;
}
export interface CodingEntity {
  system: string;
  code: string;
}
export interface NameEntity {
  use: string;
  family: string;
  given?: (string)[] | null;
}
export interface ContactEntity {
  relationship?: (TypeOrRelationshipEntity)[] | null;
  organization: OrganizationOrManagingOrganization;
}
export interface OrganizationOrManagingOrganization {
  reference: string;
  display: string;
}
export interface LinkEntity {
  other: Other;
  type: string;
}
export interface Other {
  reference: string;
}
