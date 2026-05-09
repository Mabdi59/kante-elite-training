package com.kanteelite.training.persistence;

import com.kanteelite.training.enums.MediaCategory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class MediaCategoryConverterTest {

    private final MediaCategoryConverter converter = new MediaCategoryConverter();

    @Test
    void convertToEntityAttribute_returnsNullForUnsupportedValue() {
        assertNull(converter.convertToEntityAttribute("MEDIA_PAGE"));
    }

    @Test
    void convertToEntityAttribute_returnsEnumForSupportedValue() {
        assertEquals(MediaCategory.TRAINING_PHOTO, converter.convertToEntityAttribute("TRAINING_PHOTO"));
    }

    @Test
    void convertToDatabaseColumn_returnsEnumName() {
        assertEquals("MATCH_HIGHLIGHT", converter.convertToDatabaseColumn(MediaCategory.MATCH_HIGHLIGHT));
    }
}
