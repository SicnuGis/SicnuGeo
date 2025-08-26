package com.sicnu.geo.controller;

import com.sicnu.geo.enums.ProjectCategory;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:8080"}, allowCredentials = "true")
public class CategoryController {

    @GetMapping
    public List<Map<String, Object>> getAllCategories() {
        return Arrays.stream(ProjectCategory.values())
                .map(category -> {
                    Map<String, Object> categoryMap = new HashMap<>();
                    categoryMap.put("value", category.name());
                    categoryMap.put("label", category.getDisplayName());
                    categoryMap.put("iconType", category.getIconType());
                    categoryMap.put("color", category.getColor());
                    return categoryMap;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/names")
    public List<String> getCategoryNames() {
        return Arrays.stream(ProjectCategory.values())
                .map(ProjectCategory::getDisplayName)
                .collect(Collectors.toList());
    }
}