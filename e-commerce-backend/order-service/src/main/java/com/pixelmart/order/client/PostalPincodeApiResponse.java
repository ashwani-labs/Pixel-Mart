package com.pixelmart.order.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PostalPincodeApiResponse(
        String Message,
        String Status,
        List<PostOffice> PostOffice
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PostOffice(
            String Name,
            String BranchType,
            String District,
            String State,
            String Block
    ) {
    }
}
