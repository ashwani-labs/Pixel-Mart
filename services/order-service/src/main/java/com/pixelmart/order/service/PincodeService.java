package com.pixelmart.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.order.client.PincodeClientProperties;
import com.pixelmart.order.client.PostalPincodeApiResponse;
import com.pixelmart.order.domain.PincodeCache;
import com.pixelmart.order.dto.AddressDtos.PincodeLookupResponse;
import com.pixelmart.order.dto.AddressDtos.PostOfficeOption;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.PincodeCacheRepository;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class PincodeService {

    private static final java.util.regex.Pattern PIN_PATTERN = java.util.regex.Pattern.compile("^[0-9]{6}$");

    private final PincodeCacheRepository pincodeCacheRepository;
    private final PincodeClientProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PincodeService(
            PincodeCacheRepository pincodeCacheRepository,
            PincodeClientProperties properties,
            RestTemplateBuilder builder,
            ObjectMapper objectMapper
    ) {
        this.pincodeCacheRepository = pincodeCacheRepository;
        this.properties = properties;
        this.restTemplate = builder.build();
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PincodeLookupResponse lookup(String rawPincode) {
        String pincode = normalize(rawPincode);
        return pincodeCacheRepository.findById(pincode)
                .filter(this::isFresh)
                .map(cache -> readCached(cache.getPayloadJson()))
                .orElseGet(() -> fetchAndCache(pincode));
    }

    private PincodeLookupResponse fetchAndCache(String pincode) {
        String url = properties.getApiBaseUrl() + "/pincode/" + pincode;
        try {
            ResponseEntity<List<PostalPincodeApiResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );
            List<PostalPincodeApiResponse> body = response.getBody();
            if (body == null || body.isEmpty()) {
                throw new ResourceNotFoundException("Pincode", pincode);
            }
            PostalPincodeApiResponse entry = body.get(0);
            if (!"Success".equalsIgnoreCase(entry.Status())) {
                throw new ResourceNotFoundException("Pincode", pincode);
            }
            if (entry.PostOffice() == null || entry.PostOffice().isEmpty()) {
                throw new ResourceNotFoundException("Pincode", pincode);
            }
            PincodeLookupResponse lookup = toLookup(pincode, entry.PostOffice());
            persistCache(pincode, lookup);
            return lookup;
        } catch (RestClientException ex) {
            throw new BadRequestException("Pincode lookup service unavailable");
        }
    }

    private void persistCache(String pincode, PincodeLookupResponse lookup) {
        try {
            PincodeCache cache = pincodeCacheRepository.findById(pincode).orElseGet(PincodeCache::new);
            cache.setPincode(pincode);
            cache.setPayloadJson(objectMapper.writeValueAsString(lookup));
            cache.setCachedAt(Instant.now());
            pincodeCacheRepository.save(cache);
        } catch (Exception ex) {
            // Cache write failure should not block lookup
        }
    }

    private PincodeLookupResponse readCached(String json) {
        try {
            return objectMapper.readValue(json, PincodeLookupResponse.class);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid cached pincode data");
        }
    }

    private PincodeLookupResponse toLookup(String pincode, List<PostalPincodeApiResponse.PostOffice> offices) {
        PostalPincodeApiResponse.PostOffice first = offices.get(0);
        List<PostOfficeOption> options = offices.stream()
                .map(o -> new PostOfficeOption(
                        o.Name(),
                        o.BranchType(),
                        o.District(),
                        o.Block(),
                        o.State()
                ))
                .toList();
        String state = first.State() != null ? first.State() : "";
        String district = first.District() != null ? first.District() : "";
        String city = district;
        if (first.Block() != null && !first.Block().isBlank()) {
            city = first.Block();
        }
        return new PincodeLookupResponse(pincode, state, city, district, options);
    }

    private boolean isFresh(PincodeCache cache) {
        Duration ttl = Duration.ofHours(properties.getCacheTtlHours());
        return cache.getCachedAt().plus(ttl).isAfter(Instant.now());
    }

    private String normalize(String raw) {
        if (raw == null) {
            throw new BadRequestException("PIN code is required");
        }
        String pincode = raw.trim();
        if (!PIN_PATTERN.matcher(pincode).matches()) {
            throw new BadRequestException("PIN code must be exactly 6 digits");
        }
        return pincode;
    }
}
