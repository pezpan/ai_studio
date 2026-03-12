package com.promptvault.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCreateRequest {
    private String name;
    private String description;
    
    @JsonAlias("template")  // Acepta "template" o "content" del frontend
    private String content;
    
    private String category;
    private List<String> parameters;
}
