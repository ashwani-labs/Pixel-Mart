package com.pixelmart.order.service;

import com.pixelmart.order.domain.Address;
import com.pixelmart.order.dto.AddressDtos.AddressResponse;
import com.pixelmart.order.dto.AddressDtos.UpsertAddressRequest;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.AddressRepository;
import com.pixelmart.order.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final PincodeService pincodeService;

    public AddressService(AddressRepository addressRepository, PincodeService pincodeService) {
        this.addressRepository = addressRepository;
        this.pincodeService = pincodeService;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> list() {
        String userId = CurrentUser.requireUserId();
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AddressResponse get(String id) {
        return AddressResponse.from(findOwned(id));
    }

    @Transactional
    public AddressResponse create(UpsertAddressRequest request) {
        String userId = CurrentUser.requireUserId();
        pincodeService.lookup(request.pincode());
        Address address = map(new Address(), request);
        address.setUserId(userId);
        long count = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).size();
        if (count == 0) {
            address.setDefaultAddress(true);
        } else if (request.isDefault()) {
            addressRepository.clearAllDefaults(userId);
            address.setDefaultAddress(true);
        } else {
            address.setDefaultAddress(false);
        }
        return AddressResponse.from(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse update(String id, UpsertAddressRequest request) {
        String userId = CurrentUser.requireUserId();
        pincodeService.lookup(request.pincode());
        Address address = findOwned(id);
        map(address, request);
        if (request.isDefault()) {
            addressRepository.clearDefaultExcept(userId, id);
            address.setDefaultAddress(true);
        } else if (address.isDefaultAddress()) {
            address.setDefaultAddress(false);
        }
        return AddressResponse.from(addressRepository.save(address));
    }

    @Transactional
    public void delete(String id) {
        Address address = findOwned(id);
        boolean wasDefault = address.isDefaultAddress();
        String userId = address.getUserId();
        addressRepository.delete(address);
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                Address next = remaining.getFirst();
                next.setDefaultAddress(true);
                addressRepository.save(next);
            }
        }
    }

    @Transactional
    public AddressResponse setDefault(String id) {
        String userId = CurrentUser.requireUserId();
        Address address = findOwned(id);
        addressRepository.clearAllDefaults(userId);
        address.setDefaultAddress(true);
        return AddressResponse.from(addressRepository.save(address));
    }

    private Address findOwned(String id) {
        String userId = CurrentUser.requireUserId();
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", id));
    }

    private Address map(Address address, UpsertAddressRequest request) {
        address.setLabel(blankToNull(request.label()));
        address.setFullName(request.fullName().trim());
        address.setPhone(request.phone().trim());
        address.setAddressLine1(request.addressLine1().trim());
        address.setAddressLine2(blankToNull(request.addressLine2()));
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPincode(request.pincode().trim());
        address.setCountry(request.country() == null || request.country().isBlank() ? "India" : request.country().trim());
        address.setPostOfficeName(blankToNull(request.postOfficeName()));
        address.setDefaultAddress(request.isDefault());
        return address;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
