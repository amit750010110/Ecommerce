package com.ecommerce.security;

import org.springframework.beans.factory.annotation.Value;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-in-ms}")
    private int jwtExpirationInMs;

    // JWT secret key ko generate karna. HS256 algorithm ke liye minimum 256 bits
    // key chahiye.
    private SecretKey getSigningKey() {
        try {
            return Keys.hmacShaKeyFor(jwtSecret.getBytes());
        } catch (Exception e) {
            logger.error("Failed to generate JWT signing key: {}", e.getMessage());
            throw new RuntimeException("JWT configuration error", e);
        }
    }

    // JWT token generate karna
    public String generateToken(Authentication authentication) {
        try {
            // User principal se username nikal rahe hain
            String username = authentication.getName();
            Date currentDate = new Date();
            Date expiryDate = new Date(currentDate.getTime() + jwtExpirationInMs);

            logger.debug("Generating JWT token for user: {}", username);

            // JWT token banaya ja raha hai
            return Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date())
                    .setExpiration(expiryDate)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            logger.error("Failed to generate JWT token: {}", e.getMessage());
            throw new RuntimeException("JWT token generation failed", e);
        }
    }

    // JWT token se username extract karna
    public String getUsernameFromJWT(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String username = claims.getSubject();
            logger.debug("Extracted username from JWT: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("Failed to extract username from JWT: {}", e.getMessage());
            throw new RuntimeException("JWT token parsing failed", e);
        }
    }

    // JWT token validate karna
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);

            logger.debug("JWT token validated successfully");
            return true;
        } catch (SignatureException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.error("Unexpected error during JWT validation: {}", ex.getMessage());
        }

        return false;
    }
}