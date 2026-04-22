package com.agromag.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("auth-service", r -> r.path("/api/auth/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8080"))
				.route("finca-service", r -> r.path("/api/finca/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8081"))
				.route("inventory-service", r -> r.path("/api/inventory/**")
						.filters(f -> f.stripPrefix(2))
						.uri("http://localhost:8082"))
				.build();

	}
}