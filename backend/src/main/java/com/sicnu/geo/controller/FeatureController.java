package com.sicnu.geo.controller;

import com.sicnu.geo.entity.FeatureDocument;
import com.sicnu.geo.repository.FeatureDocumentRepository;
import com.sicnu.geo.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/projects/{projectId}/features")
@CrossOrigin(origins = {"http://localhost:8080"}, allowCredentials = "true")
public class FeatureController {

    private final ProjectRepository projectRepo;
    private final FeatureDocumentRepository featureRepo;

    public FeatureController(ProjectRepository projectRepo, FeatureDocumentRepository featureRepo) {
        this.projectRepo = projectRepo;
        this.featureRepo = featureRepo;
    }

    @GetMapping
    public ResponseEntity<String> get(@PathVariable Long projectId) {
        return projectRepo.findById(projectId).map(p ->
                featureRepo.findByProject(p)
                        .map(doc -> ResponseEntity.ok(doc.getContent()))
                        .orElse(ResponseEntity.ok("{\"type\":\"FeatureCollection\",\"features\":[]}"))
        ).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<String> save(@PathVariable Long projectId, @RequestBody String body) {
        return projectRepo.findById(projectId).map(p -> {
            FeatureDocument doc = featureRepo.findByProject(p).orElseGet(() -> new FeatureDocument().setProject(p));
            doc.setContent(body);
            doc.setUpdatedAt(LocalDateTime.now());
            featureRepo.save(doc);
            return ResponseEntity.ok(doc.getContent());
        }).orElse(ResponseEntity.notFound().build());
    }
}