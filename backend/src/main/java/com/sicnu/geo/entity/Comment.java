package com.sicnu.geo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public Comment setProject(Project project) { this.project = project; return this; }

    public String getContent() { return content; }
    public Comment setContent(String content) { this.content = content; return this; }

    public String getAuthorName() { return authorName; }
    public Comment setAuthorName(String authorName) { this.authorName = authorName; return this; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public Comment setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
}