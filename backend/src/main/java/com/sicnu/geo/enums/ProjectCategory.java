package com.sicnu.geo.enums;

public enum ProjectCategory {
    WATER_SUPPLY_DRAINAGE("给排水工程", "water", "#2196F3"),
    ROAD_TRAFFIC("道路交通工程", "road", "#FF9800"),
    MUNICIPAL_UTILITIES("市政公用工程", "utilities", "#4CAF50"),
    ENVIRONMENTAL_SANITATION("环境卫生工程", "environment", "#8BC34A"),
    LANDSCAPE_GREENING("园林绿化工程", "landscape", "#4CAF50"),
    PUBLIC_FACILITIES("公共设施工程", "public", "#9C27B0"),
    WATER_CONSERVANCY("水利工程", "water_conservancy", "#00BCD4");

    private final String displayName;
    private final String iconType;
    private final String color;

    ProjectCategory(String displayName, String iconType, String color) {
        this.displayName = displayName;
        this.iconType = iconType;
        this.color = color;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIconType() {
        return iconType;
    }

    public String getColor() {
        return color;
    }

    public static ProjectCategory fromDisplayName(String displayName) {
        for (ProjectCategory category : values()) {
            if (category.displayName.equals(displayName)) {
                return category;
            }
        }
        return null;
    }
}