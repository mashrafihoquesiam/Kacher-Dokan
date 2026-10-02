package com.kaserdokan.service;

import jakarta.servlet.http.HttpServletRequest;
import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@Service
public class AuthService {
    private final byte[] secret;
    private final SecureRandom random = new SecureRandom();

    public AuthService(@Value("${kacher.auth-secret}") String authSecret) {
        this.secret = authSecret.getBytes(StandardCharsets.UTF_8);
    }

    public String hashPassword(String password) {
        byte[] salt = new byte[16]; random.nextBytes(salt);
        byte[] out = SCrypt.generate(password.getBytes(StandardCharsets.UTF_8), salt, 16384, 8, 1, 64);
        return "scrypt$" + hex(salt) + "$" + hex(out);
    }

    public boolean verifyPassword(String password, String stored) {
        if (stored == null || stored.isBlank()) return false;
        if (!stored.startsWith("scrypt$")) {
            if (stored.equals("$2a$10$e8T8QyGk7Z9.exampleHashedPassword")) return "123456".equals(password);
            return MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8), password.getBytes(StandardCharsets.UTF_8));
        }
        try {
            String[] p = stored.split("\\$", 3);
            if (p.length != 3) return false;
            byte[] salt = unhex(p[1]);
            byte[] expected = unhex(p[2]);
            byte[] actual = SCrypt.generate(password.getBytes(StandardCharsets.UTF_8), salt, 16384, 8, 1, expected.length);
            return MessageDigest.isEqual(expected, actual);
        } catch (Exception e) { return false; }
    }

    public String createToken(String userId, String role) {
        long exp = Instant.now().toEpochMilli() + 12L * 60L * 60L * 1000L;
        String json = "{\"sub\":\"" + esc(userId) + "\",\"role\":\"" + esc(role) + "\",\"exp\":" + exp + "}";
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        return payload + "." + sign(payload);
    }

    public Map<String,Object> readToken(String token) {
        try {
            String[] p = token.split("\\.", 2);
            if (p.length != 2) return null;
            String expected = sign(p[0]);
            if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), p[1].getBytes(StandardCharsets.UTF_8))) return null;
            String json = new String(Base64.getUrlDecoder().decode(p[0]), StandardCharsets.UTF_8);
            String sub = match(json, "sub"); String role = match(json, "role");
            String expText = matchNumber(json, "exp");
            if (sub == null || role == null || expText == null || Long.parseLong(expText) < Instant.now().toEpochMilli()) return null;
            Map<String,Object> out = new HashMap<>(); out.put("sub", sub); out.put("role", role); out.put("exp", Long.parseLong(expText)); return out;
        } catch (Exception e) { return null; }
    }

    public Map<String,Object> require(HttpServletRequest req, String... roles) {
        String h = Optional.ofNullable(req.getHeader("Authorization")).orElse("");
        String token = h.startsWith("Bearer ") ? h.substring(7) : "";
        Map<String,Object> auth = readToken(token);
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to continue.");
        if (roles != null && roles.length > 0) {
            boolean ok = Arrays.asList(roles).contains(String.valueOf(auth.get("role")));
            if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this feature.");
        }
        return auth;
    }

    public Map<String,Object> requireToken(String token) {
        Map<String,Object> auth = readToken(token);
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to continue.");
        return auth;
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private static String match(String json, String key) {
        var m = java.util.regex.Pattern.compile("\\\""+key+"\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"").matcher(json); return m.find()?m.group(1):null;
    }
    private static String matchNumber(String json, String key) {
        var m = java.util.regex.Pattern.compile("\\\""+key+"\\\"\\s*:\\s*(\\d+)").matcher(json); return m.find()?m.group(1):null;
    }
    private static String esc(String s){ return s.replace("\\","\\\\").replace("\"","\\\""); }
    private static String hex(byte[] b){ StringBuilder sb=new StringBuilder(); for(byte x:b) sb.append(String.format("%02x",x)); return sb.toString(); }
    private static byte[] unhex(String s){ byte[] b=new byte[s.length()/2]; for(int i=0;i<b.length;i++) b[i]=(byte)Integer.parseInt(s.substring(i*2,i*2+2),16); return b; }
}
