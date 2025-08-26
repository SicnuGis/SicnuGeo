package com.sicnu.geo.repository;

import com.sicnu.geo.entity.FeatureDocument;
import com.sicnu.geo.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeatureDocumentRepository extends JpaRepository<FeatureDocument, Long> {
    Optional<FeatureDocument> findByProject(Project project);
}