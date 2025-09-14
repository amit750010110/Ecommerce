package com.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {
	"com.ecommerce.user.entity",
	"com.ecommerce.catalog.entity",
	"com.ecommerce.cart.entity",
	"com.ecommerce.order.entity"
})
@EnableJpaRepositories(basePackages = {
	"com.ecommerce.user.repository",
	"com.ecommerce.catalog.repository",
	"com.ecommerce.cart.repository",
	"com.ecommerce.order.repository"
})
public class EcommerceAappApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceAappApplication.class, args);
	}

}
