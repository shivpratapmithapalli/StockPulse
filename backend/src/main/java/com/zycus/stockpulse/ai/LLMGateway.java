package com.zycus.stockpulse.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Component
public class LLMGateway {
    
    @Value("${llm.provider}")
    private String provider;
    
    @Value("${llm.api-key:}")
    private String apiKey;
    
    @Value("${llm.model}")
    private String model;
    
    @Value("${llm.base-url}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public String callLLM(String prompt) {
        return switch (provider.toLowerCase()) {
            case "gemini" -> callGemini(prompt);
            case "groq" -> callOpenAICompatible(prompt, baseUrl + "/openai/v1/chat/completions");
            case "ollama" -> callOpenAICompatible(prompt, baseUrl + "/v1/chat/completions");
            case "qwen-cursor" -> callQwenCursor(prompt);
            default -> throw new IllegalStateException("Unknown provider: " + provider);
        };
    }
    
    private String callGemini(String prompt) {
        try {
            String url = String.format("%s/v1beta/models/%s:generateContent?key=%s", baseUrl, model, apiKey);
            
            String requestBody = """
                {
                  "contents": [{
                    "parts": [{
                      "text": "%s"
                    }]
                  }]
                }
                """.formatted(prompt.replace("\"", "\\\""));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }
    
    private String callOpenAICompatible(String prompt, String url) {
        try {
            String requestBody = """
                {
                  "model": "%s",
                  "messages": [{"role": "user", "content": "%s"}],
                  "temperature": 0.7
                }
                """.formatted(model, prompt.replace("\"", "\\\""));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call OpenAI-compatible API", e);
        }
    }
    
    private String callQwenCursor(String prompt) {
        try {
            String url = baseUrl + "/v1/chat/completions";
            
            String requestBody = """
                {
                  "model": "%s",
                  "messages": [{"role": "user", "content": "%s"}]
                }
                """.formatted(model, prompt.replace("\"", "\\\""));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("product", "PC1");
            headers.set("Cookie", "6bf6da0e46dc****2eb5857"); // Replace with actual cookie
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Qwen-Cursor API", e);
        }
    }
}