package com.pixelmart.notification.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.mail.host")
    JavaMailSender javaMailSender(org.springframework.core.env.Environment env) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(env.getRequiredProperty("spring.mail.host"));
        sender.setPort(env.getProperty("spring.mail.port", Integer.class, 587));
        String username = env.getProperty("spring.mail.username");
        if (username != null && !username.isBlank()) {
            sender.setUsername(username);
        }
        String password = env.getProperty("spring.mail.password");
        if (password != null && !password.isBlank()) {
            sender.setPassword(password);
        }
        return sender;
    }
}
