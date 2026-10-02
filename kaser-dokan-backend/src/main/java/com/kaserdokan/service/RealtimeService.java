package com.kaserdokan.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RealtimeService {
    private record Client(SseEmitter emitter, String userId, String role) {}
    private final List<Client> clients = new CopyOnWriteArrayList<>();

    public SseEmitter connect(String userId, String role) {
        SseEmitter emitter = new SseEmitter(0L);
        Client client = new Client(emitter, userId, role);
        clients.add(client);
        Runnable cleanup = () -> clients.remove(client);
        emitter.onCompletion(cleanup); emitter.onTimeout(cleanup); emitter.onError(e -> cleanup.run());
        try { emitter.send(SseEmitter.event().name("connected").data(Map.of("userId", userId, "role", role))); }
        catch (IOException e) { cleanup.run(); }
        return emitter;
    }

    public void user(String userId, String event, Object data) { send(c -> Objects.equals(c.userId(), userId), event, data); }
    public void role(String role, String event, Object data) { send(c -> Objects.equals(c.role(), role), event, data); }
    public void all(String event, Object data) { send(c -> true, event, data); }

    private void send(java.util.function.Predicate<Client> target, String event, Object data) {
        for (Client c : clients) {
            if (!target.test(c)) continue;
            try { c.emitter().send(SseEmitter.event().name(event).data(data)); }
            catch (Exception e) { clients.remove(c); try { c.emitter().complete(); } catch(Exception ignored){} }
        }
    }
}
