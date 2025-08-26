package com.sicnu.geo.controller;

import com.sicnu.geo.entity.Project;
import com.sicnu.geo.enums.ProjectCategory;
import com.sicnu.geo.repository.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:8080"}, allowCredentials = "true")
public class ProjectController {

    private final ProjectRepository repo;

    public ProjectController(ProjectRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Project> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        // 如果有关键词搜索
        if (keyword != null && !keyword.trim().isEmpty()) {
            if (category != null && !category.trim().isEmpty()) {
                try {
                    ProjectCategory cat = ProjectCategory.valueOf(category.toUpperCase());
                    return repo.findByKeywordAndCategory(keyword.trim(), cat);
                } catch (IllegalArgumentException e) {
                    return repo.findByKeyword(keyword.trim());
                }
            } else {
                return repo.findByKeyword(keyword.trim());
            }
        }
        
        // 如果有分类和状态筛选
        if (category != null && !category.trim().isEmpty() && status != null && !status.trim().isEmpty()) {
            try {
                ProjectCategory cat = ProjectCategory.valueOf(category.toUpperCase());
                return repo.findByCategoryAndStatus(cat, status);
            } catch (IllegalArgumentException e) {
                return repo.findAll();
            }
        }
        
        // 如果只有分类筛选
        if (category != null && !category.trim().isEmpty()) {
            try {
                ProjectCategory cat = ProjectCategory.valueOf(category.toUpperCase());
                return repo.findByCategory(cat);
            } catch (IllegalArgumentException e) {
                return repo.findAll();
            }
        }
        
        // 默认返回所有项目
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody Project p) {
        Project saved = repo.save(p);
        return ResponseEntity.created(URI.create("/api/projects/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id, @Valid @RequestBody Project p) {
        return repo.findById(id).map(old -> {
            old.setName(p.getName())
               .setDescription(p.getDescription())
               .setStatus(p.getStatus())
               .setStartDate(p.getStartDate())
               .setEndDate(p.getEndDate())
               .setCreatedAt(p.getCreatedAt())
               .setCenterLng(p.getCenterLng())
               .setCenterLat(p.getCenterLat())
               .setCategory(p.getCategory());
            return ResponseEntity.ok(repo.save(old));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}