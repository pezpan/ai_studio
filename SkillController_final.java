package com.promptvault.controller;

import com.promptvault.dto.GeneratePromptRequest;
import com.promptvault.dto.SkillBuildRequest;
import com.promptvault.dto.SkillBuildResult;
import com.promptvault.dto.SkillCreateRequest;
import com.promptvault.dto.SkillDTO;
import com.promptvault.service.SkillBuilderService;
import com.promptvault.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Skills", description = "API para skills")
public class SkillController {
    
    private final SkillService skillService;
    private final SkillBuilderService skillBuilderService;
    
    @GetMapping
    public ResponseEntity<Page<SkillDTO>> getAllSkills(
        @PageableDefault(size = 20, sort = "usageCount", direction = Sort.Direction.DESC) Pageable pageable,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String tag
    ) {
        Page<SkillDTO> skills;
        if (category != null && !category.isBlank()) {
            skills = skillService.getSkillsByCategory(category, pageable);
        } else if (tag != null && !tag.isBlank()) {
            skills = skillService.getSkillsByTag(tag, pageable);
        } else {
            skills = skillService.getAllSkills(pageable);
        }
        return ResponseEntity.ok(skills);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SkillDTO> getSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillById(id));
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<SkillDTO>> getPopularSkills() {
        return ResponseEntity.ok(skillService.getPopularSkills());
    }
    
    @PostMapping("/{id}/generate")
    public ResponseEntity<Map<String, String>> generatePrompt(
        @PathVariable Long id,
        @RequestBody GeneratePromptRequest request
    ) {
        String generatedPrompt = skillService.generatePrompt(id, request);
        return ResponseEntity.ok(Map.of("generatedPrompt", generatedPrompt));
    }

    @PostMapping
    @Operation(summary = "Crear una nueva skill")
    public ResponseEntity<SkillDTO> createSkill(@RequestBody SkillCreateRequest request) {
        log.info("=== CONTROLLER: POST /api/skills");
        log.info("=== CONTROLLER: Name={}, Category={}, Parameters={}", request.getName(), request.getCategory(), request.getParameters());
        try {
            SkillDTO created = skillService.createSkillFromBuilder(request);
            log.info("=== CONTROLLER: Skill created with ID: {}", created.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("=== CONTROLLER: Error creating skill: {}", e.getMessage(), e);
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/build")
    @Operation(summary = "Generar skill con IA")
    public ResponseEntity<SkillBuildResult> buildSkill(@Valid @RequestBody SkillBuildRequest request) {
        log.info("=== CONTROLLER: POST /api/skills/build - objective={}", request.getObjective());
        try {
            SkillBuildResult result = skillBuilderService.buildSkill(request);
            log.info("=== CONTROLLER: Skill generated - name={}", result.getSkill().getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("=== CONTROLLER: Error building skill: {}", e.getMessage(), e);
            e.printStackTrace();
            throw e;
        }
    }
}
