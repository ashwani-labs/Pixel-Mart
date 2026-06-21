package com.pixelmart.order.client;

import java.util.List;

public record AuthCustomerPageResponse(
    List<AuthCustomerSnapshot> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean last) {}
