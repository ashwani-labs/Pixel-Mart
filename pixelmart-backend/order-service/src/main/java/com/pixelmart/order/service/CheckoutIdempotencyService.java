package com.pixelmart.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.order.domain.CheckoutIdempotency;
import com.pixelmart.order.dto.CheckoutDtos.CheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ConflictException;
import com.pixelmart.order.repository.CheckoutIdempotencyRepository;
import com.pixelmart.order.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
@Service
public class CheckoutIdempotencyService {

    private final CheckoutIdempotencyRepository repository;
    private final CheckoutService checkoutService;
    private final ObjectMapper objectMapper;

    public CheckoutIdempotencyService(
            CheckoutIdempotencyRepository repository,
            CheckoutService checkoutService,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.checkoutService = checkoutService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderResponse checkout(String idempotencyKey, CheckoutRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return checkoutService.checkout(request);
        }

        String normalizedKey = idempotencyKey.trim();
        if (normalizedKey.length() > 128) {
            throw new BadRequestException("Idempotency-Key must be 128 characters or fewer");
        }

        String userId = CurrentUser.requireUserId();
        String requestHash = hashRequest(request);
        var existing = repository.findByUserIdAndIdempotencyKey(userId, normalizedKey);
        if (existing.isPresent()) {
            CheckoutIdempotency record = existing.get();
            if (!record.getRequestHash().equals(requestHash)) {
                throw new ConflictException("Idempotency-Key was already used with a different checkout request");
            }
            return checkoutService.getOrder(record.getOrderId());
        }

        OrderResponse created = checkoutService.checkout(request);
        CheckoutIdempotency record = new CheckoutIdempotency();
        record.setUserId(userId);
        record.setIdempotencyKey(normalizedKey);
        record.setRequestHash(requestHash);
        record.setOrderId(created.id());
        repository.save(record);
        return created;
    }

    private String hashRequest(CheckoutRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (JsonProcessingException | NoSuchAlgorithmException ex) {
            throw new BadRequestException("Unable to process checkout request");
        }
    }
}
