package com.pixelmart.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase("admin@pixelmart.local")) {
            return;
        }
        User admin = new User();
        admin.setEmail("admin@pixelmart.local");
        admin.setName("PixelMart Admin");
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRoles(Set.of(Role.ADMIN));
        userRepository.save(admin);
    }

    @Test
    void registerReturnsAccessToken() throws Exception {
        String email = "user-" + UUID.randomUUID() + "@pixelmart.local";
        Map<String, String> body = Map.of(
                "email", email,
                "password", "Password1!",
                "name", "Integration User"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void loginWithSeededAdminReturnsAccessToken() throws Exception {
        Map<String, String> body = Map.of(
                "email", "admin@pixelmart.local",
                "password", "Admin@123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.roles[0]").value("ADMIN"));
    }
}
