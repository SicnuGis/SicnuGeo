package com.sicnu.geo.repository;

import com.sicnu.geo.entity.Comment;
import com.sicnu.geo.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByProjectOrderByCreatedAtDesc(Project project);
}