package com.pixelmart.catalog.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.catalog.domain.AnalyticsEvent;
import com.pixelmart.catalog.domain.AnalyticsEventType;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.dto.AnalyticsEventRequest;
import com.pixelmart.catalog.dto.ProductHighlightItem;
import com.pixelmart.catalog.exception.BadRequestException;
import com.pixelmart.catalog.repository.AnalyticsEventRepository;
import com.pixelmart.catalog.security.CurrentUser;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsEventService {

  private static final TypeReference<List<ProductHighlightItem>> HIGHLIGHT_LIST_TYPE =
      new TypeReference<>() {};

  private final AnalyticsEventRepository analyticsEventRepository;
  private final ObjectMapper objectMapper;

  public AnalyticsEventService(
      AnalyticsEventRepository analyticsEventRepository, ObjectMapper objectMapper) {
    this.analyticsEventRepository = analyticsEventRepository;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public void record(AnalyticsEventRequest request) {
    AnalyticsEventType eventType = parseEventType(request.eventType());
    AnalyticsEvent event = new AnalyticsEvent();
    event.setEventType(eventType.name());
    event.setProductId(normalize(request.productId()));
    event.setSessionId(normalize(request.sessionId()));
    event.setUserId(CurrentUser.userId().orElse(null));
    analyticsEventRepository.save(event);
  }

  public List<ProductHighlightItem> parseHighlights(Product product) {
    if (product.getHighlightsJson() == null || product.getHighlightsJson().isBlank()) {
      return List.of();
    }
    try {
      return objectMapper.readValue(product.getHighlightsJson(), HIGHLIGHT_LIST_TYPE);
    } catch (Exception ex) {
      return List.of();
    }
  }

  public String serializeHighlights(List<ProductHighlightItem> highlights) {
    if (highlights == null || highlights.isEmpty()) {
      return null;
    }
    try {
      return objectMapper.writeValueAsString(highlights);
    } catch (Exception ex) {
      throw new BadRequestException("Invalid highlights payload");
    }
  }

  private AnalyticsEventType parseEventType(String value) {
    try {
      return AnalyticsEventType.valueOf(value.trim().toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new BadRequestException("Invalid analytics event type: " + value);
    }
  }

  private String normalize(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
