package com.pixelmart.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.order.client.AuthClient;
import com.pixelmart.order.client.AuthUserSnapshot;
import com.pixelmart.order.client.CatalogCartDiscountSnapshot;
import com.pixelmart.order.client.CatalogClient;
import com.pixelmart.order.client.CatalogProductSnapshot;
import com.pixelmart.order.client.CatalogStoreSettings;
import com.pixelmart.order.client.NotificationClient;
import com.pixelmart.order.domain.Address;
import com.pixelmart.order.domain.Cart;
import com.pixelmart.order.domain.CartItem;
import com.pixelmart.order.domain.PincodeCache;
import com.pixelmart.order.repository.AddressRepository;
import com.pixelmart.order.repository.CartItemRepository;
import com.pixelmart.order.repository.CartRepository;
import com.pixelmart.order.repository.PincodeCacheRepository;
import com.pixelmart.order.security.GatewayHeaderAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.comparesEqualTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderIntegrationTest {

    private static final String USER_ID = "11111111-1111-1111-1111-111111111111";
    private static final String PRODUCT_ID = "prod-snapshot-001";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PincodeCacheRepository pincodeCacheRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @MockitoBean
    private CatalogClient catalogClient;

    @MockitoBean
    private AuthClient authClient;

    @MockitoBean
    private NotificationClient notificationClient;

    @BeforeEach
    void seedPincodeCache() {
        pincodeCacheRepository.deleteById("110001");
        PincodeCache cache = new PincodeCache();
        cache.setPincode("110001");
        cache.setPayloadJson("""
                {"pincode":"110001","state":"Delhi","city":"New Delhi","district":"Central Delhi",\
                "postOffices":[{"name":"Connaught Place","branchType":"Sub Post Office",\
                "district":"Central Delhi","block":"New Delhi","state":"Delhi"}]}\
                """);
        cache.setCachedAt(Instant.now());
        pincodeCacheRepository.save(cache);
    }

    @Test
    void pincodeLookupReturnsDelhiDataFor110001() throws Exception {
        mockMvc.perform(get("/api/orders/addresses/pincode/110001")
                        .header(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, USER_ID)
                        .header(GatewayHeaderAuthenticationFilter.ROLES_HEADER, "CUSTOMER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pincode").value("110001"))
                .andExpect(jsonPath("$.state").value("Delhi"))
                .andExpect(jsonPath("$.city").value("New Delhi"))
                .andExpect(jsonPath("$.postOffices[0].name").value("Connaught Place"));
    }

    @Test
    void checkoutWithoutAuthReturns401() throws Exception {
        Map<String, String> body = Map.of(
                "addressId", UUID.randomUUID().toString(),
                "paymentMethod", "MOCK_CARD"
        );

        mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void checkoutSnapshotsProductPricesAtOrderTime() throws Exception {
        seedCartAndAddress();
        stubCatalogClients();

        Map<String, String> body = Map.of(
                "addressId", addressRepository.findAll().get(0).getId(),
                "paymentMethod", "MOCK_CARD"
        );

        mockMvc.perform(post("/api/orders/checkout")
                        .header(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, USER_ID)
                        .header(GatewayHeaderAuthenticationFilter.ROLES_HEADER, "CUSTOMER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subtotal", comparesEqualTo(1700.0)))
                .andExpect(jsonPath("$.items[0].unitPrice", comparesEqualTo(850.0)))
                .andExpect(jsonPath("$.items[0].lineTotal", comparesEqualTo(1700.0)))
                .andExpect(jsonPath("$.items[0].productName").value("Snapshot Hoodie"));
    }

    private void seedCartAndAddress() {
        cartRepository.findByUserId(USER_ID).ifPresent(cart -> cartItemRepository.deleteByCartId(cart.getId()));
        cartRepository.findByUserId(USER_ID).ifPresent(cartRepository::delete);
        addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(USER_ID)
                .forEach(addressRepository::delete);

        Cart cart = new Cart();
        cart.setUserId(USER_ID);
        cart = cartRepository.save(cart);

        CartItem item = new CartItem();
        item.setCartId(cart.getId());
        item.setProductId(PRODUCT_ID);
        item.setProductName("Snapshot Hoodie");
        item.setProductSlug("snapshot-hoodie");
        item.setUnitPrice(new BigDecimal("850.00"));
        item.setQuantity(2);
        cartItemRepository.save(item);

        Address address = new Address();
        address.setUserId(USER_ID);
        address.setLabel("Home");
        address.setFullName("Test Customer");
        address.setPhone("9999999999");
        address.setAddressLine1("12 Connaught Place");
        address.setCity("New Delhi");
        address.setState("Delhi");
        address.setPincode("110001");
        address.setCountry("India");
        address.setDefaultAddress(true);
        addressRepository.save(address);
    }

    private void stubCatalogClients() {
        CatalogProductSnapshot product = new CatalogProductSnapshot(
                PRODUCT_ID,
                "Snapshot Hoodie",
                "snapshot-hoodie",
                new BigDecimal("1000.00"),
                new BigDecimal("850.00"),
                10,
                true,
                false
        );
        when(catalogClient.getProductForCart(eq(PRODUCT_ID), any())).thenReturn(product);
        when(catalogClient.getStoreSettings()).thenReturn(new CatalogStoreSettings(
                true,
                new BigDecimal("18.00"),
                "GST",
                "INR"
        ));
        when(catalogClient.getCartDiscount(any(), any())).thenReturn(new CatalogCartDiscountSnapshot(
                BigDecimal.ZERO.setScale(2),
                null,
                null,
                false
        ));
        doNothing().when(catalogClient).reserveStock(any());
        when(authClient.getUser(USER_ID)).thenReturn(new AuthUserSnapshot(
                USER_ID,
                "customer@pixelmart.local",
                "Test Customer"
        ));
        doNothing().when(notificationClient).sendOrderConfirmation(any());
    }
}
