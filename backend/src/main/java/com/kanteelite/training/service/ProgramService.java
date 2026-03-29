package com.kanteelite.training.service;

import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;

    public List<ProgramResponse> getAllActivePrograms() {
        return programRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProgramResponse getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
        return toResponse(program);
    }

    public ProgramResponse getProgramBySlug(String slug) {
        Program program = programRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + slug));
        return toResponse(program);
    }

    public Program getProgramEntityById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
    }

    private ProgramResponse toResponse(Program p) {
        List<String> features = p.getFeatures() != null
                ? Arrays.asList(p.getFeatures().split("\\|"))
                : List.of();
        return ProgramResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .shortDescription(p.getShortDescription())
                .price(p.getPrice())
                .priceLabel(p.getPriceLabel())
                .durationMinutes(p.getDurationMinutes())
                .features(features)
                .icon(p.getIcon())
                .whoItsFor(p.getWhoItsFor())
                .displayOrder(p.getDisplayOrder())
                .build();
    }
}
