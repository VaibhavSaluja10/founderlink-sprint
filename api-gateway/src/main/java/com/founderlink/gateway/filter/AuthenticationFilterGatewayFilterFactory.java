package com.founderlink.gateway.filter;

import com.founderlink.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFilterGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthenticationFilterGatewayFilterFactory.Config> {

    public AuthenticationFilterGatewayFilterFactory() {
        super(Config.class);
    }

    public static class Config {
    }

    @Autowired
    private com.founderlink.gateway.config.RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (validator.isSecured.test(exchange.getRequest())) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("Missing authorization header");
                }
                
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
                
                try {
                    // Validate Token Signature and Expiry
                    jwtUtil.validateToken(authHeader);
                    
                    // Extract Method, Path, and Role
                    String requestPath = exchange.getRequest().getURI().getPath();
                    String method = exchange.getRequest().getMethod().name();
                    String role = jwtUtil.getRole(authHeader);

                    if (role == null) {
                        throw new RuntimeException("Role is missing in token");
                    }

                    // Role-Based Authorization Logic
                    if (!role.equals("ROLE_ADMIN")) {
                        boolean isAdminRoute = requestPath.startsWith("/reports") 
                                           || (requestPath.startsWith("/auth/") && method.equals("PUT")) 
                                           || requestPath.contains("/status");
                                           
                        if (isAdminRoute) {
                            throw new RuntimeException("Access Denied: Requires ADMIN Role");
                        } 
                        else if (method.equals("POST") && requestPath.startsWith("/startups")) {
                            if (!role.equals("ROLE_FOUNDER")) {
                                throw new RuntimeException("Access Denied: Requires FOUNDER Role");
                            }
                        } 
                        else if (method.equals("POST") && requestPath.startsWith("/investments")) {
                            if (!role.equals("ROLE_INVESTOR")) {
                                throw new RuntimeException("Access Denied: Requires INVESTOR Role");
                            }
                        }
                        else if (method.equals("POST") && requestPath.startsWith("/teams/invite")) {
                            if (!role.equals("ROLE_FOUNDER")) {
                                throw new RuntimeException("Access Denied: Requires FOUNDER Role");
                            }
                        }
                    }

                } catch (Exception e) {
                    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                    return exchange.getResponse().setComplete();
                }
            }
            return chain.filter(exchange);
        });
    }
}
