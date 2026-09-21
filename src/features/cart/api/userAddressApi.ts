import http from '@/shared/api/http'

export interface UserAddress {
  userAddressId: string
  recipientName: string
  recipientPhone: string
  addressLine: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
  isDefault: boolean
}

export interface SaveUserAddress {
  recipientName: string
  recipientPhone: string
  addressLine: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
  isDefault: boolean
}

export async function getUserAddresses() {
  const { data } = await http.get<UserAddress[]>('/user-addresses')
  return data
}

export async function createUserAddress(address: SaveUserAddress) {
  const { data } = await http.post<UserAddress>('/user-addresses', address)
  return data
}

export async function updateUserAddress(
  addressId: string,
  address: SaveUserAddress,
) {
  await http.put(`/user-addresses/${addressId}`, address)
}

export async function setDefaultUserAddress(addressId: string) {
  await http.patch(`/user-addresses/${addressId}/default`)
}

export async function deleteUserAddress(addressId: string) {
  await http.delete(`/user-addresses/${addressId}`)
}
