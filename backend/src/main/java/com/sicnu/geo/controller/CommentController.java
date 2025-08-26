package com.sicnu.geo.controller;

import com.sicnu.geo.entity.Comment;
import com.sicnu.geo.entity.Project;
import com.sicnu.geo.repository.CommentRepository;
import com.sicnu.geo.repository.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/comments")
@CrossOrigin(origins = {"http://localhost:8080"}, allowCredentials = "true")
public class CommentController {

    private final ProjectRepository projectRepo;
    private final CommentRepository commentRepo;

    public CommentController(ProjectRepository projectRepo, CommentRepository commentRepo) {
        this.projectRepo = projectRepo;
        this.commentRepo = commentRepo;
    }

    @GetMapping
    public ResponseEntity<List<Comment>> list(@PathVariable Long projectId) {
        return projectRepo.findById(projectId)
                .map(p -> ResponseEntity.ok(commentRepo.findByProjectOrderByCreatedAtDesc(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Comment> create(@PathVariable Long projectId, @Valid @RequestBody Comment c) {
        return projectRepo.findById(projectId).map(p -> {
            c.setProject(p);
            Comment saved = commentRepo.save(c);
            return ResponseEntity.created(URI.create("/api/projects/" + projectId + "/comments/" + saved.getId()))
                    .body(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}