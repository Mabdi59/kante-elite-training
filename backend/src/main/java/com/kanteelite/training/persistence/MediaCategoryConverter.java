package com.kanteelite.training.persistence;

import com.kanteelite.training.enums.MediaCategory;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

@Converter
public class MediaCategoryConverter implements AttributeConverter<MediaCategory, String> {

    private static final Logger log = LoggerFactory.getLogger(MediaCategoryConverter.class);

    @Override
    public String convertToDatabaseColumn(MediaCategory attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public MediaCategory convertToEntityAttribute(String dbData) {
        if (!StringUtils.hasText(dbData)) {
            return null;
        }

        try {
            return MediaCategory.valueOf(dbData);
        } catch (IllegalArgumentException ex) {
            log.warn("Ignoring unsupported media category value from database: {}", dbData);
            return null;
        }
    }
}
