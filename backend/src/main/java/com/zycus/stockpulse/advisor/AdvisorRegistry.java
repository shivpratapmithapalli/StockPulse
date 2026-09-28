package com.zycus.stockpulse.advisor;

import com.zycus.stockpulse.domain.enums.StrategyType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class AdvisorRegistry {
    private final Map<StrategyType, CommerceAdvisor> advisors;
    private StrategyType activeStrategy;
    
    @Autowired
    public AdvisorRegistry(List<CommerceAdvisor> advisorList) {
        this.advisors = new HashMap<>();
        for (CommerceAdvisor advisor : advisorList) {
            advisors.put(advisor.getStrategyType(), advisor);
        }
        this.activeStrategy = StrategyType.RULE_BASED; // Default to rule-based
    }
    
    public CommerceAdvisor getActiveAdvisor() {
        return advisors.get(activeStrategy);
    }
    
    public void setActiveStrategy(StrategyType strategy) {
        if (advisors.containsKey(strategy)) {
            this.activeStrategy = strategy;
        } else {
            throw new IllegalArgumentException("Unsupported strategy: " + strategy);
        }
    }
    
    public Set<StrategyType> getAvailableStrategies() {
        return advisors.keySet();
    }
    
    public StrategyType getActiveStrategy() {
        return activeStrategy;
    }
}