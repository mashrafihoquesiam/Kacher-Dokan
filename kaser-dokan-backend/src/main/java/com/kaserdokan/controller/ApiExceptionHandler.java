package com.kaserdokan.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,Object>> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("success",false,"message",Objects.toString(e.getReason(),"Request failed.")));}
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> other(Exception e){e.printStackTrace();return ResponseEntity.status(500).body(Map.of("success",false,"message","Server error.","error",Objects.toString(e.getMessage(),"")));}
}
