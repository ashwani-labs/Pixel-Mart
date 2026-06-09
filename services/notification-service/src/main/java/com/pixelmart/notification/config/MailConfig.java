package com.pixelmart.notification.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    @Bean
    @ConditionalOnExpression(
            "'${spring.mail.username:}'.trim().length() > 0 && '${spring.mail.password:}'.trim().length() > 0"
    )
    JavaMailSender javaMailSender(org.springframework.core.env.Environment env) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(env.getProperty("spring.mail.host", "smtp.gmail.com"));
        sender.setPort(env.getProperty("spring.mail.port", Integer.class, 587));
        sender.setUsername(env.getRequiredProperty("spring.mail.username"));
        sender.setPassword(env.getRequiredProperty("spring.mail.password"));
        return sender;
    }
}
