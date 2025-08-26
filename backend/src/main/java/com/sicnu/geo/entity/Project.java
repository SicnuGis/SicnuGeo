package com.sicnu.geo.entity;

import com.sicnu.geo.enums.ProjectCategory;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String status; // notStarted, inProgress, completed, delayed

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate createdAt;

    // 项目分类
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ProjectCategory category;

    // 地图预览中心点（可选）
    private Double centerLng; // 经度
    private Double centerLat; // 纬度

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public Project setName(String name) { this.name = name; return this; }

    public String getDescription() { return description; }
    public Project setDescription(String description) { this.description = description; return this; }

    public String getStatus() { return status; }
    public Project setStatus(String status) { this.status = status; return this; }

    public LocalDate getStartDate() { return startDate; }
    public Project setStartDate(LocalDate startDate) { this.startDate = startDate; return this; }

    public LocalDate getEndDate() { return endDate; }
    public Project setEndDate(LocalDate endDate) { this.endDate = endDate; return this; }

    public LocalDate getCreatedAt() { return createdAt; }
    public Project setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; return this; }

    public Double getCenterLng() { return centerLng; }
    public Project setCenterLng(Double centerLng) { this.centerLng = centerLng; return this; }

    public Double getCenterLat() { return centerLat; }
    public Project setCenterLat(Double centerLat) { this.centerLat = centerLat; return this; }

    public ProjectCategory getCategory() { return category; }
    public Project setCategory(ProjectCategory category) { this.category = category; return this; }
}