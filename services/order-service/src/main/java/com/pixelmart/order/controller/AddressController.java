package com.pixelmart.order.controller;

import com.pixelmart.order.dto.AddressDtos.AddressResponse;
import com.pixelmart.order.dto.AddressDtos.PincodeLookupResponse;
import com.pixelmart.order.dto.AddressDtos.UpsertAddressRequest;
import com.pixelmart.order.service.AddressService;
import com.pixelmart.order.service.PincodeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/addresses")
public class AddressController {

    private final AddressService addressService;
    private final PincodeService pincodeService;

    public AddressController(AddressService addressService, PincodeService pincodeService) {
        this.addressService = addressService;
        this.pincodeService = pincodeService;
    }

    @GetMapping("/pincode/{pincode}")
    public PincodeLookupResponse lookupPincode(@PathVariable String pincode) {
        return pincodeService.lookup(pincode);
    }

    @GetMapping
    public List<AddressResponse> list() {
        return addressService.list();
    }

    @GetMapping("/{id}")
    public AddressResponse get(@PathVariable String id) {
        return addressService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse create(@Valid @RequestBody UpsertAddressRequest request) {
        return addressService.create(request);
    }

    @PutMapping("/{id}")
    public AddressResponse update(@PathVariable String id, @Valid @RequestBody UpsertAddressRequest request) {
        return addressService.update(id, request);
    }

    @PatchMapping("/{id}/default")
    public AddressResponse setDefault(@PathVariable String id) {
        return addressService.setDefault(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        addressService.delete(id);
    }
}
