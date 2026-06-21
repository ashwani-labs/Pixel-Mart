package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.AnalyticsEventRequest;
import com.pixelmart.catalog.service.AnalyticsEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/analytics")
public class AnalyticsEventController {

  private final AnalyticsEventService analyticsEventService;

  public AnalyticsEventController(AnalyticsEventService analyticsEventService) {
    this.analyticsEventService = analyticsEventService;
  }

  @PostMapping("/events")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void record(@Valid @RequestBody AnalyticsEventRequest request) {
    analyticsEventService.record(request);
  }
}
