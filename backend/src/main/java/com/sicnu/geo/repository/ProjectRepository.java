package com.sicnu.geo.repository;

import com.sicnu.geo.entity.Project;
import com.sicnu.geo.enums.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByCategory(ProjectCategory category);
    
    @Query("SELECT p FROM Project p WHERE p.category = :category AND p.status = :status")
    List<Project> findByCategoryAndStatus(@Param("category") ProjectCategory category, @Param("status") String status);
    
    @Query("SELECT p FROM Project p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Project> findByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Project p WHERE (p.name LIKE %:keyword% OR p.description LIKE %:keyword%) AND p.category = :category")
    List<Project> findByKeywordAndCategory(@Param("keyword") String keyword, @Param("category") ProjectCategory category);
}