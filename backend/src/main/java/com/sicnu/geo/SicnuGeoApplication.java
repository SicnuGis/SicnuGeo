package com.sicnu.geo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.sicnu.geo.entity.Project;
import com.sicnu.geo.enums.ProjectCategory;
import com.sicnu.geo.repository.ProjectRepository;

import java.time.LocalDate;

@SpringBootApplication
public class SicnuGeoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SicnuGeoApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(ProjectRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Project()
                        .setName("智慧城市建设项目")
                        .setDescription("城市基础设施智能化改造项目")
                        .setStatus("inProgress")
                        .setStartDate(LocalDate.parse("2023-01-15"))
                        .setEndDate(LocalDate.parse("2023-12-31"))
                        .setCreatedAt(LocalDate.parse("2023-01-01"))
                        .setCenterLng(104.0668)
                        .setCenterLat(30.5728)
                        .setCategory(ProjectCategory.PUBLIC_FACILITIES)
                );
                repo.save(new Project()
                        .setName("公共交通优化工程")
                        .setDescription("城市公共交通系统升级与优化")
                        .setStatus("inProgress")
                        .setStartDate(LocalDate.parse("2023-03-01"))
                        .setEndDate(LocalDate.parse("2023-10-31"))
                        .setCreatedAt(LocalDate.parse("2023-02-15"))
                        .setCenterLng(104.1)
                        .setCenterLat(30.6)
                        .setCategory(ProjectCategory.ROAD_TRAFFIC)
                );
                repo.save(new Project()
                        .setName("城市绿化提升计划")
                        .setDescription("城市公园和绿化带建设项目")
                        .setStatus("completed")
                        .setStartDate(LocalDate.parse("2023-02-01"))
                        .setEndDate(LocalDate.parse("2023-08-31"))
                        .setCreatedAt(LocalDate.parse("2023-01-15"))
                        .setCenterLng(104.05)
                        .setCenterLat(30.55)
                        .setCategory(ProjectCategory.LANDSCAPE_GREENING)
                );
                repo.save(new Project()
                        .setName("城市供水管网改造")
                        .setDescription("老旧供水管网更新换代工程")
                        .setStatus("inProgress")
                        .setStartDate(LocalDate.parse("2023-04-01"))
                        .setEndDate(LocalDate.parse("2024-03-31"))
                        .setCreatedAt(LocalDate.parse("2023-03-15"))
                        .setCenterLng(104.08)
                        .setCenterLat(30.58)
                        .setCategory(ProjectCategory.WATER_SUPPLY_DRAINAGE)
                );
                repo.save(new Project()
                        .setName("垃圾分类处理中心")
                        .setDescription("新建垃圾分类收集和处理设施")
                        .setStatus("notStarted")
                        .setStartDate(LocalDate.parse("2023-06-01"))
                        .setEndDate(LocalDate.parse("2024-05-31"))
                        .setCreatedAt(LocalDate.parse("2023-05-01"))
                        .setCenterLng(104.12)
                        .setCenterLat(30.52)
                        .setCategory(ProjectCategory.ENVIRONMENTAL_SANITATION)
                );
                repo.save(new Project()
                        .setName("城市燃气管网扩建")
                        .setDescription("新区燃气管网建设和老区管网改造")
                        .setStatus("inProgress")
                        .setStartDate(LocalDate.parse("2023-05-15"))
                        .setEndDate(LocalDate.parse("2024-02-28"))
                        .setCreatedAt(LocalDate.parse("2023-04-20"))
                        .setCenterLng(104.03)
                        .setCenterLat(30.61)
                        .setCategory(ProjectCategory.MUNICIPAL_UTILITIES)
                );
                repo.save(new Project()
                        .setName("河道综合治理工程")
                        .setDescription("城市内河道疏浚和生态修复项目")
                        .setStatus("inProgress")
                        .setStartDate(LocalDate.parse("2023-03-20"))
                        .setEndDate(LocalDate.parse("2023-11-30"))
                        .setCreatedAt(LocalDate.parse("2023-02-28"))
                        .setCenterLng(104.07)
                        .setCenterLat(30.54)
                        .setCategory(ProjectCategory.WATER_CONSERVANCY)
                );
            }
        };
    }
}