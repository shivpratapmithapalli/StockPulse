package com.zycus.stockpulse.controller;

import com.zycus.stockpulse.advisor.AdvisorRegistry;
import com.zycus.stockpulse.domain.enums.StrategyType;
import com.zycus.stockpulse.dto.StrategySwitchRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class StrategyConfigController {
    
    @Autowired
    private AdvisorRegistry advisorRegistry;
    
    @GetMapping("/strategy")
    public ResponseEntity<Map<String, Object>> getStrategyConfig() {
        Map<String, Object> response = new HashMap<>();
        response.put("activeStrategy", advisorRegistry.getActiveStrategy());
        response.put("availableStrategies", advisorRegistry.getAvailableStrategies());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/strategy")
    public ResponseEntity<Map<String, Object>> setStrategyConfig(@Valid @RequestBody StrategySwitchRequest request) {
        advisorRegistry.setActiveStrategy(request.getStrategy());
        
        Map<String, Object> response = new HashMap<>();
        response.put("activeStrategy", advisorRegistry.getActiveStrategy());
        response.put("message", "Strategy switched successfully without restart.");
        return ResponseEntity.ok(response);
    }
}