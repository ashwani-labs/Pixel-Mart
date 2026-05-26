package com.pixelmart.catalog.controller;

import com.pixelmart.catalog.dto.OfferRequests.CreateOfferRequest;
import com.pixelmart.catalog.dto.OfferRequests.UpdateOfferRequest;
import com.pixelmart.catalog.dto.OfferResponse;
import com.pixelmart.catalog.dto.PageResponse;
import com.pixelmart.catalog.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/offers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOfferController {

    private final OfferService offerService;

    public AdminOfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping
    public PageResponse<OfferResponse> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return PageResponse.from(offerService.listAdmin(pageable));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferResponse create(@Valid @RequestBody CreateOfferRequest request) {
        return offerService.create(request);
    }

    @PutMapping("/{id}")
    public OfferResponse update(@PathVariable String id, @Valid @RequestBody UpdateOfferRequest request) {
        return offerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        offerService.delete(id);
    }
}
