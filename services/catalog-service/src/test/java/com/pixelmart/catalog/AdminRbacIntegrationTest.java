package com.pixelmart.catalog;

import com.pixelmart.catalog.security.GatewayHeaderAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void customerCannotAccessAuditLog() throws Exception {
        mockMvc.perform(get("/api/admin/audit-log")
                        .header(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, "customer-1")
                        .header(GatewayHeaderAuthenticationFilter.ROLES_HEADER, "CUSTOMER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAuditLog() throws Exception {
        mockMvc.perform(get("/api/admin/audit-log")
                        .header(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, "admin-1")
                        .header(GatewayHeaderAuthenticationFilter.ROLES_HEADER, "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
