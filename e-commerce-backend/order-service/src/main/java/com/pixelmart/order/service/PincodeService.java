package com.pixelmart.order.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.order.client.PincodeClientProperties;
import com.pixelmart.order.client.PostalPincodeApiResponse;
import com.pixelmart.order.domain.PincodeCache;
import com.pixelmart.order.dto.AddressDtos.PincodeLookupResponse;
import com.pixelmart.order.dto.AddressDtos.PostOfficeOption;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.PincodeCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class PincodeService {

    private static final Logger log = LoggerFactory.getLogger(PincodeService.class);
    private static final java.util.regex.Pattern PIN_PATTERN = java.util.regex.Pattern.compile("^[0-9]{6}$");

    private final PincodeCacheRepository pincodeCacheRepository;
    private final PincodeClientProperties properties;
    private final ObjectMapper objectMapper;

    public PincodeService(
            PincodeCacheRepository pincodeCacheRepository,
            PincodeClientProperties properties,
            ObjectMapper objectMapper
    ) {
        this.pincodeCacheRepository = pincodeCacheRepository;
        this.properties = properties;
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
            String responseBody = fetchFromApi(url);
            List<PostalPincodeApiResponse> body = objectMapper.readValue(
                    responseBody,
                    new TypeReference<>() {}
            );
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
        } catch (ResourceNotFoundException | BadRequestException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Pincode lookup service unavailable");
        } catch (Exception ex) {
            log.warn("Pincode lookup failed for {}: {}", pincode, ex.toString());
            throw new BadRequestException("Pincode lookup service unavailable");
        }
    }

    /**
     * api.postalpincode.in serves an expired TLS certificate and closes Java HTTP clients
     * without a response; curl with insecure TLS + HTTP/1.1 is the reliable transport here.
     */
    private String fetchFromApi(String url) throws IOException, InterruptedException {
        ProcessBuilder processBuilder = new ProcessBuilder(
                "curl",
                "-sk",
                "--http1.1",
                "-H", "Accept: application/json",
                "--max-time", "10",
                url
        );
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        String body = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        if (!process.waitFor(15, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IOException("Pincode API request timed out");
        }
        if (process.exitValue() != 0 || body.isBlank()) {
            throw new IOException("Pincode API request failed with exit code " + process.exitValue());
        }
        return body;
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
