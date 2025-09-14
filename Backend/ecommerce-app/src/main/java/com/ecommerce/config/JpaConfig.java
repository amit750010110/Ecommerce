package com.ecommerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class JpaConfig {
    // Entity scanning and repository configuration is now handled in the main application class
    // This avoids any potential conflicts or duplicate scanning configurations
}
