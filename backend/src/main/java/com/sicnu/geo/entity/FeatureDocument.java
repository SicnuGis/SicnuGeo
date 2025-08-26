package com.sicnu.geo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_features")
public class FeatureDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "project_id", unique = true)
    private Project project;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String content; // 存储 GeoJSON FeatureCollection 原文

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public FeatureDocument setProject(Project project) { this.project = project; return this; }

    public String getContent() { return content; }
    public FeatureDocument setContent(String content) { this.content = content; return this; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public FeatureDocument setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
}