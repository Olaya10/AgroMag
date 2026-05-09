package com.agromag.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

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
				.route("finca-service-fincas", r -> r.path("/api/fincas/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8081"))
				.route("finca-service-lotes", r -> r.path("/api/lotes/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8081"))
				.route("finca-service-cultivos", r -> r.path("/api/cultivos/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8081"))
				.route("finca-service-riegos", r -> r.path("/api/riegos/**")
						.filters(f -> f.stripPrefix(1))
						.uri("http://localhost:8081"))
				.route("inventory-service", r -> r.path("/api/inventory/**")
						.filters(f -> f.stripPrefix(2))
						.uri("http://localhost:8082"))
				.build();
	}

	@Bean
	public CorsWebFilter corsWebFilter() {
		CorsConfiguration corsConfig = new CorsConfiguration();
		corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
		corsConfig.setMaxAge(3600L);
		corsConfig.addAllowedMethod("*");
		corsConfig.addAllowedHeader("*");
		corsConfig.addExposedHeader("x-auth-token");
		corsConfig.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", corsConfig);

		return new CorsWebFilter(source);
	}
}