package com.ecommerce.common.mapper;

import com.ecommerce.user.dto.AddressDto;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AddressMapper {

  public AddressDto toDto(Address address) {
    if (address == null) {
      return null;
    }

    AddressDto addressDto = new AddressDto();
    addressDto.setId(address.getId());
    addressDto.setFirstName(address.getUser().getFirstname());
    addressDto.setLastName(address.getUser().getLastname());
    addressDto.setStreet(address.getStreet());
    addressDto.setCity(address.getCity());
    addressDto.setState(address.getState());
    addressDto.setZipCode(address.getZipCode());
    addressDto.setCountry(address.getCountry());
    addressDto.setDefault(address.isDefault());
    addressDto.setUserId(address.getUser().getId());

    return addressDto;
  }

  public Address toEntity(AddressDto addressDto, User user) {
    if (addressDto == null) {
      return null;
    }

    Address address = new Address();
    address.setId(addressDto.getId());
    address.setUser(user);
    address.setStreet(addressDto.getStreet());
    address.setCity(addressDto.getCity());
    address.setState(addressDto.getState());
    address.setZipCode(addressDto.getZipCode());
    address.setCountry(addressDto.getCountry());
    address.setDefault(addressDto.isDefault());

    return address;
  }

  public void updateEntityFromDto(AddressDto addressDto, Address address) {
    if (addressDto == null || address == null) {
      return;
    }

    address.setStreet(addressDto.getStreet());
    address.setCity(addressDto.getCity());
    address.setState(addressDto.getState());
    address.setZipCode(addressDto.getZipCode());
    address.setCountry(addressDto.getCountry());
    address.setDefault(addressDto.isDefault());
  }

  public List<AddressDto> toDtoList(List<Address> addresses) {
    if (addresses == null) {
      return null;
    }

    return addresses.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }
}