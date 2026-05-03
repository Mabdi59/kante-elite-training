package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FaqItemRequest {

    @NotBlank(message = "Question is required.")
    @Size(max = 220, message = "Question must be 220 characters or less.")
    private String question;

    @NotBlank(message = "Answer is required.")
    @Size(max = 1200, message = "Answer must be 1200 characters or less.")
    private String answer;

    @Size(max = 80, message = "Category must be 80 characters or less.")
    private String category;

    private boolean active = true;

    private boolean featured = false;

    @PositiveOrZero(message = "Display order must be zero or greater.")
    private Integer displayOrder = 0;
}
