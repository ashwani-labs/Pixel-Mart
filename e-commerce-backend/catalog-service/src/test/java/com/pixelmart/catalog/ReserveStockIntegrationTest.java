package com.pixelmart.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.catalog.domain.Product;
import com.pixelmart.catalog.repository.ProductRepository;
import com.pixelmart.catalog.security.InternalServiceAuthFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReserveStockIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void seedProduct() {
        if (productRepository.existsById("prod-004")) {
            return;
        }
        Product product = new Product();
        product.setId("prod-004");
        product.setCategoryId("cat-electronics");
        product.setName("Mechanical Keyboard");
        product.setSlug("mechanical-keyboard");
        product.setDescription("RGB backlit keyboard");
        product.setBasePrice(new BigDecimal("6499.00"));
        product.setStockQty(45);
        product.setVisible(true);
        product.setFeatured(true);
        productRepository.save(product);
    }

    @Test
    void reserveStockFailsWhenInsufficientStock() throws Exception {
        Map<String, Object> body = Map.of(
                "items", List.of(Map.of("productId", "prod-004", "quantity", 999))
        );

        mockMvc.perform(post("/api/catalog/internal/products/reserve-stock")
                        .header(InternalServiceAuthFilter.INTERNAL_SERVICE_HEADER, "order-service")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Insufficient stock")));
    }
}
