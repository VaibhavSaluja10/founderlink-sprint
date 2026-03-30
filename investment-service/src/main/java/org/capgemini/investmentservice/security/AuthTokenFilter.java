package org.capgemini.investmentservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String headerAuth = request.getHeader("Authorization");
        String jwt = null;

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            jwt = headerAuth.substring(7);
        }

        try {
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                java.util.List<String> roles = jwtUtils.getRolesFromJwtToken(jwt);
                
                System.out.println("JWT VALID for: " + username + " with roles: " + roles);

                java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = 
                        (roles != null) ? roles.stream()
                        .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                        .collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList();

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                authentication.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                if (jwt != null) System.out.println("JWT VALIDATION FAILED for: " + jwt.substring(0, Math.min(10, jwt.length())));
            }
        } catch (Exception e) {
            System.err.println("Cannot set user authentication: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
