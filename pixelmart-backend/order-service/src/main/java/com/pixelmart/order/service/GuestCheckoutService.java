package com.pixelmart.order.service;

import com.pixelmart.order.client.GuestSessionResponse;
import com.pixelmart.order.client.AuthClient;
import com.pixelmart.order.domain.Address;
import com.pixelmart.order.dto.AddressDtos.UpsertAddressRequest;
import com.pixelmart.order.dto.CheckoutDtos.GuestCheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.GuestCheckoutResponse;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuestCheckoutService {

    private final AuthClient authClient;
    private final AddressService addressService;
    private final CheckoutService checkoutService;

    public GuestCheckoutService(
            AuthClient authClient,
            AddressService addressService,
            CheckoutService checkoutService
    ) {
        this.authClient = authClient;
        this.addressService = addressService;
        this.checkoutService = checkoutService;
    }

    @Transactional
    public GuestCheckoutResponse checkout(GuestCheckoutRequest request) {
        GuestSessionResponse session = authClient.createGuestSession(request.email(), request.fullName());
        UpsertAddressRequest addressRequest = new UpsertAddressRequest(
                "Checkout",
                request.fullName(),
                request.phone(),
                request.addressLine1(),
                request.addressLine2(),
                request.city(),
                request.state(),
                request.pincode(),
                request.country(),
                request.postOfficeName(),
                true
        );
        Address address = addressService.createForUser(session.userId(), addressRequest);
        OrderResponse order = checkoutService.checkoutForUser(
                session.userId(),
                address,
                request.items(),
                request.paymentMethod(),
                request.couponCode()
        );
        return new GuestCheckoutResponse(
                order,
                session.accessToken(),
                session.expiresIn(),
                session.userId(),
                session.email(),
                session.name()
        );
    }
}
