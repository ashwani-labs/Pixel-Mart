package com.pixelmart.order.dto;

import com.pixelmart.order.domain.Address;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AddressDtos {

    private AddressDtos() {
    }

    public record AddressResponse(
            String id,
            String label,
            String fullName,
            String phone,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String pincode,
            String country,
            String postOfficeName,
            boolean isDefault
    ) {
        public static AddressResponse from(Address address) {
            return new AddressResponse(
                    address.getId(),
                    address.getLabel(),
                    address.getFullName(),
                    address.getPhone(),
                    address.getAddressLine1(),
                    address.getAddressLine2(),
                    address.getCity(),
                    address.getState(),
                    address.getPincode(),
                    address.getCountry(),
                    address.getPostOfficeName(),
                    address.isDefaultAddress()
            );
        }
    }

    public record UpsertAddressRequest(
            @Size(max = 64) String label,
            @NotBlank @Size(max = 255) String fullName,
            @NotBlank @Size(max = 20) String phone,
            @NotBlank @Size(max = 255) String addressLine1,
            @Size(max = 255) String addressLine2,
            @NotBlank @Size(max = 128) String city,
            @NotBlank @Size(max = 128) String state,
            @NotBlank @Pattern(regexp = "^[0-9]{6}$", message = "PIN must be 6 digits") String pincode,
            @Size(max = 64) String country,
            @Size(max = 255) String postOfficeName,
            boolean isDefault
    ) {
    }

    public record PostOfficeOption(
            String name,
            String branchType,
            String district,
            String block,
            String state
    ) {
    }

    public record PincodeLookupResponse(
            String pincode,
            String state,
            String city,
            String district,
            java.util.List<PostOfficeOption> postOffices
    ) {
    }
}
