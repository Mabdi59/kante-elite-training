package com.kanteelite.training.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PlayerProgressNoteRequest {

    @NotBlank(message = "Player email is required")
    @Email(message = "Player email must be a valid email address")
    @Size(max = 150, message = "Player email must be 150 characters or less")
    private String playerEmail;

    @Size(max = 100, message = "Player name must be 100 characters or less")
    private String playerName;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @Size(max = 50, message = "Note type must be 50 characters or less")
    private String noteType;

    @Size(max = 200, message = "Title must be 200 characters or less")
    private String title;

    @NotBlank(message = "Note content is required")
    @Size(max = 5000, message = "Note content must be 5000 characters or less")
    private String content;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private boolean visibleToParent = true;
    private Long bookingId;
}
